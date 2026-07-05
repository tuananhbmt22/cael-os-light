import { describe, expect, it } from "vitest";
import { s, validateOrDegrade } from "../../src/index.js";
import type { ValidationError } from "../../src/index.js";

describe("structured-output", () => {
  it("validateOrDegrade returns null, logs field paths, and never throws for a bad object", () => {
    const schema = s.object({ name: s.string(), count: s.number() }, "Counter");
    const logs: ValidationError[][] = [];

    const result = validateOrDegrade(schema, { name: 10, count: "two" }, (errors) => logs.push(errors));

    expect(result).toBeNull();
    expect(logs.flat().map((error) => error.path)).toEqual(["$.name", "$.count"]);
  });
});
