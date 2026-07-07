import { describe, expect, it } from "vitest";
import { loadPack, scoreL1 } from "@cael/os-light";
import type { L1EvalSet, L1Report } from "@cael/os-light";
import { p6QueryUnderstandingPack } from "../src/pack.js";
import { p6_answer } from "../src/p6-answer.js";
import { readJson } from "./helpers.js";

describe("T4 synthetic P6 fixture", () => {
  it("scores normalized query, intent, and entities across the synthetic rubric", () => {
    const loaded = loadPack(p6QueryUnderstandingPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.p6.json");
    const report = scoreL1(loaded.pack, { p6_answer }, evalSet);

    expect(evalSet.cases.length).toBeGreaterThanOrEqual(10);
    expect(report.errors).toEqual([]);
    expect(report.keys).toHaveLength(3);
    expect(report.keys.every((key) => key.correct_count === key.scored_count)).toBe(true);
    expect(report.keys.every((key) => key.quarantined_count === 0)).toBe(true);
    expect(report.rows.filter((row) => row.disposition === "scored" && row.correct === false)).toEqual([]);
  });

  it("keeps scored inputs to query only", () => {
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.p6.json");
    expect(evalSet.cases.every((testCase) => Object.keys(inputRecord(testCase.input)).join(",") === "query")).toBe(true);
  });

  it("does not depend on eval state", () => {
    const loaded = loadPack(p6QueryUnderstandingPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.p6.json");
    const withState: L1EvalSet = {
      ...evalSet,
      cases: evalSet.cases.map((testCase) => ({ ...testCase, state: { ignored: "state stripped without changing score" } }))
    };

    expect(scoreSummary(scoreL1(loaded.pack, { p6_answer }, withState))).toEqual(
      scoreSummary(scoreL1(loaded.pack, { p6_answer }, evalSet))
    );
  });
});

function inputRecord(input: unknown): Record<string, unknown> {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) return input as Record<string, unknown>;
  return {};
}

function scoreSummary(report: L1Report): string {
  return report.keys
    .map((key) => `${key.eval_key}:${key.scored_count}:${key.correct_count}:${key.error_count}:${key.quarantined_count}`)
    .join("|");
}

