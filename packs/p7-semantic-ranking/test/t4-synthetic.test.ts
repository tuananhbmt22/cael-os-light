import { describe, expect, it } from "vitest";
import { evaluateP7Ranking, scoreP7EvalCase, topKIncluded } from "../src/rank.js";
import { readJson } from "./helpers.js";

interface P7EvalSet {
  cases: Array<{
    case_id: string;
    input: { query: string; limit: number };
    expected: { ranked_results: string[] };
    metadata: { query_category: string; difficulty: string };
  }>;
}

function evalReport(cases: P7EvalSet["cases"]) {
  let topKHits = 0;
  let scoreTotal = 0;
  for (const testCase of cases) {
    const ranked = evaluateP7Ranking({}, testCase.input).ranked_results.map((result) => result.poi_id);
    if (topKIncluded(testCase.expected.ranked_results, ranked)) topKHits += 1;
    scoreTotal += scoreP7EvalCase(testCase.expected.ranked_results, ranked);
  }
  return {
    cases: cases.length,
    topKHits,
    topKAccuracy: topKHits / cases.length,
    partialScore: scoreTotal / cases.length
  };
}

describe("T4 synthetic P7 evaluation fixture", () => {
  it("measures real top-k inclusion over all 60 workbook eval cases", () => {
    const evalSet = readJson<P7EvalSet>("../fixtures/synthetic/eval.p7.json");
    const report = evalReport(evalSet.cases);

    expect(report.cases).toBe(60);
    expect(report.topKAccuracy).toBeGreaterThanOrEqual(0.8);
    expect(report.partialScore).toBeGreaterThanOrEqual(0.7);
  });

  it("passes the concrete public examples from the brief", () => {
    const evalSet = readJson<P7EvalSet>("../fixtures/synthetic/eval.p7.json");
    for (const caseId of ["P001", "P002", "P003", "P033", "P044"]) {
      const testCase = evalSet.cases.find((candidate) => candidate.case_id === caseId);
      expect(testCase).toBeDefined();
      if (!testCase) continue;
      const ranked = evaluateP7Ranking({}, testCase.input).ranked_results.map((result) => result.poi_id);
      for (const expected of testCase.expected.ranked_results) {
        expect(ranked.slice(0, Math.max(5, testCase.expected.ranked_results.length))).toContain(expected);
      }
    }
  });
});
