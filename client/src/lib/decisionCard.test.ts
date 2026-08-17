import { describe, expect, it } from "vitest";
import { cleanOpportunitySummary, conciseDeadline, decisionMeta, decisionTiming, readableDetail } from "./decisionCard";

describe("decision card presentation", () => {
  it("converts source text into a readable summary", () => {
    expect(cleanOpportunitySummary("About the Hackathon: Build a student AI tool &mdash; Registration Period: tomorrow.")).toBe("Build a student AI tool — tomorrow.");
    expect(cleanOpportunitySummary("About the Competition: The Innovator&rsquo;s Court is an Ideathon.")).toBe("The Innovator's Court is an Ideathon.");
    expect(cleanOpportunitySummary("About the Opportunity The Smart India Hackathon supports student teams.")).toBe("The Smart India Hackathon supports student teams.");
  });

  it("uses participant-readable deadline states", () => {
    const now = Date.parse("2026-08-18T00:00:00Z");
    expect(conciseDeadline("2026-08-18T18:00:00Z", "closing-soon", now)).toBe("Closes today");
    expect(conciseDeadline("2026-08-17T18:00:00Z", "closed", now)).toBe("Deadline passed");
  });

  it("does not present an event start as an expired registration deadline", () => {
    const now = Date.parse("2026-08-17T00:00:00Z");
    expect(decisionTiming({ deadline: "", startDate: "2026-08-15T04:00:00Z", endDate: "2026-08-22T20:00:00Z", status: "open" }, now)).toBe("Ends 22 Aug");
    expect(readableDetail("2026-08-21T10:00:00+05:30")).toBe("21 Aug");
  });

  it("hides unknown metadata while retaining decision-relevant values", () => {
    expect(decisionMeta({ mode: "online", location: "", cost: "unknown", domain: "artificial intelligence", dataQuality: "partial" })).toEqual([{ label: "Format", value: "online" }, { label: "Focus", value: "artificial intelligence" }]);
  });
});
