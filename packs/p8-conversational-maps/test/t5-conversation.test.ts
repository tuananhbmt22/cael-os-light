import { describe, expect, it } from "vitest";
import { runP8Turn } from "../src/turn.js";
import { readJson } from "./helpers.js";
import type { P8EvalCase } from "./eval-metrics.js";

describe("T5 conversation memory, ambiguity, and anti-gaming checks", () => {
  it("retains restaurant context and adds Hoàn Kiếm plus family constraints for P002", () => {
    const evalSet = readJson<{ cases: P8EvalCase[] }>("../fixtures/synthetic/eval.p8.json");
    const testCase = evalSet.cases.find((candidate) => candidate.case_id === "P002");
    expect(testCase).toBeDefined();
    if (!testCase) return;
    const actual = runP8Turn({}, { turnId: "p002-retention", sessionId: "multi", ...testCase.input });
    expect(actual.context_state.retained_slots.category).toBe("Nhà hàng");
    expect(actual.context_state.retained_slots.location).toBe("Hoàn Kiếm");
    expect(actual.context_state.retained_slots.attributes).toContain("gia đình");
    expect(actual.context_state.retained_slots.attributes).toContain("trẻ em");
    expect(actual.map_action.type).toBe("search");
  });

  it("clarifies Galaxy against P8's own corpus and does not pick a route prematurely", () => {
    const result = runP8Turn({}, { turnId: "p003-galaxy", sessionId: "clarify", userId: "U004", message: "Đưa tôi đến Galaxy." });
    expect(result.intent).toBe("Ambiguous Navigation");
    expect(result.map_action.type).toBe("clarify");
    expect(result.clarification?.needed).toBe(true);
    expect(result.clarification?.candidates).toContain("Galaxy Nguyễn Du");
    expect(result.clarification?.candidates).toContain("Galaxy Hotel Đà Nẵng");
    expect(result.receipt.firing_rule).toBe("P8_CLARIFY_AMBIGUITY");
  });

  it("runs from stripped input-only eval rows without answer fields in the request path", () => {
    const evalSet = readJson<{ cases: P8EvalCase[] }>("../fixtures/synthetic/eval.p8.json");
    for (const testCase of evalSet.cases) {
      const stripped = { ...testCase.input };
      const result = runP8Turn({}, { turnId: `stripped-${testCase.case_id}`, sessionId: "stripped", ...stripped });
      expect(result.modelCalls).toBe(0);
      expect(result.map_action.type).toMatch(/^(search|recommend|route|clarify|plan|explain)$/);
    }
  });
});
