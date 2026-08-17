import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { formatKaggleDeadline, OpportunityCard, sourceStatusLabel } from "../pages/Home";

const base = { id: "x", source: "Source", sourceId: "generic", title: "Opportunity", organizer: "Organizer", type: "Hackathon", description: "Description", startDate: "2026-09-01", endDate: "2026-09-02", deadline: "2026-08-31", url: "https://example.com", cost: "free", mode: "online", country: "India", state: "Tamil Nadu", district: "Coimbatore", location: "Online", domain: "ai", skills: "", tags: "", eligibility: "", prizes: "", prizePool: "", participants: "", featured: "", status: "upcoming", logo: "", fetchedAt: "" };

const card = (sourceId: string, source: string, extra: Record<string, string> = {}) => renderToStaticMarkup(<OpportunityCard item={{ ...base, sourceId, source, ...extra }} />);

describe("source status summary", () => {
  it("keeps live connector labels stable during hydration", () => {
    expect(sourceStatusLabel({ status: "ok", records: [{}, {}] })).toBe("2 found");
    expect(sourceStatusLabel({ status: "blocked", records: [] })).toBe("blocked by publisher");
    expect(sourceStatusLabel({ status: "unavailable", records: [] })).toBe("temporary issue");
    expect(sourceStatusLabel({ status: "no-records", records: [] })).toBe("no records");
  });
});

describe("source-specific opportunity cards", () => {
  it.each([
    ["unstop", "Unstop Hackathons", "Registration"],
    ["hack-club", "Hack Club", "Event format"],
    ["knowafest", "KnowAFest Coimbatore", "Campus area"],
    ["devpost", "Devpost", "Devpost status"],
    ["mlh", "Major League Hacking", "Devpost status"],
    ["kaggle", "Kaggle Competitions", "Prize pool"],
    ["topcoder", "Topcoder Challenges", "Competition status"],
    ["generic", "ChallengeRocket", "Listing type"],
    ["hack2skill", "Hack2Skill", "Registration deadline"],
    ["reskill", "Reskilll", "Register"],
    ["devfolio", "Devfolio", "Remind me"],
    ["internshala", "Internshala Hackathons", "Know more"],
  ])("renders the %s card family with its own detail label", (sourceId, source, label) => {
    expect(card(sourceId, source)).toContain(label);
  });

  it("renders Hack2Skill with the minimalist card contract and registration link", () => {
    const html = card("hack2skill", "Hack2Skill", { title: "Future AI Sprint", logo: "https://cdn.example/card.webp", prizePool: "FREE", mode: "virtual", deadline: "2099-04-01T18:29:00.000Z", url: "https://hack2skill.com/event/future-ai" });
    expect(html).toContain("Future AI Sprint");
    expect(html).toContain("FREE");
    expect(html).toContain("virtual");
    expect(html).toContain("Registration deadline");
    expect(html).toContain("Register Now");
    expect(html).not.toContain("Organizer");
    expect(html).not.toContain("Location");
  });

  it("renders the Reskilll card hierarchy from the supplied reference", () => {
    const html = card("reskill", "Reskilll", { title: "iQOO Hackathon 2026 - City Battles", organizer: "iQOO", logo: "https://content.reskilll.com/iqoo.webp", tags: "Live, AI, 4 Cities", startDate: "29 Aug – 27 Sep 2026 · Registrations open", location: "Bengaluru · Pune · Chennai · Hyderabad", prizePool: "₹40,00,000", mode: "offline", url: "https://iqoo.reskilll.com/" });
    expect(html).toContain("iQOO Hackathon 2026 - City Battles");
    expect(html).toContain("iQOO");
    expect(html).toContain("In person");
    expect(html).toContain("Live");
    expect(html).toContain("Bengaluru");
    expect(html).toContain("₹40,00,000");
    expect(html).toContain("Register");
    expect(html).not.toContain("No description provided");
  });

  it("renders Devfolio as a compact typography-led upcoming card", () => {
    const html = card("devfolio", "Devfolio", { title: "Hackify 3.0", startDate: "Opens 01/09/26", deadline: "2026-09-01T00:00:00.000Z", mode: "offline", tags: "No Restrictions, Upcoming", url: "https://hackify-3.devfolio.co/" });
    expect(html).toContain("Hackify 3.0");
    expect(html).toContain("Theme");
    expect(html).toContain("No Restrictions");
    expect(html).toContain("Offline");
    expect(html).toContain("Upcoming");
    expect(html).toContain("Opens 01/09/26");
    expect(html).toContain("Remind me");
    expect(html).not.toContain("Open source");
  });

  it("renders Internshala as an image-led catalogue card with prize, organizer, date, mode, and its own action", () => {
    const html = card("internshala", "Internshala Hackathons", { title: "AVISHKARA'26 National-Level Hackathon", organizer: "Soundarya Institute, Bengaluru", logo: "https://cdn.example/avishkara.jpg", prizePool: "₹60,000", startDate: "30 Aug 2026", mode: "online", cost: "free", url: "https://internshala.com/competitions/avishkara26/" });
    expect(html).toContain("avishkara.jpg");
    expect(html).toContain("Hackathons");
    expect(html).toContain("₹60,000");
    expect(html).toContain("Soundarya Institute");
    expect(html).toContain("30 Aug 2026");
    expect(html).toContain("Online");
    expect(html).toContain("Free");
    expect(html).toContain("Know more");
    expect(html).not.toContain("Open source");
  });

  it("renders eligibility and tags without raw object noise", () => {
    const html = card("devpost", "Devpost", { eligibility: "Students, developers", tags: "AI, web3", prizes: '[{\"rank\":\"Winner\"}]', description: "x".repeat(1200) });
    expect(html).toContain("Students");
    expect(html).toContain("AI");
    expect(html).not.toContain("[object Object]");
    expect(html.length).toBeLessThan(12000);
  });

  it("formats Kaggle deadlines as readable dates and countdowns", () => {
    expect(formatKaggleDeadline("2026-08-31T23:59:00Z", Date.parse("2026-08-17T00:00:00Z"))).toBe("Aug 31, 2026 · 15 days to go");
    expect(formatKaggleDeadline("2026-08-16T23:59:00Z", Date.parse("2026-08-17T00:00:00Z"))).toContain("Closed");
  });

  it("renders an explicit Kaggle prize value or a safe fallback", () => {
    expect(card("kaggle", "Kaggle Competitions", { prizePool: "$850,000" })).toContain("$850,000");
    expect(card("kaggle", "Kaggle Competitions", { prizePool: "" })).toContain("Prize details");
  });

  it("renders Kaggle organizer, prize, team, tag, and eligibility fields", () => {
    const html = card("kaggle", "Kaggle Competitions", { organizer: "Kaggle Research", prizePool: "$850,000", prizes: "$850,000", participants: "2362", tags: "Featured, Code Competition", eligibility: "See competition rules on Kaggle" });
    expect(html).toContain("Kaggle Research");
    expect(html).toContain("Prize pool");
    expect(html).toContain("Teams");
    expect(html).toContain("Featured");
    expect(html).toContain("See competition rules on Kaggle");
  });
});
