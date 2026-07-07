import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import { p6QueryUnderstandingPack } from "../src/pack.js";

describe("T1 pack loader", () => {
  it("loads the P6 pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p6QueryUnderstandingPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe("p6-query-understanding");
    expect(loaded.pack.raw.identity.archetype).toBe("external");
    expect(loaded.pack.raw.identity.deployment).toBe("B");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual([
      "p6_answer",
      "p6_answer",
      "p6_answer"
    ]);
  });
});

