import { beforeEach, describe, expect, it, vi } from "vitest";

const getEventsMock = vi.hoisted(() => vi.fn());
vi.mock("./events", () => ({ getEvents: getEventsMock }));
vi.mock("./urlApi", () => ({
  assertSafePublicUrl: vi.fn().mockResolvedValue("https://example.com/"),
  fetchUnstopPreview: vi.fn().mockResolvedValue({ records: [{ id: "u1", title: "AI Hack", details: "Free online AI hackathon", endDate: "2099-01-01", detailUrl: "https://unstop.com/u1" }] }),
  fetchHackClubPreview: vi.fn().mockResolvedValue({ records: [{ id: "h1", name: "Robotics Jam", start: "2099-02-01", website: "https://hackathons.hackclub.com/h1" }] }),
}));

import { HACK2SKILL_PAGE_SIZE_CONFIG, KAGGLE_PAGE_COUNT, KAGGLE_PAGE_SIZE, classifySourceFetchError, dedupeByCanonicalUrl, devpostOrganizerFromUrl, ensureUniqueOpportunityIds, extractDevpostDetailFields, isDevpostEventUrl, normalizeOpportunity, opportunitiesApiHandler, parseDevfolioUpcoming, parseDevfolioUpcomingApi, parseDevpostMarkdown, parseHack2SkillEvents, parseInternshalaHackathons, parseKaggleCompetitions, parseReskillDiscover, resetOpportunitiesCache } from "./opportunities";

describe("Devpost event parsing", () => {
  it("accepts only real Devpost event subdomain URLs", () => {
    expect(isDevpostEventUrl("https://agentic-cinema.devpost.com/")).toBe(true);
    expect(isDevpostEventUrl("https://devpost.com/hackathons")).toBe(false);
    expect(isDevpostEventUrl("https://info.devpost.com/product/devpost-for-teams")).toBe(false);
    expect(isDevpostEventUrl("https://help.devpost.com/article/127")).toBe(false);
  });

  it("parses real event cards with URL, prize pool, participants, dates, mode, and featured state", () => {
    const markdown = "[![Image](https://cdn.example/event.png) ##### Agentic Cinema: The Blockbuster Hackathon Lights. Camera. Code. $75,000 in prizes 6177 participants Jul 27 - Sep 09, 2026 Online](https://agentic-cinema.devpost.com/)";
    const [record] = parseDevpostMarkdown(markdown);
    expect(record).toMatchObject({ title: "Agentic Cinema: The Blockbuster Hackathon", url: "https://agentic-cinema.devpost.com/", prizePool: "$75,000 in prizes", participants: "6177", startDate: "Jul 27 - Sep 09, 2026", mode: "Online" });
  });

  it("extracts organizer and eligibility from a Devpost event detail page", () => {
    expect(extractDevpostDetailFields("Join Google Cloud and our partner ecosystem. Eligibility: Open to students and developers.", "https://agentic-cinema.devpost.com/")).toMatchObject({ organizer: "Google Cloud", eligibility: "Open to students and developers." });
    expect(devpostOrganizerFromUrl("https://youcam-api.devpost.com/")).toBe("YouCam");
    expect(devpostOrganizerFromUrl("https://xprize.devpost.com/")).toBe("XPRIZE");
  });

  it("normalizes tracking-query event links while dropping directory and non-event links", () => {
    const markdown = "[Projects](https://devpost.com/software)\n[Teams](https://info.devpost.com/product/devpost-for-teams)\n[Real](https://real-hack.devpost.com/?ref_content=listing&ref_feature=challenge)";
    expect(parseDevpostMarkdown(markdown).map(record => record.url)).toEqual(["https://real-hack.devpost.com/"]);
  });
});

describe("Hack2Skill event parsing", () => {
  it("uses bounded pagination and keeps only future registration windows", () => {
    expect(HACK2SKILL_PAGE_SIZE_CONFIG).toEqual({ pageSize: 51, maxPages: 4 });
    const records = parseHack2SkillEvents({ data: [
      { _id: "h2s-1", eventUrl: "future-ai", title: "Future AI Sprint", thumbnail: "https://cdn.example/future.webp", registrationEnd: "2099-04-01T18:29:00.000Z", submissionStart: "2099-03-01T09:00:00.000Z", submissionEnd: "2099-04-01T18:29:00.000Z", ticket: "FREE", mode: "VIRTUAL", participation: "Team", flag: "FLAGSHIP" },
      { _id: "h2s-2", eventUrl: "past", title: "Past event", registrationEnd: "2025-01-01T00:00:00.000Z" },
      { _id: "h2s-3", eventUrl: "undated", title: "Undated event" },
    ] }, Date.parse("2026-08-17T00:00:00Z"));
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ id: "h2s-1", title: "Future AI Sprint", url: "https://hack2skill.com/event/future-ai", prizePool: "FREE", mode: "virtual", deadline: "2099-04-01T18:29:00.000Z", logo: "https://cdn.example/future.webp" });
  });
});

describe("Reskilll Discover parsing", () => {
  it("keeps active primary cards while preserving the card-specific fields", () => {
    const html = `<a target="_blank" class="rounded-2xl h-full" href="https://iqoo.reskilll.com/"><div><img src="https://content.reskilll.com/iqoo.webp"><span>In person</span></div><div><div><span>iQOO</span></div><h3>iQOO Hackathon 2026 - City Battles</h3><div><span>Live</span><span>AI</span><span>4 Cities</span></div><div><span><svg class="lucide-calendar"></svg>29 Aug – 27 Sep 2026 · Registrations open</span><span><svg class="lucide-map-pin"></svg>Bengaluru · Pune · Chennai · Hyderabad</span></div><div><span>₹40,00,000</span></div></div></a><a target="_blank" class="rounded-2xl h-full" href="https://reskilll.com/hack/iqoo.reskilll.com"><div><img src="https://content.reskilll.com/duplicate.webp"></div><div><h3>Duplicate summary</h3></div></a><a target="_blank" class="rounded-2xl h-full" href="https://stale.reskilll.com/"><div><img src="https://content.reskilll.com/stale.webp"><span>Hybrid</span></div><div><div><span>Partner</span></div><h3>Stale live event</h3><div><span>Live</span></div><div><span><svg class="lucide-calendar"></svg>15 May – 3 July, 2026 · Phase 2 live</span></div></div></a><a target="_blank" class="rounded-2xl h-full" href="https://closed.reskilll.com/"><div><img src="https://content.reskilll.com/closed.webp"><span>In person</span></div><div><div><span>Reskilll</span></div><h3>Closed event</h3><div><span>Closed</span></div><div><span><svg class="lucide-calendar"></svg>1 Aug – 2 Aug 2026 · Closed</span></div></div></a>`;
    const records = parseReskillDiscover(html, Date.parse("2026-08-17T00:00:00Z"));
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ id: "https://iqoo.reskilll.com/", title: "iQOO Hackathon 2026 - City Battles", organizer: "iQOO", url: "https://iqoo.reskilll.com/", mode: "In person", tags: "Live, AI, 4 Cities", startDate: "29 Aug – 27 Sep 2026 · Registrations open", deadline: "2026-09-27T23:59:59.000Z", location: "Bengaluru · Pune · Chennai · Hyderabad", prizePool: "₹40,00,000", status: "Live" });
  });
});

describe("source error handling", () => {
  describe("Devfolio upcoming parsing", () => {
    it("keeps future opening cards with real event subdomains while excluding already-open listings", () => {
      const markdown = `### [Hackify 3.0](https://hackify-3.devfolio.co/)\nHackathon\nTheme\nNo Restrictions\nOffline\nUpcoming\nOpens 01/09/26\nRemind me\n### [Old hackathon](https://old.devfolio.co/)\nHackathon\nTheme\nAI\nOnline\nUpcoming\nOpens 01/01/26\nRemind me`;
      const records = parseDevfolioUpcoming(markdown, Date.parse("2026-08-17T00:00:00Z"));
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({ id: "https://hackify-3.devfolio.co/", title: "Hackify 3.0", url: "https://hackify-3.devfolio.co/", startDate: "Opens 01/09/26", deadline: "2026-09-01T00:00:00.000Z", mode: "Offline", tags: "No Restrictions, Upcoming", status: "Upcoming" });
    });

    it("parses the verified first-party structured upcoming response and filters entries that are already open", () => {
      const records = parseDevfolioUpcomingApi({ hits: { hits: [{ _source: { uuid: "future", name: "Future Devfolio", type: "HACKATHON", is_online: false, starts_at: "2026-10-01T09:00:00Z", themes: ["AI"], hackathon_setting: { subdomain: "future-devfolio", reg_starts_at: "2026-09-01T00:00:00Z", logo: "https://assets.devfolio.co/logo.png" } } }, { _source: { uuid: "past", name: "Already open", hackathon_setting: { subdomain: "already-open", reg_starts_at: "2026-08-01T00:00:00Z" } } }] } }, Date.parse("2026-08-17T00:00:00Z"));
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({ id: "future", title: "Future Devfolio", url: "https://future-devfolio.devfolio.co/", startDate: "Opens 01/09/26", deadline: "2026-09-01T00:00:00Z", mode: "Offline", tags: "AI, Upcoming", logo: "https://assets.devfolio.co/logo.png" });
    });
  });

  describe("Internshala Hackathons parsing", () => {
    it("keeps future server-rendered cards with their banner, organizer, prize, date, mode, and official details link", () => {
      const html = `<div class="box-wrapper-cat"><div class="box"><div class="featured-image"><img src="https://cdn.example/avishkara.jpg"></div><div class="article-content"><div class="entry-meta-new"><span class="tag tag-category">Hackathons</span><span class="tag prizetag">💵 ₹60,000</span><h2 class="blog-item-head"><a href="https://internshala.com/competitions/avishkara26/">AVISHKARA'26 National-Level Hackathon</a></h2><span>Soundarya Institute, Bengaluru</span></div><div class="meta-author-new">📅 30 Aug 2026 | 🌐 Online | 🏷️ Free</div></div></div></div><div class="box-wrapper-cat"><div class="box"><div class="featured-image"><img src="https://cdn.example/past.jpg"></div><div class="article-content"><div class="entry-meta-new"><span class="tag prizetag">Awards</span><h2 class="blog-item-head"><a href="https://internshala.com/competitions/past/">Past Hackathon</a></h2><span>Past Organizer</span></div><div class="meta-author-new">📅 01 Aug 2026 | 🌐 Online | 🏷️ Free</div></div></div></div>`;
      const records = parseInternshalaHackathons(html, Date.parse("2026-08-17T00:00:00Z"));
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({ id: "https://internshala.com/competitions/avishkara26/", title: "AVISHKARA'26 National-Level Hackathon", organizer: "Soundarya Institute, Bengaluru", url: "https://internshala.com/competitions/avishkara26/", startDate: "30 Aug 2026", deadline: "2026-08-30T23:59:59.000Z", mode: "Online", prizes: "💵 ₹60,000", logo: "https://cdn.example/avishkara.jpg" });
    });
  });

  it("classifies publisher blocks separately from transient failures", () => {
    expect(classifySourceFetchError("HTTP 403")).toBe("blocked");
    expect(classifySourceFetchError("HTTP 405")).toBe("blocked");
    expect(classifySourceFetchError("HTTP 503")).toBe("unavailable");
  });
});

describe("Kaggle competition parsing", () => {
  it("uses bounded pagination settings for the public listing service", () => {
    expect(KAGGLE_PAGE_SIZE).toBe(1000);
    expect(KAGGLE_PAGE_COUNT).toBe(1);
  });

  it("keeps only future-deadline competitions and preserves official URLs, host, prize, teams, tags, and thumbnails", () => {
    const records = parseKaggleCompetitions({ competitions: [
      { id: 133468, competitionName: "arc-prize-2026-arc-agi-3", title: "ARC Prize 2026 - ARC-AGI-3", briefDescription: "Build an AI capable of fluid intelligence", dateEnabled: "2026-07-01T00:00:00Z", deadline: "2026-11-02T23:59:00Z", reward: { id: "USD", quantity: 850000 }, totalTeams: 2362, hostName: "Abstraction and Reasoning Corpus", categories: ["Featured", "Code Competition"], hackathon: false, competitionHostSegmentId: 1 },
      { id: 1, competitionName: "past-comp", title: "Past", deadline: "2025-01-01T00:00:00Z" },
    ], thumbnailImageUrls: { "133468": "https://storage.example/arc.png" } }, Date.parse("2026-08-17T00:00:00Z"));
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ title: "ARC Prize 2026 - ARC-AGI-3", url: "https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3", organizer: "Abstraction and Reasoning Corpus", prizePool: "$850,000", participants: "2362", tags: "Featured, Code Competition", logo: "https://storage.example/arc.png", status: "open" });
  });
});

describe("duplicate opportunity identity", () => {
  it("disambiguates repeated source URLs without dropping records", () => {
    const records = [{ id: "devpost:https://devpost.com/software", title: "A" }, { id: "devpost:https://devpost.com/software", title: "B" }, { id: "devpost:https://devpost.com/hackathons", title: "C" }, { id: "devpost:https://devpost.com/hackathons", title: "D" }];
    const unique = ensureUniqueOpportunityIds(records);
    expect(unique.map(record => record.id)).toEqual(["devpost:https://devpost.com/software", "devpost:https://devpost.com/software#2", "devpost:https://devpost.com/hackathons", "devpost:https://devpost.com/hackathons#2"]);
    expect(unique).toHaveLength(records.length);
  });

  it("deduplicates canonical public detail URLs before normalizing paginated source records", () => {
    const records = dedupeByCanonicalUrl([{ url: "https://internshala.com/competitions/example/" }, { url: "https://internshala.com/competitions/example/?page=2#card" }, { url: "https://internshala.com/competitions/other/" }]);
    expect(records.map(record => record.url)).toEqual(["https://internshala.com/competitions/example/", "https://internshala.com/competitions/other/"]);
  });
});

describe("opportunity normalization", () => {
  it("sanitizes object-shaped geography fields for filters", () => {
    const item = normalizeOpportunity("Demo", "demo", { title: "Object geography", country: { name: "India" }, state: { label: "Tamil Nadu" }, district: { value: "Coimbatore" }, location: { city: "Coimbatore" } });
    expect(item).toMatchObject({ country: "India", state: "Tamil Nadu", district: "Coimbatore", location: "Coimbatore" });
  });

  it("derives cost, mode, domain, location, and links from heterogeneous fields", () => {
    const item = normalizeOpportunity("Demo", "demo", { title: "AI Workshop", description: "Free online machine learning event", city: "Coimbatore", state: "Tamil Nadu", country: "India", url: "https://example.com" });
    expect(item).toMatchObject({ title: "AI Workshop", cost: "free", mode: "online", location: "Coimbatore", state: "Tamil Nadu", country: "India", url: "https://example.com" });
    expect(item.domain).toContain("ai");
  });
});

describe("all-source opportunities endpoint", () => {
  beforeEach(() => { resetOpportunitiesCache(); getEventsMock.mockResolvedValue([{ id: 1, eventName: "Campus Fest", eventType: "Workshop", organizer: "Demo College", startDate: "2099-03-01", endDate: "2099-03-02", eventUrl: "https://knowafest.com/1" }]); vi.stubGlobal("fetch", vi.fn((input: string | URL) => String(input).includes("CompetitionService/ListCompetitions") ? Promise.resolve(new Response(JSON.stringify({ competitions: [{ id: 99, competitionName: "future-kaggle", title: "Future Kaggle Competition", deadline: "2099-12-01T00:00:00Z", reward: { id: "USD", quantity: 5000 }, hostName: "Kaggle", totalTeams: 9 }], thumbnailImageUrls: {} }), { status: 200, headers: { "content-type": "application/json" } })) : String(input).includes("hack2skill.com/api/v1/innovator/public/event/public-list") ? Promise.resolve(new Response(JSON.stringify({ pages: 1, data: [{ _id: "h2s-test", eventUrl: "h2s-test", title: "Hack2Skill Test", registrationEnd: "2099-12-01T00:00:00Z", mode: "VIRTUAL", ticket: "FREE" }] }), { status: 200, headers: { "content-type": "application/json" } })) : Promise.resolve(new Response("<table><tr><th>Name</th></tr><tr><td>Future Challenge</td></tr></table>", { status: 200, headers: { "content-type": "text/html" } })))); });
  it("returns all requested platforms plus KnowAFest with normalized records", async () => {
    let body: any;
    await opportunitiesApiHandler({} as never, { json: (value: unknown) => { body = value; return body; } } as never);
    expect(body.sourceCount).toBe(15);
    expect(body.sources.map((source: any) => source.siteId)).toEqual(expect.arrayContaining(["devpost", "mlh", "hackerearth", "kaggle", "topcoder", "unstop", "dorahacks", "taikai", "hack-club", "challengerocket", "hack2skill", "reskill", "devfolio", "internshala", "knowafest"]));
    expect(body.records.some((record: any) => record.title === "AI Hack" && record.cost === "free")).toBe(true);
    expect(body.records.some((record: any) => record.sourceId === "kaggle" && record.url === "https://www.kaggle.com/competitions/future-kaggle")).toBe(true);
    expect(body.sources.find((source: any) => source.siteId === "kaggle")).toMatchObject({ status: "ok" });
    expect(body.records.some((record: any) => record.sourceId === "knowafest")).toBe(true);
    expect(body.records.some((record: any) => record.sourceId === "hack2skill" && record.url === "https://hack2skill.com/event/h2s-test")).toBe(true);
  });

  it("reports Devfolio and Internshala as live sources when their public cards parse successfully", async () => {
    resetOpportunitiesCache();
    vi.stubGlobal("fetch", vi.fn((input: string | URL) => { const url = String(input); if (url.includes("CompetitionService/ListCompetitions")) return Promise.resolve(new Response(JSON.stringify({ competitions: [], thumbnailImageUrls: {} }), { status: 200, headers: { "content-type": "application/json" } })); if (url.includes("hack2skill.com/api/v1/innovator/public/event/public-list")) return Promise.resolve(new Response(JSON.stringify({ pages: 1, data: [] }), { status: 200, headers: { "content-type": "application/json" } })); if (url.includes("r.jina.ai/http://https://devfolio.co/hackathons/upcoming")) return Promise.resolve(new Response("### [Future Devfolio](https://future.devfolio.co/)\n\nHackathon\n\nTheme\n\nAI\n\nOnline\n\nUpcoming\n\nOpens 01/09/99\n\nRemind me", { status: 200, headers: { "content-type": "text/markdown" } })); if (url.includes("internshala.com/competitions/hackathons")) return Promise.resolve(new Response("<div class=\"box-wrapper-cat\"><div class=\"box\"><div class=\"featured-image\"><img src=\"https://cdn.example/internshala.jpg\"></div><div class=\"article-content\"><div class=\"entry-meta-new\"><span class=\"tag prizetag\">₹5,000</span><h2 class=\"blog-item-head\"><a href=\"https://internshala.com/competitions/future-internshala/\">Future Internshala</a></h2><span>Internshala Host</span></div><div class=\"meta-author-new\">📅 01 Sep 2099 | 🌐 Online | 🏷️ Free</div></div></div></div>", { status: 200, headers: { "content-type": "text/html" } })); return Promise.resolve(new Response("<table><tr><th>Name</th></tr><tr><td>Future Challenge</td></tr></table>", { status: 200, headers: { "content-type": "text/html" } })); }));
    let body: any;
    await opportunitiesApiHandler({} as never, { json: (value: unknown) => { body = value; return body; } } as never);
    expect(body.sources.find((source: any) => source.siteId === "devfolio")).toMatchObject({ status: "ok" });
    expect(body.sources.find((source: any) => source.siteId === "internshala")).toMatchObject({ status: "ok" });
    expect(body.records.some((record: any) => record.sourceId === "devfolio" && record.url === "https://future.devfolio.co/")).toBe(true);
    expect(body.records.some((record: any) => record.sourceId === "internshala" && record.url === "https://internshala.com/competitions/future-internshala/")).toBe(true);
  });

  it("reports Kaggle as unavailable without breaking the rest of the feed when its public listing errors", async () => {
    vi.stubGlobal("fetch", vi.fn((input: string | URL) => String(input).includes("CompetitionService/ListCompetitions") ? Promise.reject(new Error("Kaggle upstream unavailable")) : Promise.resolve(new Response("<table><tr><th>Name</th></tr><tr><td>Future Challenge</td></tr></table>", { status: 200, headers: { "content-type": "text/html" } }))));
    let body: any;
    await opportunitiesApiHandler({} as never, { json: (value: unknown) => { body = value; return body; } } as never);
    expect(body.sources.find((source: any) => source.siteId === "kaggle")).toMatchObject({ status: "unavailable", records: [] });
    expect(body.records.some((record: any) => record.sourceId === "knowafest")).toBe(true);
  });

  it("reports credential-gated Topcoder emptiness as blocked without fabricating records", async () => {
    resetOpportunitiesCache();
    vi.stubGlobal("fetch", vi.fn((input: string | URL) => String(input).includes("CompetitionService/ListCompetitions") ? Promise.resolve(new Response(JSON.stringify({ competitions: [], thumbnailImageUrls: {} }), { status: 200, headers: { "content-type": "application/json" } })) : Promise.resolve(new Response("<html><body></body></html>", { status: 200, headers: { "content-type": "text/html" } }))));
    let body: any;
    await opportunitiesApiHandler({} as never, { json: (value: unknown) => { body = value; return body; } } as never);
    expect(body.sources.find((source: any) => source.siteId === "topcoder")).toMatchObject({ status: "blocked", records: [] });
  });
});
