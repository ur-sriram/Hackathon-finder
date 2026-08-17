import crypto from "node:crypto";
import type { Request, Response } from "express";
import { load } from "cheerio";
import { desc, eq } from "drizzle-orm";
import { events, refreshJobs } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { deriveOpportunityStatus, opportunityDataQuality } from "./opportunityTrust";

export const KNOWAFEST_URL = "https://www.knowafest.com/explore/city/Coimbatore";
const REFRESH_JOB_NAME = "knowafest-coimbatore-refresh";
const FETCH_TIMEOUT_MS = 45_000;

export type EventRecord = {
  id: number;
  startDate: string;
  eventName: string;
  eventType: string;
  organizer: string;
  endDate: string;
  eventUrl: string | null;
  sourceUrl: string;
  lastSeenAt: Date;
};

function clean(value: string | undefined | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function makeSourceId(values: string[]) {
  return crypto.createHash("sha1").update(values.join("|").toLowerCase()).digest("hex");
}

function findColumn(headers: string[], patterns: RegExp[]) {
  return headers.findIndex(header => patterns.some(pattern => pattern.test(header)));
}

export function parseKnowAFestEvents(html: string) {
  const $ = load(html);
  const sourceEvents: Array<{
    sourceId: string;
    startDate: string;
    eventName: string;
    eventType: string;
    organizer: string;
    endDate: string;
    eventUrl: string | null;
    sourceUrl: string;
  }> = [];

  $("table").each((_, table) => {
    if (sourceEvents.length > 0) return;
    const rows = $(table).find("tr");
    if (rows.length < 2) return;

    const headers = rows
      .first()
      .find("th,td")
      .map((_, cell) => clean($(cell).text()).toLowerCase())
      .get();
    const startIndex = findColumn(headers, [/start.*date/, /^start$/]);
    const nameIndex = findColumn(headers, [/fest name/, /event name/, /name/]);
    const typeIndex = findColumn(headers, [/fest type/, /event type/, /type/]);
    const organizerIndex = findColumn(headers, [/organis/]);
    const endIndex = findColumn(headers, [/end.*date/, /^end$/]);

    if ([startIndex, nameIndex, typeIndex, organizerIndex, endIndex].some(index => index < 0)) return;

    rows.slice(1).each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < headers.length - 1) return;
      const valueAt = (index: number) => clean($(cells[index]).text());
      const eventName = valueAt(nameIndex);
      const organizer = valueAt(organizerIndex);
      if (!eventName || !organizer) return;
      const eventUrl = $(cells[nameIndex]).find("a").first().attr("href") || null;
      const absoluteEventUrl = eventUrl ? new URL(eventUrl, KNOWAFEST_URL).toString() : null;
      const startDate = valueAt(startIndex);
      const eventType = valueAt(typeIndex) || "Other";
      const endDate = valueAt(endIndex);
      sourceEvents.push({
        sourceId: makeSourceId([startDate, eventName, eventType, organizer, endDate]),
        startDate,
        eventName,
        eventType,
        organizer,
        endDate,
        eventUrl: absoluteEventUrl,
        sourceUrl: KNOWAFEST_URL,
      });
    });
  });

  return sourceEvents;
}

export async function scrapeKnowAFestEvents() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(KNOWAFEST_URL, {
      signal: controller.signal,
      headers: {
        "user-agent": "Coimbatore Events Directory/1.0 (+https://knowafest.com)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) throw new Error(`KnowAFest returned HTTP ${response.status}`);
    const html = await response.text();
    const parsed = parseKnowAFestEvents(html);
    if (parsed.length === 0) throw new Error("No event rows were found on the KnowAFest page");
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshKnowAFestEvents() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const scraped = await scrapeKnowAFestEvents();
  const now = new Date();

  await db.update(events).set({ isActive: false });
  for (const event of scraped) {
    await db.insert(events).values({ ...event, isActive: true, lastSeenAt: now }).onDuplicateKeyUpdate({
      set: {
        startDate: event.startDate,
        eventName: event.eventName,
        eventType: event.eventType,
        organizer: event.organizer,
        endDate: event.endDate,
        eventUrl: event.eventUrl,
        sourceUrl: event.sourceUrl,
        isActive: true,
        lastSeenAt: now,
      },
    });
  }

  await db.update(refreshJobs).set({ lastRunAt: now, lastSuccessAt: now, lastError: null }).where(eq(refreshJobs.name, REFRESH_JOB_NAME));
  return { count: scraped.length, refreshedAt: now };
}

export async function getEvents() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select({
    id: events.id,
    startDate: events.startDate,
    eventName: events.eventName,
    eventType: events.eventType,
    organizer: events.organizer,
    endDate: events.endDate,
    eventUrl: events.eventUrl,
    sourceUrl: events.sourceUrl,
    lastSeenAt: events.lastSeenAt,
  }).from(events).where(eq(events.isActive, true)).orderBy(desc(events.lastSeenAt), events.id);
}

export function buildEventsResponse(data: EventRecord[]) {
  const lastUpdated = data.reduce<Date | null>((latest, event) => {
    if (!latest || event.lastSeenAt > latest) return event.lastSeenAt;
    return latest;
  }, null);
  const eventsWithTrust = data.map(event => {
    const registrationUrl = event.eventUrl;
    const sourcePageUrl = event.sourceUrl;
    const trustInput = { registrationUrl: registrationUrl ?? undefined, eventUrl: event.eventUrl ?? undefined, sourcePageUrl, startDate: event.startDate, endDate: event.endDate, location: "Coimbatore, Tamil Nadu, India" };
    return { ...event, registrationUrl, sourcePageUrl, status: deriveOpportunityStatus(trustInput), dataQuality: opportunityDataQuality(trustInput) };
  });
  return {
    events: eventsWithTrust,
    count: data.length,
    lastUpdated,
    source: KNOWAFEST_URL,
  };
}

export async function eventsApiHandler(_req: Request, res: Response) {
  try {
    let data = await getEvents();
    if (data.length === 0) {
      await refreshKnowAFestEvents();
      data = await getEvents();
    }
    return res.json(buildEventsResponse(data));
  } catch (error) {
    console.error("[Events] API error", error);
    return res.status(502).json({ error: "Unable to load Coimbatore events", source: KNOWAFEST_URL });
  }
}

export async function scheduledEventsRefreshHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database is not configured" });
    const job = (await db.select().from(refreshJobs).where(eq(refreshJobs.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
    if (!job) return res.json({ ok: true, skipped: "orphan" });
    const result = await refreshKnowAFestEvents();
    return res.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown refresh error";
    console.error("[Events] Scheduled refresh failed", error);
    return res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
