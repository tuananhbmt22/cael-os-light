import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import { p7PoiCorpus } from "../src/poi-corpus.js";
import { PACK_ID, p7SemanticRankingPack } from "../src/pack.js";
import { p7AttributeTaxonomy, p7RankingSignals } from "../src/taxonomy.js";
import { readJson } from "./helpers.js";

describe("T1 P7 pack loader and generated data", () => {
  it("loads the P7 semantic-ranking pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p7SemanticRankingPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe(PACK_ID);
    expect(loaded.pack.raw.identity.archetype).toBe("external");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual(["p7_rank"]);
  });

  it("contains the workbook-derived corpus, taxonomy, signals, and eval rows", () => {
    const evalSet = readJson<{ cases: unknown[] }>("../fixtures/synthetic/eval.p7.json");
    expect(p7PoiCorpus).toHaveLength(111);
    expect(p7AttributeTaxonomy).toHaveLength(10);
    expect(p7RankingSignals).toHaveLength(7);
    expect(evalSet.cases).toHaveLength(60);
  });
});
