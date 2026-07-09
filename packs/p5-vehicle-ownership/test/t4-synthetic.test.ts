import { describe, expect, it } from "vitest";
import { loadPack, scoreL1 } from "@cael/os-light";
import type { L1EvalSet } from "@cael/os-light";
import { p5VehicleOwnershipPack } from "../src/pack.js";
import { p5_answer } from "../src/p5-answer.js";
import { runP5Turn } from "../src/turn.js";
import { readJson } from "./helpers.js";

describe("T4 synthetic P5 fixture", () => {
  it("scores all 15 workbook public-evaluation cases on structured P5 keys", () => {
    const loaded = loadPack(p5VehicleOwnershipPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.p5.json");
    const report = scoreL1(loaded.pack, { p5_answer }, evalSet);

    expect(evalSet.cases).toHaveLength(15);
    expect(evalSet.cases.every((testCase) => inputRecord(testCase.input).now === "2026-07-07")).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.keys).toHaveLength(3);
    expect(report.keys.every((key) => key.correct_count === key.scored_count)).toBe(true);
    expect(report.keys.every((key) => key.quarantined_count === 0)).toBe(true);
    expect(report.rows.filter((row) => row.disposition === "scored" && row.correct === false)).toEqual([]);
  });

  it("keeps the deterministic eval path at zero model calls", () => {
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.p5.json");
    for (const testCase of evalSet.cases) {
      const input = inputRecord(testCase.input);
      const result = runP5Turn(
        {},
        {
          turnId: stringField(input, "turnId"),
          userId: stringField(input, "userId"),
          vehicleId: stringField(input, "vehicleId"),
          query: stringField(input, "query"),
          now: stringField(input, "now")
        }
      );
      expect(result.modelCalls, testCase.case_id).toBe(0);
    }
  });
});

function inputRecord(input: unknown): Record<string, unknown> {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) return input as Record<string, unknown>;
  return {};
}

function stringField(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  if (typeof value !== "string") throw new Error(`Missing string field ${key}`);
  return value;
}
