import { describe, expect, it } from "vitest";
import { filterFeedRecords, mergeFeedRecords } from "./feed";

describe("combined public feed", () => {
  const unstop = [{ id: "u1", title: "AI Hackathon", organizer: "Unstop College", type: "Hackathon", detailUrl: "https://unstop.com/hackathons/ai" }];
  const knowafest = [{ id: 4, eventName: "Campus Workshop", eventType: "Workshop", organizer: "KPR Institute", startDate: "2026-09-01", endDate: "2026-09-02", eventUrl: null }];

  it("merges records and keeps explicit source labels", () => {
    const merged = mergeFeedRecords(unstop, knowafest);
    expect(merged).toHaveLength(2);
    expect(merged.map(item => item.source)).toEqual(["Unstop", "KnowAFest"]);
    expect(merged.map(item => item.title)).toEqual(["AI Hackathon", "Campus Workshop"]);
  });

  it("filters by source tab and search query", () => {
    const merged = mergeFeedRecords(unstop, knowafest);
    expect(filterFeedRecords(merged, "Unstop", "ai")).toHaveLength(1);
    expect(filterFeedRecords(merged, "KnowAFest", "hackathon")).toHaveLength(0);
    expect(filterFeedRecords(merged, "All", "college")).toHaveLength(1);
  });

  it("returns fresh merged output when new refresh data arrives", () => {
    const first = mergeFeedRecords(unstop, knowafest);
    const refreshed = mergeFeedRecords([...unstop, { id: "u2", title: "Cloud Challenge", organizer: "Tech University", type: "Hackathon", detailUrl: "https://unstop.com/hackathons/cloud" }], knowafest);
    expect(first).toHaveLength(2);
    expect(refreshed).toHaveLength(3);
    expect(refreshed[1]?.title).toBe("Cloud Challenge");
  });
});
