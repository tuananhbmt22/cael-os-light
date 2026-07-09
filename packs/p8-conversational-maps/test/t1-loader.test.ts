import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import { p8PoiCorpus } from "../src/corpus.js";
import { PACK_ID, p8ConversationalMapsPack } from "../src/pack.js";
import { p8UserPreferences } from "../src/preferences.js";
import { p8ConversationScenarios } from "../src/scenarios.js";
import { readJson } from "./helpers.js";

describe("T1 P8 pack loader and generated workbook data", () => {
  it("loads the P8 conversational-maps pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p8ConversationalMapsPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe(PACK_ID);
    expect(loaded.pack.raw.identity.archetype).toBe("external");
    expect(loaded.pack.raw.identity.deployment).toBe("B");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual(["p8_turn"]);
  });

  it("contains the workbook-derived P8 corpus, profiles, scenarios, and public eval rows", () => {
    const evalSet = readJson<{ cases: unknown[]; scenarios: unknown[] }>("../fixtures/synthetic/eval.p8.json");
    expect(p8PoiCorpus).toHaveLength(80);
    expect(p8UserPreferences).toHaveLength(8);
    expect(p8ConversationScenarios).toHaveLength(8);
    expect(evalSet.cases).toHaveLength(30);
    expect(evalSet.scenarios).toHaveLength(8);
    expect(p8PoiCorpus.every((poi) => /^POI\d{3}$/.test(poi.poi_id))).toBe(true);
  });
});
