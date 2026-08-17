import { describe, expect, it } from "vitest";
import { filterOpportunities, resetOpportunityFilter, sortOpportunities, type OpportunityLike } from "./opportunities";

const rows: OpportunityLike[] = [
  { title: "AI Build", organizer: "Lab", description: "Free online machine learning", domain: "ai, machine learning", skills: "Python", location: "Coimbatore", sourceId: "devpost", cost: "free", mode: "online", country: "India", state: "Tamil Nadu", district: "Coimbatore", deadline: "2099-01-02", startDate: "2099-01-01", fetchedAt: "2026-01-01" },
  { title: "Design Sprint", organizer: "Studio", description: "Paid campus event", domain: "design", skills: "Figma", location: "Bengaluru", sourceId: "unstop", cost: "paid", mode: "offline", country: "India", state: "Karnataka", district: "Bengaluru", deadline: "2099-02-02", startDate: "2099-02-01", fetchedAt: "2026-01-02" },
  { title: "Hack2Skill Sprint", organizer: "Hack2Skill", description: "Free virtual hackathon", domain: "ai", skills: "AI", location: "", sourceId: "hack2skill", cost: "free", mode: "online", country: "", state: "", district: "", deadline: "2099-03-02", startDate: "2099-03-01", fetchedAt: "2026-01-03" },
  { title: "Reskilll City Battles", organizer: "iQOO", description: "Live AI hackathon", domain: "ai", skills: "", location: "Bengaluru", sourceId: "reskill", cost: "unknown", mode: "offline", country: "India", state: "", district: "Bengaluru", deadline: "2099-09-27", startDate: "2099-08-29", fetchedAt: "2026-01-04" },
  { title: "Future Devfolio", organizer: "Devfolio", description: "Upcoming offline hackathon", domain: "General", skills: "", location: "", sourceId: "devfolio", cost: "unknown", mode: "offline", country: "", state: "", district: "", deadline: "2099-09-01", startDate: "Opens 01/09/99", fetchedAt: "2026-01-05" },
  { title: "Future Internshala", organizer: "Internshala Host", description: "Free online hackathon", domain: "ai", skills: "", location: "Online", sourceId: "internshala", cost: "free", mode: "online", country: "India", state: "", district: "", deadline: "2099-09-01", startDate: "2099-09-01", fetchedAt: "2026-01-06" },
];

describe("opportunity feed helpers", () => {
  it("filters by cost, mode, geography, and domain", () => {
    expect(filterOpportunities(rows, { query: "", source: "All", cost: "free", mode: "online", country: "India", state: "Tamil Nadu", district: "Coimbatore", category: "All", domain: "ai", dateWindow: "All" })).toHaveLength(1);
    expect(filterOpportunities(rows, { query: "", source: "All", cost: "paid", mode: "All", country: "All", state: "All", district: "All", category: "All", domain: "All", dateWindow: "All" })[0].title).toBe("Design Sprint");
  });
  it("filters the dedicated Hack2Skill source without mixing other platforms", () => {
    const result = filterOpportunities(rows, { query: "", source: "hack2skill", cost: "All", mode: "All", country: "All", state: "All", district: "All", category: "All", domain: "All", dateWindow: "All" });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Hack2Skill Sprint");
  });
  it("filters the Reskilll source without mixing other platforms", () => {
    const result = filterOpportunities(rows, { query: "", source: "reskill", cost: "All", mode: "All", country: "All", state: "All", district: "All", category: "All", domain: "All", dateWindow: "All" });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Reskilll City Battles");
  });
  it.each([["devfolio", "Future Devfolio"], ["internshala", "Future Internshala"]])("filters the %s source without mixing other platforms", (source, title) => {
    const result = filterOpportunities(rows, { query: "", source, cost: "All", mode: "All", country: "All", state: "All", district: "All", category: "All", domain: "All", dateWindow: "All" });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe(title);
  });
  it("filters by an upcoming date window", () => {
    const result = filterOpportunities(rows, { query: "", source: "All", cost: "All", mode: "All", country: "All", state: "All", district: "All", category: "All", domain: "All", dateWindow: "week" });
    expect(result.length).toBeLessThanOrEqual(rows.length);
  });
  it("sorts by relevance and deadline", () => {
    expect(sortOpportunities(rows, "relevance", "machine learning")[0].title).toBe("AI Build");
    expect(sortOpportunities(rows, "deadline", "")[0].title).toBe("AI Build");
  });
  it("resets all filter facets to their default state", () => {
    expect(resetOpportunityFilter()).toEqual({ query: "", source: "All", category: "All", cost: "All", mode: "All", country: "All", state: "All", district: "All", domain: "All", dateWindow: "All" });
  });
  it("returns an empty list when filters do not match", () => {
    expect(filterOpportunities(rows, { query: "robotics", source: "All", cost: "All", mode: "All", country: "All", state: "All", district: "All", category: "All", domain: "All", dateWindow: "All" })).toEqual([]);
  });
});
