import { describe, expect, it } from "vitest";
import { loadPack, scoreL1 } from "@cael/os-light";
import type { L1EvalSet } from "@cael/os-light";
import { p9AutocompletePack } from "../src/pack.js";
import { p9_suggest } from "../src/suggest.js";
import { readJson } from "./helpers.js";

describe("T4 synthetic archetype-B fixture", () => {
  it("scores ranked autocomplete suggestions across the synthetic battery", () => {
    const loaded = loadPack(p9AutocompletePack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.archetype-b.json");
    const report = scoreL1(loaded.pack, { p9_suggest }, evalSet);

    expect(report.errors).toEqual([]);
    expect(report.keys).toHaveLength(1);
    expect(report.keys[0]?.eval_key).toBe("suggestions");
    expect(report.keys[0]?.scored_count).toBeGreaterThanOrEqual(10);
    expect(report.keys[0]?.correct_count).toBe(report.keys[0]?.scored_count);
    expect(report.rows.filter((row) => row.disposition === "error")).toEqual([]);
    expect(report.rows.filter((row) => row.disposition === "scored" && row.correct === false)).toEqual([]);
  });

  it("keeps every expected suggestion surface as string arrays", () => {
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.archetype-b.json");
    expect(evalSet.cases).toHaveLength(12);
    expect(
      evalSet.cases.every((testCase) => Array.isArray(testCase.expected.suggestions))
    ).toBe(true);
  });
});
