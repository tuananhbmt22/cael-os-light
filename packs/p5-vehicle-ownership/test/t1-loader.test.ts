import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import { PACK_ID, p5VehicleOwnershipPack } from "../src/pack.js";

describe("T1 P5 pack loader", () => {
  it("loads the P5 vehicle ownership pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p5VehicleOwnershipPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe(PACK_ID);
    expect(loaded.pack.raw.identity.archetype).toBe("external");
    expect(loaded.pack.raw.identity.deployment).toBe("A");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual([
      "p5_answer",
      "p5_answer",
      "p5_answer"
    ]);
    expect(loaded.pack.raw.threshold_derivations).toEqual([]);
  });
});
