import { describe, expect, it } from "vitest";
import { loadPack, scoreL1 } from "@cael/os-light";
import type { L1EvalSet } from "@cael/os-light";
import { p2EligibilityPack } from "../src/pack.js";
import { p2_recommend } from "../src/p2-recommend.js";
import { syntheticStateForUser } from "../src/synthetic-corpus.js";
import { readJson } from "./helpers.js";

describe("T4 synthetic archetype-B fixture", () => {
  it("scores state-driven recommendations across the synthetic battery", () => {
    const loaded = loadPack(p2EligibilityPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const evalSet = withState(readJson<L1EvalSet>("../fixtures/synthetic/eval.archetype-b.json"));
    const report = scoreL1(loaded.pack, { p2_recommend }, evalSet);

    expect(report.errors).toEqual([]);
    expect(report.keys).toHaveLength(1);
    expect(report.keys[0]?.correct_count).toBe(report.keys[0]?.scored_count);
    expect(report.rows.filter((row) => row.disposition === "scored" && row.correct === false)).toEqual([]);
  });

  it("is independent of question text for the same user state", () => {
    const state = syntheticStateForUser("SYN-ALL-SIGNALS");
    const first = p2_recommend(state, { user_id: "SYN-ALL-SIGNALS", question: "first wording" });
    const second = p2_recommend(state, { user_id: "SYN-ALL-SIGNALS", question: "unrelated wording" });
    expect(second).toEqual(first);
  });

  it("keeps scored inputs to user id and question only", () => {
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.archetype-b.json");
    expect(evalSet.cases.every((testCase) => Object.keys(inputRecord(testCase.input)).sort().join(",") === "question,user_id")).toBe(true);
  });
});

function withState(evalSet: L1EvalSet): L1EvalSet {
  return {
    ...evalSet,
    cases: evalSet.cases.map((testCase) => ({
      ...testCase,
      state: syntheticStateForUser(String(inputRecord(testCase.input).user_id))
    }))
  };
}

function inputRecord(input: unknown): Record<string, unknown> {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) return input as Record<string, unknown>;
  return {};
}
