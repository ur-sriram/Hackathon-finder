import { describe, expect, it } from "vitest";
import { filterFeedRecords, mergeFeedRecords } from "../client/src/lib/feed";

describe("merged All/Unstop/KnowAFest feed", () => {
  const unstop = [{ id: "u1", title: "AI Hackathon", organizer: "Unstop College", type: "Hackathon", detailUrl: "https://unstop.com/hackathons/ai" }];
  const knowafest = [{ id: 4, eventName: "Campus Workshop", eventType: "Workshop", organizer: "KPR Institute", startDate: "2026-09-01", endDate: "2026-09-02", eventUrl: null }];

  it("merges both sources with accurate total counts", () => {
    const merged = mergeFeedRecords(unstop, knowafest);
    expect(merged).toHaveLength(2);
    expect(merged.filter(item => item.source === "Unstop")).toHaveLength(1);
    expect(merged.filter(item => item.source === "KnowAFest")).toHaveLength(1);
  });

  it("supports All, Unstop, and KnowAFest tabs with search", () => {
    const merged = mergeFeedRecords(unstop, knowafest);
    expect(filterFeedRecords(merged, "All", "college")).toHaveLength(1);
    expect(filterFeedRecords(merged, "Unstop", "ai")).toHaveLength(1);
    expect(filterFeedRecords(merged, "KnowAFest", "hackathon")).toHaveLength(0);
  });

  it("reflects new records after a manual refresh payload replaces the old payload", () => {
    const initial = mergeFeedRecords(unstop, knowafest);
    const refreshed = mergeFeedRecords([...unstop, { id: "u2", title: "Cloud Challenge", organizer: "Tech University", type: "Hackathon", detailUrl: "https://unstop.com/hackathons/cloud" }], knowafest);
    expect(initial).toHaveLength(2);
    expect(refreshed).toHaveLength(3);
    expect(refreshed.some(item => item.title === "Cloud Challenge")).toBe(true);
  });
});
