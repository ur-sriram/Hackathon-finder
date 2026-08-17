import crypto from "node:crypto";
import dns from "node:dns/promises";
import net from "node:net";
import type { Request, Response } from "express";
import { load } from "cheerio";
import { chromium, type Browser } from "playwright-core";
import { eq } from "drizzle-orm";
import { apiSources } from "../drizzle/schema";
import { getDb } from "./db";

const MAX_HTML_BYTES = 2_000_000;
const FETCH_TIMEOUT_MS = 45_000;
const PRIVATE_HOSTS = new Set(["localhost", "localhost.localdomain"]);
let browserPromise: Promise<Browser> | null = null;

export type FieldMap = Record<string, number>;
const UNSTOP_API_SELECTOR = "__unstop_public_api__";

function isUnstopHackathonsUrl(rawUrl: string) {
  try { const parsed = new URL(rawUrl); return parsed.hostname === "unstop.com" && parsed.pathname.replace(/\/$/, "") === "/hackathons"; } catch { return false; }
}

function isHackClubUrl(rawUrl: string) {
  try { const parsed = new URL(rawUrl); return parsed.hostname === "hackathons.hackclub.com"; } catch { return false; }
}

export async function fetchHackClubPreview(rawUrl: string, fieldMap?: FieldMap) {
  await assertSafePublicUrl(rawUrl);
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch("https://hackathons.hackclub.com/api/events/upcoming", { signal: controller.signal, headers: { accept: "application/json", "user-agent": "Coimbatore Events API Builder/1.0" } });
    if (!response.ok) throw new Error(`Hack Club API returned HTTP ${response.status}`);
    const payload = await response.json() as Array<Record<string, unknown>>;
    const headers = ["id", "name", "website", "start", "end", "city", "state", "country", "virtual", "hybrid", "logo", "banner", "source"];
    const defaultMap = Object.fromEntries(headers.map((header, index) => [header, index]));
    const mapping = fieldMap || defaultMap;
    const records = filterUpcomingRecords(payload, item => [item.start, item.end]).map(item => {
      const values = [clean(item.id), clean(item.name), clean(item.website), clean(item.start), clean(item.end), clean(item.city), clean(item.state), clean(item.country), clean(item.virtual), clean(item.hybrid), clean(item.logo), clean(item.banner), "Hack Club Hackathons"];
      return Object.fromEntries(Object.entries(mapping).map(([key, index]) => [key, values[index] ?? ""]));
    }).filter(item => Object.values(item).some(Boolean));
    return { sourceUrl: "https://hackathons.hackclub.com/api/events/upcoming", contractVersion: "hack-club-v1", headers, records, totalDetected: records.length, totalAvailable: records.length, pageCount: 1, rowSelector: "__hack_club_public_api__", fieldMap: mapping, attribution: "Credit Hack Club Hackathons with a link to https://hackathons.hackclub.com/" };
  } finally { clearTimeout(timeout); }
}

export async function fetchUnstopPreview(rawUrl: string, fieldMap?: FieldMap) {
  await assertSafePublicUrl(rawUrl);
  const endpoint = "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page={page}&per_page=18&oppstatus=open&sortBy=&orderBy=&filter_condition=&undefined=true";
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const headersForRequest = { accept: "application/json", "user-agent": "Coimbatore Events API Builder/1.0" };
    const firstResponse = await fetch(endpoint.replace("{page}", "1"), { signal: controller.signal, headers: headersForRequest });
    if (!firstResponse.ok) throw new Error(`Unstop API returned HTTP ${firstResponse.status}`);
    const firstPayload = await firstResponse.json() as { data?: { data?: Array<Record<string, any>>; last_page?: number; total?: number } };
    const pageCount = Math.min(Math.max(Number(firstPayload.data?.last_page || 1), 1), 20);
    const remainingPages = await Promise.all(Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => index + 2).map(async page => {
      const response = await fetch(endpoint.replace("{page}", String(page)), { signal: controller.signal, headers: headersForRequest });
      if (!response.ok) throw new Error(`Unstop API returned HTTP ${response.status} on page ${page}`);
      const payload = await response.json() as { data?: { data?: Array<Record<string, any>> } };
      return payload.data?.data || [];
    }));
    const pages = [firstPayload.data?.data || [], ...remainingPages];
    const seen = new Set<string>();
    const items = pages.flat().filter(item => { const key = String(item.id || item.seo_url || item.title); if (seen.has(key)) return false; seen.add(key); return true; });
    const headers = ["id", "title", "description", "organizer", "organizerUrl", "type", "subtype", "mode", "location", "city", "state", "country", "startDate", "endDate", "registrationStart", "registrationDeadline", "teamSize", "eligibility", "skills", "tags", "prizes", "registrationUrl", "detailUrl", "logo", "registrations", "views", "status", "updatedAt"];
    const defaultMap = Object.fromEntries(headers.map((header, index) => [header, index]));
    const mapping = fieldMap || defaultMap;
    const records = filterUpcomingRecords(items, item => [item.start_date, item.end_date, item.regnRequirements?.end_regn_dt]).map(item => {
      const requirements = item.regnRequirements || {};
      const address = item.address_with_country_logo || {};
      const values = [
        clean(item.id), clean(item.title), htmlToText(item.details), clean(item.organisation?.name), clean(item.organisation?.public_url ? `https://unstop.com/${item.organisation.public_url}` : ""), "Hackathon", clean(item.subtype), clean(item.region), clean(item.locations || address.address), clean(address.city), clean(address.state), clean(address.country), clean(item.start_date), clean(item.end_date), clean(requirements.start_regn_dt), clean(requirements.end_regn_dt), `${clean(requirements.min_team_size)}-${clean(requirements.max_team_size)}`.replace(/^-|-$/g, ""), htmlToText(requirements.eligibility), joinNames(item.required_skills), joinNames(item.tags), jsonText(item.prizes), clean(item.short_url || item.seo_url), clean(item.seo_url || (item.public_url ? `https://unstop.com/${item.public_url}` : "")), clean(item.logoUrl2), clean(item.registerCount), clean(item.viewsCount), clean(item.status), clean(item.updated_at),
      ];
      return Object.fromEntries(Object.entries(mapping).map(([key, index]) => [key, values[index] ?? ""]));
    }).filter(item => Object.values(item).some(Boolean));
    return { sourceUrl: "https://unstop.com/hackathons/", contractVersion: "unstop-rich-v2", headers, records, totalDetected: records.length, totalAvailable: firstPayload.data?.total || records.length, pageCount, rowSelector: UNSTOP_API_SELECTOR, fieldMap: mapping };
  } finally { clearTimeout(timeout); }
}

export async function unstopHackathonsHandler(_req: Request, res: Response) {
  try {
    const preview = await fetchUnstopPreview("https://unstop.com/hackathons/");
    return res.json({ source: "Unstop", sourceUrl: preview.sourceUrl, contractVersion: preview.contractVersion, count: preview.records.length, totalAvailable: preview.totalAvailable, pageCount: preview.pageCount, fetchedAt: new Date().toISOString(), records: preview.records });
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : "Unable to fetch Unstop hackathons" });
  }
}

async function loadPreview(rawUrl: string, rowSelector = "table tr", fieldMap?: FieldMap) {
  if (isUnstopHackathonsUrl(rawUrl)) return fetchUnstopPreview(rawUrl, fieldMap);
  if (isHackClubUrl(rawUrl)) return fetchHackClubPreview(rawUrl, fieldMap);
  const fetched = await fetchExtractableHtml(rawUrl, rowSelector);
  return { sourceUrl: fetched.url, ...extractPreview(fetched.html, rowSelector, fieldMap) };
}

function clean(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferred = record.name ?? record.label ?? record.title ?? record.value ?? record.city ?? record.state ?? record.country;
    if (preferred != null && preferred !== value) return clean(preferred);
    return Object.values(record).filter(item => typeof item === "string" || typeof item === "number").map(item => String(item)).join(", ");
  }
  const text = String(value).replace(/\s+/g, " ").trim();
  return text === "[object Object]" ? "" : text;
}

export function filterUpcomingRecords<T>(records: T[], dateValues: (record: T) => unknown[]) {
  return records.filter(record => {
    const timestamps = dateValues(record).map(value => Date.parse(clean(value))).filter(Number.isFinite);
    return timestamps.length > 0 && Math.max(...timestamps) >= Date.now() - 24 * 60 * 60 * 1000;
  });
}

function htmlToText(value: unknown) {
  return clean(String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " "));
}

function jsonText(value: unknown) {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function joinNames(value: unknown) {
  return Array.isArray(value) ? value.map(item => typeof item === "string" ? item : item?.name || item?.tag || item?.title || "").filter(Boolean).join(", ") : clean(value);
}

export async function assertSafePublicUrl(rawUrl: string) {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error("Enter a valid URL including https://"); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported");
  if (parsed.username || parsed.password) throw new Error("URLs with embedded credentials are not allowed");
  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) throw new Error("Private and local network hosts are not allowed");
  const addresses = net.isIP(hostname) ? [hostname] : (await dns.lookup(hostname, { all: true })).map(result => result.address);
  if (!addresses.length || addresses.some(address => isPrivateAddress(address))) throw new Error("The URL must point to a public host");
  return parsed.toString();
}

function isPrivateAddress(address: string) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const normalized = address.toLowerCase();
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:');
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
  }
  return browserPromise;
}

export async function renderPublicHtml(rawUrl: string) {
  const url = await assertSafePublicUrl(rawUrl);
  const targetUrl = /(^|\/)unstop\.com\/hackathons\/?$/i.test(new URL(url).hostname + new URL(url).pathname) ? "https://unstop.com/hackathons?oppstatus=open" : url;
  const browser = await getBrowser();
  const page = await browser.newPage({ javaScriptEnabled: true, userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36" });
  try {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: FETCH_TIMEOUT_MS }).catch(() => undefined);
    await page.waitForURL(/unstop\.com\/hackathons\?oppstatus=open/, { timeout: 20000 }).catch(() => undefined);
    await page.waitForSelector('a[id^="i_"], a[href*="/hackathons/"]', { timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(1000);
    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    if (/captcha|verify you are human|access denied|sign in to continue/.test(bodyText)) throw new Error("The source requires an access challenge or login and cannot be extracted");
    const html = await page.content();
    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) throw new Error("The rendered page is larger than the 2 MB safety limit");
    return { url, html };
  } finally {
    await page.close();
  }
}

export async function fetchExtractableHtml(rawUrl: string, rowSelector = "table tr") {
  const fetched = await fetchPublicHtml(rawUrl);
  try {
    try { if (extractPreview(fetched.html, rowSelector).totalDetected > 0) return fetched; } catch { /* rendered fallback below */ }
  } catch { /* rendered fallback below */ }
  return renderPublicHtml(fetched.url);
}

export async function fetchPublicHtml(rawUrl: string) {
  const url = await assertSafePublicUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'error', headers: { 'user-agent': 'Coimbatore Events API Builder/1.0', accept: 'text/html,application/xhtml+xml' } });
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) throw new Error('The URL did not return an HTML page');
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_HTML_BYTES) throw new Error('The page is larger than the 2 MB safety limit');
    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) throw new Error('The page is larger than the 2 MB safety limit');
    return { url, html };
  } finally { clearTimeout(timeout); }
}

export function extractTablePreview(html: string, rowSelector = 'table tr', fieldMap?: FieldMap) {
  const $ = load(html);
  const rows = $(rowSelector);
  if (!rows.length) throw new Error(`No rows matched selector: ${rowSelector}`);
  const firstCells = rows.first().find('th,td');
  const headers = firstCells.map((_, cell) => clean($(cell).text())).get();
  const mapping = fieldMap || Object.fromEntries(headers.map((header, index) => [header || `field_${index + 1}`, index]));
  const records: Record<string, string>[] = [];
  rows.slice(1).each((_, row) => {
    const cells = $(row).find('td,th');
    if (!cells.length) return;
    const record: Record<string, string> = {};
    for (const [field, index] of Object.entries(mapping)) record[field] = clean($(cells[index]).text());
    if (Object.values(record).some(Boolean)) records.push(record);
  });
  return { headers, records: records.slice(0, 100), totalDetected: records.length, rowSelector, fieldMap: mapping };
}

export function extractCardPreview(html: string, cardSelector = 'a[id^="i_"]', fieldMap?: FieldMap) {
  const $ = load(html);
  const cards = $(cardSelector);
  if (!cards.length) throw new Error(`No cards matched selector: ${cardSelector}`);
  const records = cards.map((_, card) => {
    const element = $(card);
    const text = clean(element.text());
    const href = element.attr('href') || '';
    const title = clean(element.find('h2,h3').first().text()) || text.split(/Posted|days left|month left/i)[0].trim();
    return { title: title.slice(0, 240), details: text.slice(0, 1000), url: href ? new URL(href, 'https://unstop.com').toString() : '' };
  }).get().filter(record => record.title || record.details).slice(0, 100);
  return { headers: ['title', 'details', 'url'], records, totalDetected: records.length, rowSelector: cardSelector, fieldMap: fieldMap || { title: 0, details: 1, url: 2 } };
}

export function extractPreview(html: string, rowSelector = 'table tr', fieldMap?: FieldMap) {
  try {
    const table = extractTablePreview(html, rowSelector, fieldMap);
    if (table.records.length) return table;
  } catch { /* use card fallback */ }
  const selector = rowSelector === 'table tr' ? 'a[id^="i_"]' : rowSelector;
  return extractCardPreview(html, selector, fieldMap);
}

function slugify(value: string) {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'source';
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

export async function previewUrlHandler(req: Request, res: Response) {
  try {
    const { url, rowSelector, fieldMap } = req.body || {};
    const preview = await loadPreview(String(url || ''), String(rowSelector || 'table tr'), fieldMap);
    return res.json(preview);
  } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to preview URL' }); }
}

export async function createSourceHandler(req: Request, res: Response) {
  try {
    const { name, url, rowSelector, fieldMap } = req.body || {};
    if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
    const preview = await loadPreview(String(url), String(rowSelector || 'table tr'), fieldMap);
    const db = await getDb();
    if (!db) throw new Error('Database is not configured');
    const slug = slugify(String(name));
    await db.insert(apiSources).values({ name: String(name).slice(0, 160), slug, sourceUrl: preview.sourceUrl, rowSelector: preview.rowSelector, fieldMap: JSON.stringify(preview.fieldMap), lastPreviewJson: JSON.stringify(preview.records), lastFetchedAt: new Date() });
    return res.status(201).json({ slug, name, sourceUrl: preview.sourceUrl, apiUrl: `/api/generated/${slug}`, preview });
  } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save source' }); }
}

export function buildGeneratedResponse(records: Record<string,string>[], source: string, fetchedAt = new Date()) {
  return { data: records, count: records.length, source, fetchedAt: fetchedAt.toISOString() };
}

export async function generatedSourceHandler(req: Request, res: Response) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database is not configured');
    const source = (await db.select().from(apiSources).where(eq(apiSources.slug, req.params.slug)).limit(1))[0];
    if (!source) return res.status(404).json({ error: 'Saved API source not found' });
    const preview = await loadPreview(source.sourceUrl, source.rowSelector, JSON.parse(source.fieldMap) as FieldMap);
    await db.update(apiSources).set({ lastPreviewJson: JSON.stringify(preview.records), lastFetchedAt: new Date() }).where(eq(apiSources.id, source.id));
    return res.json({ ...buildGeneratedResponse(preview.records, source.sourceUrl), contractVersion: preview.rowSelector === UNSTOP_API_SELECTOR ? "unstop-rich-v2" : "generic-v1" });
  } catch (error) { return res.status(502).json({ error: error instanceof Error ? error.message : 'Unable to fetch saved API source' }); }
}
