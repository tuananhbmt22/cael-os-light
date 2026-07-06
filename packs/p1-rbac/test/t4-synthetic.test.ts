import { describe, expect, it } from "vitest";
import { loadPack, scoreL1 } from "@cael/os-light";
import type { L1EvalSet } from "@cael/os-light";
import { p1RbacPack } from "../src/pack.js";
import { p1_answer } from "../src/p1-answer.js";
import { syntheticDocuments } from "../src/synthetic-corpus.js";
import { readJson } from "./helpers.js";

describe("T4 synthetic archetype-A fixture", () => {
  it("scores permission and document_id across the RBAC battery", () => {
    const loaded = loadPack(p1RbacPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const evalSet = withState(readJson<L1EvalSet>("../fixtures/synthetic/eval.archetype-a.json"));
    const report = scoreL1(loaded.pack, { p1_answer }, evalSet);

    expect(report.errors).toEqual([]);
    expect(report.keys).toHaveLength(2);
    expect(report.keys.every((key) => key.correct_count === key.scored_count)).toBe(true);
    expect(report.rows.filter((row) => row.disposition === "scored" && row.correct === false)).toEqual([]);
  });
});

function withState(evalSet: L1EvalSet): L1EvalSet {
  return {
    ...evalSet,
    cases: evalSet.cases.map((testCase) => ({ ...testCase, state: { documents: syntheticDocuments } }))
  };
}
