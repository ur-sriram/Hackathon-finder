import { describe, expect, it } from "vitest";
import { SUPPORTED_SITES, supportedSitesHandler } from "./supportedSites";

describe("supported hackathon sites", () => {
  it("keeps only sources with verified upcoming or open listings active", () => {
    const active = SUPPORTED_SITES.filter(site => site.supported && site.upcomingStatus === "confirmed");
    expect(active.map(site => site.name)).toEqual([
      "Devpost",
      "HackerEarth Challenges",
      "Kaggle Competitions",
      "Topcoder Challenges",
      "Unstop Hackathons",
      "Hack Club",
      "Hack2Skill",
      "Reskilll",
      "Devfolio",
      "Internshala Hackathons",
    ]);
  });

  it("returns active and excluded sources through the public endpoint contract", () => {
    let body: any;
    supportedSitesHandler({} as never, { json: (value: unknown) => { body = value; return body; } } as never);
    expect(body.count).toBe(10);
    expect(body.sites.every((site: any) => site.upcomingStatus === "confirmed")).toBe(true);
    expect(body.excluded.map((site: any) => site.id)).toEqual(["mlh", "dorahacks", "taikai", "challengerocket"]);
  });

  it("retains requested but unverified sources as inactive candidates", () => {
    expect(SUPPORTED_SITES).toHaveLength(14);
    expect(SUPPORTED_SITES.find(site => site.id === "mlh")?.upcomingStatus).toBe("conditional");
    expect(SUPPORTED_SITES.find(site => site.id === "dorahacks")?.supported).toBe(false);
    expect(SUPPORTED_SITES.find(site => site.id === "taikai")?.supported).toBe(false);
    expect(SUPPORTED_SITES.find(site => site.id === "challengerocket")?.upcomingStatus).toBe("unverified");
  });
});
