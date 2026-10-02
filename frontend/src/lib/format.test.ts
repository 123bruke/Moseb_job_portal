import { describe, expect, it } from "vitest";
import { humanize, parseSkills, weightsTotal } from "./format";

describe("format helpers", () => {
  it("parses and de-duplicates skills", () => expect(parseSkills("Python, FastAPI,\nPython , ")).toEqual(["Python", "FastAPI"]));
  it("humanizes status codes", () => expect(humanize("not_selected")).toBe("Not selected"));
  it("sums weights", () => expect(weightsTotal({ a: 35, b: 25, c: 40 })).toBe(100));
});
