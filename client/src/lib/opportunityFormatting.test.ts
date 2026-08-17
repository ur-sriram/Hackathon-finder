import { describe, expect, it } from "vitest";
import { compactText, structuredItems } from "./opportunityFormatting";

describe("opportunity formatting", () => {
  it("turns escaped structured prizes into readable items", () => {
    const value = '[{\\"rank\\":\\"1st Prize\\",\\"cash\\":10000},{\\"rank\\":\\"2nd Prize\\",\\"cash\\":7000}]';
    expect(structuredItems(value)).toEqual(["1st Prize", "2nd Prize"]);
  });
  it("never returns object string noise", () => {
    expect(compactText({ name: "India" })).toContain("India");
    expect(compactText("[object Object]")).toBe("");
  });
  it("limits plain metadata to readable chips", () => {
    expect(structuredItems("AI, web3, robotics")).toEqual(["AI", "web3", "robotics"]);
  });
});
