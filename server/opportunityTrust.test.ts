import { describe, expect, it } from "vitest";
import { deriveOpportunityStatus, isDefaultUpcoming, opportunityDataQuality, primaryOpportunityLink } from "./opportunityTrust";

describe("opportunity trust contract", () => {
  const now = Date.parse("2026-08-18T00:00:00Z");

  it("classifies closed, closing-soon, starting-soon, open, and date-unavailable records deterministically", () => {
    expect(deriveOpportunityStatus({ deadline: "2026-08-17T23:59:59Z" }, now)).toBe("closed");
    expect(deriveOpportunityStatus({ deadline: "2026-08-20T00:00:00Z" }, now)).toBe("closing-soon");
    expect(deriveOpportunityStatus({ startDate: "2026-08-22T00:00:00Z" }, now)).toBe("starting-soon");
    expect(deriveOpportunityStatus({ deadline: "2026-09-01T00:00:00Z" }, now)).toBe("open");
    expect(deriveOpportunityStatus({}, now)).toBe("date-unavailable");
  });

  it("keeps date-unavailable records discoverable but removes closed records from the default feed", () => {
    expect(isDefaultUpcoming({ deadline: "2026-08-17T00:00:00Z" }, now)).toBe(false);
    expect(isDefaultUpcoming({ deadline: "2026-08-17T00:00:00Z", startDate: "2026-09-01T00:00:00Z" }, now)).toBe(false);
    expect(isDefaultUpcoming({}, now)).toBe(true);
  });

  it("separates direct registration, event, and directory actions while exposing data quality", () => {
    expect(primaryOpportunityLink({ registrationUrl: "https://event.example/register", eventUrl: "https://event.example" })).toEqual({ href: "https://event.example/register", label: "Register", kind: "registration" });
    expect(primaryOpportunityLink({ eventUrl: "https://event.example" })).toEqual({ href: "https://event.example", label: "View event", kind: "event" });
    expect(primaryOpportunityLink({ sourcePageUrl: "https://source.example" })).toEqual({ href: "https://source.example", label: "Open publisher page", kind: "directory" });
    expect(opportunityDataQuality({ eventUrl: "https://event.example", deadline: "2026-09-01T00:00:00Z", mode: "online" })).toBe("verified");
    expect(opportunityDataQuality({ sourcePageUrl: "https://source.example" })).toBe("directory-only");
  });
});
