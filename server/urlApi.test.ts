import { beforeEach, describe, expect, it, vi } from "vitest";

const getDbMock = vi.hoisted(() => vi.fn());
vi.mock("./db", () => ({ getDb: getDbMock }));

import { assertSafePublicUrl, buildGeneratedResponse, createSourceHandler, extractTablePreview, fetchHackClubPreview, fetchUnstopPreview, filterUpcomingRecords, generatedSourceHandler, previewUrlHandler, unstopHackathonsHandler } from "./urlApi";

const html = `<table><tr><th>Name</th><th>Type</th></tr><tr><td>Demo</td><td>Workshop</td></tr></table>`;
function responseDouble() { const output: { status?: number; body?: unknown } = {}; return { output, response: { status: (code: number) => ({ json: (body: unknown) => { output.status = code; output.body = body; return output; } }), json: (body: unknown) => { output.status = 200; output.body = body; return output; } } }; }

describe("URL-to-API safety", () => {
  it("accepts a public HTTPS URL", async () => { await expect(assertSafePublicUrl("https://www.knowafest.com/explore/city/Coimbatore")).resolves.toContain("knowafest.com"); });
  it("rejects local and private destinations", async () => { await expect(assertSafePublicUrl("http://127.0.0.1:3000/private")).rejects.toThrow("public host"); await expect(assertSafePublicUrl("http://localhost/admin")).rejects.toThrow("Private and local"); });
});

describe("upcoming-only filtering", () => {
  it("removes past and undated records while retaining current/future records", () => {
    const records = filterUpcomingRecords([{ name: "past", date: "2020-01-01" }, { name: "future", date: "2099-01-01" }, { name: "undated", date: "" }], item => [item.date]);
    expect(records.map(item => item.name)).toEqual(["future"]);
  });
});

describe("generic HTML table extraction", () => {
  it("maps header columns to JSON records", () => { const result = extractTablePreview(html); expect(result.headers).toEqual(["Name", "Type"]); expect(result.records).toEqual([{ Name: "Demo", Type: "Workshop" }]); expect(result.totalDetected).toBe(1); });
  it("supports a custom row selector", () => { expect(extractTablePreview(`<div class="items"><div class="row"><span>A</span><span>B</span></div></div>`, ".row").records).toEqual([]); });
});

describe("saved API routes", () => {
  beforeEach(() => { getDbMock.mockReset(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200, headers: { "content-type": "text/html" } }))); });
  it("creates a saved source and returns its generated API path", async () => {
    const inserted: unknown[] = []; const db = { insert: () => ({ values: (value: unknown) => { inserted.push(value); return Promise.resolve(); } }) }; getDbMock.mockResolvedValue(db);
    const { output, response } = responseDouble(); await createSourceHandler({ body: { name: "Demo API", url: "https://example.com/events", rowSelector: "table tr", fieldMap: { title: 0, kind: 1 } } } as never, response as never);
    expect(output.status).toBe(201); expect(output.body).toMatchObject({ name: "Demo API", apiUrl: expect.stringMatching(/^\/api\/generated\//) }); expect(inserted).toHaveLength(1);
  });
  it("returns a 400 response for missing configuration", async () => { const { output, response } = responseDouble(); await createSourceHandler({ body: {} } as never, response as never); expect(output).toEqual({ status: 400, body: { error: "Name and URL are required" } }); });
  it("returns a 404 response for an unknown generated source", async () => { getDbMock.mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }) }); const { output, response } = responseDouble(); await generatedSourceHandler({ params: { slug: "missing" } } as never, response as never); expect(output).toEqual({ status: 404, body: { error: "Saved API source not found" } }); });
  it("returns rich Unstop fields from a saved generated source", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { data: [{ title: "Rich Hackathon", details: "Build something useful", organisation: { name: "Demo College" }, region: "online", end_date: "2026-09-01", seo_url: "https://unstop.com/hackathons/rich-1", regnRequirements: { end_regn_dt: "2026-08-25", min_team_size: 2, max_team_size: 4 }, required_skills: ["React"], prizes: [{ cash: 10000 }] }] } }), { status: 200 }))); const updates = { where: vi.fn() }; getDbMock.mockResolvedValue({ select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ id: 7, sourceUrl: "https://unstop.com/hackathons/", rowSelector: "__unstop_public_api__", fieldMap: JSON.stringify({ title: 1, description: 2, registrationDeadline: 15, teamSize: 16, skills: 18, prizes: 20, detailUrl: 22 }) }] }) }) }), update: () => ({ set: () => updates }) }); const { output, response } = responseDouble(); await generatedSourceHandler({ params: { slug: "rich" } } as never, response as never); expect(output.status).toBe(200); const body = output.body as { data: Record<string, string>[] }; expect(body.data[0]).toMatchObject({ title: "Rich Hackathon", description: "Build something useful", registrationDeadline: "2026-08-25", teamSize: "2-4", skills: "React", prizes: '[{"cash":10000}]', detailUrl: "https://unstop.com/hackathons/rich-1" }); });
});

describe("confirmed source adapters", () => {
  it("normalizes Hack Club API records and excludes past/undated entries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { id: "past", name: "Past", start: "2020-01-01", end: "2020-01-02" },
      { id: "future", name: "Future", start: "2099-01-01", end: "2099-01-02", website: "https://example.com" },
      { id: "undated", name: "Undated" },
    ]), { status: 200, headers: { "content-type": "application/json" } })));
    const result = await fetchHackClubPreview("https://hackathons.hackclub.com/");
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({ id: "future", name: "Future", source: "Hack Club Hackathons" });
    expect(result.contractVersion).toBe("hack-club-v1");
  });

  it("uses the safe generic public-page adapter for a representative Devpost listing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<table><tr><th>Name</th><th>Deadline</th></tr><tr><td>Future Hack</td><td>2099-01-01</td></tr></table>", { status: 200, headers: { "content-type": "text/html" } })));
    const { output, response } = responseDouble();
    await previewUrlHandler({ body: { url: "https://devpost.com/hackathons", rowSelector: "table tr" } } as never, response as never);
    expect(output.status).toBe(200);
    expect(output.body).toMatchObject({ sourceUrl: "https://devpost.com/hackathons", records: [{ Name: "Future Hack", Deadline: "2099-01-01" }] });
  });
});

describe("Unstop public adapter", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { data: [{ title: "Demo Hackathon", organisation: { name: "Demo College" }, region: "online", end_date: "2026-09-01", seo_url: "https://unstop.com/hackathons/demo-1", logoUrl2: "" }] } }), { status: 200, headers: { "content-type": "application/json" } }))); });
  it("normalizes public listing records", async () => { const result = await fetchUnstopPreview("https://unstop.com/hackathons/"); expect(result.records[0]).toMatchObject({ title: "Demo Hackathon", organizer: "Demo College", type: "Hackathon", mode: "online", endDate: "2026-09-01", registrationUrl: "https://unstop.com/hackathons/demo-1", detailUrl: "https://unstop.com/hackathons/demo-1" }); expect(result.headers).toContain("description"); expect(result.headers).toContain("prizes"); });
  it("applies custom JSON field names", async () => { const result = await fetchUnstopPreview("https://unstop.com/hackathons/", { name: 1, host: 3 }); expect(result.records).toEqual([{ name: "Demo Hackathon", host: "Demo College" }]); });
  it("merges all available pages and deduplicates records", async () => { vi.stubGlobal("fetch", vi.fn().mockImplementation(async (input: string) => { const page = new URL(input).searchParams.get("page"); const item = { id: page, title: `Hackathon ${page}`, organisation: { name: "Demo College" }, region: "online", end_date: "2026-09-01", seo_url: `https://unstop.com/hackathons/demo-${page}` }; return new Response(JSON.stringify({ data: { data: [item], last_page: 3, total: 3 } }), { status: 200 }); })); const result = await fetchUnstopPreview("https://unstop.com/hackathons/"); expect(result.records).toHaveLength(3); expect(result.pageCount).toBe(3); expect(result.totalAvailable).toBe(3); });
  it("returns the complete public feed contract", async () => { const { output, response } = responseDouble(); await unstopHackathonsHandler({} as never, response as never); expect(output.status).toBe(200); expect(output.body).toMatchObject({ source: "Unstop", contractVersion: "unstop-rich-v2", count: expect.any(Number), records: expect.any(Array) }); });
});

describe("generated API contract", () => { it("returns data, count, source, and ISO fetchedAt", () => { const result = buildGeneratedResponse([{ title: "Demo" }], "https://example.com", new Date("2026-08-16T08:00:00.000Z")); expect(result).toEqual({ data: [{ title: "Demo" }], count: 1, source: "https://example.com", fetchedAt: "2026-08-16T08:00:00.000Z" }); }); });
