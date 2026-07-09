import { describe, expect, it } from "vitest";
import { runP8Turn } from "../src/turn.js";
import { readJson } from "./helpers.js";
import { scoreCase, summarizeScores, type P8EvalCase } from "./eval-metrics.js";

describe("T4 synthetic P8 public evaluation fixture", () => {
  it("measures structured intent, map-action, and recommendation accuracy over all 30 public cases", () => {
    const evalSet = readJson<{ cases: P8EvalCase[] }>("../fixtures/synthetic/eval.p8.json");
    const scores = evalSet.cases.map((testCase) => {
      const actual = runP8Turn({}, { turnId: testCase.case_id, sessionId: "eval", ...testCase.input });
      expect(actual.modelCalls).toBe(0);
      return scoreCase(testCase, actual);
    });
    const report = summarizeScores(scores);
    console.log(`P8_EVAL_REPORT ${JSON.stringify(report)}`);

    expect(report.overall.cases).toBe(30);
    expect(report.overall.intent).toBeGreaterThanOrEqual(0.7);
    expect(report.overall.map_action).toBeGreaterThanOrEqual(0.8);
    expect(report.overall.recommendation).toBeGreaterThanOrEqual(0.65);
  });

  it("passes the concrete P001/P002/P003 public examples from the brief", () => {
    const evalSet = readJson<{ cases: P8EvalCase[] }>("../fixtures/synthetic/eval.p8.json");
    for (const caseId of ["P001", "P002", "P003"]) {
      const testCase = evalSet.cases.find((candidate) => candidate.case_id === caseId);
      expect(testCase).toBeDefined();
      if (!testCase) continue;
      const actual = runP8Turn({}, { turnId: testCase.case_id, sessionId: "examples", ...testCase.input });
      const score = scoreCase(testCase, actual);
      expect(score.intent).toBe(true);
      expect(score.map_action).toBe(true);
      expect(score.recommendation).toBe(true);
    }
  });
});
