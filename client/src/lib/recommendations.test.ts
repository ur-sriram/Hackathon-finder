import { describe, expect, it } from "vitest";
import { DEFAULT_FINDER_PREFERENCES, rankRecommendations, recommendOpportunity } from "./recommendations";

const base = { title: "AI Build Sprint", description: "Build a student project", skills: "Python, React", domain: "artificial intelligence", tags: "Hackathon", mode: "online", cost: "free", location: "Coimbatore", country: "India", state: "Tamil Nadu", district: "Coimbatore", deadline: "2026-09-10T00:00:00Z", startDate: "", prizes: "₹50,000", prizePool: "₹50,000", type: "Hackathon" };

describe("transparent recommendations", () => {
  it("returns readable reasons and applies the published weighted signals", () => {
    const result = recommendOpportunity(base, { ...DEFAULT_FINDER_PREFERENCES, skills: ["Python"], domains: ["artificial intelligence"], mode: "online", cost: "free", location: "Coimbatore", goals: ["portfolio"] }, Date.parse("2026-08-18T00:00:00Z"));
    expect(result.score).toBeGreaterThan(0.9);
    expect(result.reasons.join(" ")).toContain("Python");
  });

  it("ranks direct matches above mismatched alternatives without hiding explore-all records", () => {
    const ranked = rankRecommendations([base, { ...base, title: "Offline design meetup", skills: "Figma", domain: "design", mode: "offline", cost: "paid", location: "Delhi" }], { ...DEFAULT_FINDER_PREFERENCES, skills: ["Python"], mode: "online" }, Date.parse("2026-08-18T00:00:00Z"));
    expect(ranked[0].item.title).toBe("AI Build Sprint");
    expect(ranked).toHaveLength(2);
  });
});
