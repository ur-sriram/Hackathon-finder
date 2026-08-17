import { afterEach, describe, expect, it, vi } from "vitest";
import { buildEventsResponse, parseKnowAFestEvents, scrapeKnowAFestEvents } from "./events";

const html = `
  <html><body>
    <table>
      <tr><th>Start Date</th><th>Fest Name</th><th>Fest Type</th><th>Organiser</th><th>End date</th></tr>
      <tr><td>17 Aug 2026</td><td><a href="/event/ai-conclave">AI CONCLAVE 2026</a></td><td>Entrepreneurship Summit, Conclave</td><td>KPR Institute of Engineering and Technology, Coimbatore</td><td>17 Aug 2026</td></tr>
      <tr><td>20 Aug 2026</td><td>  Five-Day Workshop  </td><td>Workshop</td><td>  Example College  </td><td>22 Aug 2026</td></tr>
    </table>
  </body></html>
`;

afterEach(() => vi.restoreAllMocks());

describe("KnowAFest event parser", () => {
  it("extracts the required fields and resolves event links", () => {
    const result = parseKnowAFestEvents(html);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      startDate: "17 Aug 2026",
      eventName: "AI CONCLAVE 2026",
      eventType: "Entrepreneurship Summit, Conclave",
      organizer: "KPR Institute of Engineering and Technology, Coimbatore",
      endDate: "17 Aug 2026",
      eventUrl: "https://www.knowafest.com/event/ai-conclave",
      sourceUrl: "https://www.knowafest.com/explore/city/Coimbatore",
    });
  });

  it("returns an empty result when the page has no matching event table", () => {
    expect(parseKnowAFestEvents("<main>No events</main>")).toEqual([]);
  });
});

describe("events API contract", () => {
  it("returns the exact structured payload shape", () => {
    const lastSeenAt = new Date("2026-08-15T10:00:00.000Z");
    const payload = buildEventsResponse([{
      id: 7,
      startDate: "17 Aug 2026",
      eventName: "AI CONCLAVE 2026",
      eventType: "Hackathon",
      organizer: "KPR Institute of Engineering and Technology",
      endDate: "17 Aug 2026",
      eventUrl: null,
      sourceUrl: "https://www.knowafest.com/explore/city/Coimbatore",
      lastSeenAt,
    }]);
    expect(payload).toEqual({
      events: expect.arrayContaining([expect.objectContaining({ eventName: "AI CONCLAVE 2026", registrationUrl: null, sourcePageUrl: "https://www.knowafest.com/explore/city/Coimbatore", dataQuality: "directory-only" })]),
      count: 1,
      lastUpdated: lastSeenAt,
      source: "https://www.knowafest.com/explore/city/Coimbatore",
    });
  });
});

describe("KnowAFest refresh fetch", () => {
  it("fetches and parses the source page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));
    const result = await scrapeKnowAFestEvents();
    expect(result).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("knowafest.com/explore/city/Coimbatore"), expect.objectContaining({ headers: expect.any(Object) }));
  });

  it("fails clearly when the source returns an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    await expect(scrapeKnowAFestEvents()).rejects.toThrow("KnowAFest returned HTTP 503");
  });
});
