import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { primaryLink, TrustFrame } from "./ReviewedHome";

const item = { id: "reviewed-card", source: "Devpost", sourceId: "devpost", title: "Build for a better campus", organizer: "Campus Labs", type: "Hackathon", description: "About the Hackathon: Build an open tool for students &mdash; and share it with your campus.", startDate: "2026-09-03", endDate: "2026-09-04", deadline: "2026-09-01T18:00:00Z", url: "https://event.example", eventUrl: "https://event.example", registrationUrl: "https://event.example/register", sourcePageUrl: "https://source.example", cost: "free", mode: "online", country: "India", state: "", district: "", location: "", domain: "artificial intelligence", skills: "Python", tags: "AI", eligibility: "Students", prizes: "$1,000", prizePool: "$1,000", participants: "", featured: "", status: "open", dataQuality: "verified" as const, logo: "", fetchedAt: "" };

describe("reviewed decision card", () => {
  it("keeps the decision summary compact, cleans source text, and hides raw timestamps", () => {
    const html = renderToStaticMarkup(<TrustFrame item={item} reason="Matches Python skills" />);
    expect(html).toContain("Closes 1 Sept");
    expect(html).toContain("Build an open tool for students — and share it with your campus.");
    expect(html).toContain("Register now");
    expect(html).toContain("More details");
    expect(html).not.toContain("2026-09-01T18:00:00Z");
    expect(html).not.toContain("About the Hackathon:");
  });

  it("uses a conversion-accurate action at each available link depth", () => {
    expect(primaryLink(item)).toMatchObject({ label: "Register now", secondary: false });
    expect(primaryLink({ ...item, registrationUrl: "" })).toMatchObject({ label: "View event", secondary: false });
    expect(primaryLink({ ...item, registrationUrl: "", eventUrl: "" })).toMatchObject({ label: "Open publisher page", secondary: true });
  });
});
