import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import { PACK_ID, p9AutocompletePack } from "../src/pack.js";

describe("T1 pack loader", () => {
  it("loads the P9 autocomplete pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p9AutocompletePack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe(PACK_ID);
    expect(loaded.pack.raw.identity.archetype).toBe("external");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual(["p9_suggest"]);
    expect(loaded.pack.raw.threshold_derivations).toEqual([]);
  });
});
