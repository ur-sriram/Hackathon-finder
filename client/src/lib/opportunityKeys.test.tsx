import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { opportunityCardKey } from "./opportunityKeys";

describe("rendered opportunity card keys", () => {
  it("renders repeated API IDs without a React duplicate-key warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const records = [{ id: "devpost:https://devpost.com/software", title: "A" }, { id: "devpost:https://devpost.com/software", title: "B" }];
    renderToStaticMarkup(<section>{records.map((record, index) => <article key={opportunityCardKey(record, index)}>{record.title}</article>)}</section>);
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("same key"), expect.anything());
    error.mockRestore();
  });
});
