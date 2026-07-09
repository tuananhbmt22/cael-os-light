import { describe, expect, it } from "vitest";
import { receiptSchema, validate } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "../src/pack.js";
import { runP7Turn } from "../src/turn.js";

describe("T7 receipts and structured turn surface", () => {
  it("ordinary ranking turns validate receipts and make zero model calls", () => {
    const result = runP7Turn({}, { turnId: "ordinary-score", query: "quán cà phê yên tĩnh để làm việc", limit: 5 });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.decision).toBe("score");
    expect(result.receipt.firing_rule).toBe("P7_SEMANTIC_RANK");
    expect(result.receipt.confidence).toBeGreaterThan(0.8);
    expect(result.receipt.pack_id).toBe(PACK_ID);
    expect(result.receipt.image_sha).toBe(PACK_IMAGE_SHA);
    expect(result.receipt.cited_ids).toEqual(result.ranked_results.map((resultRow) => resultRow.poi_id));
    expect(result.ranked_results[0]?.place.id).toMatch(/^poi:/);
    expect(result.modelCalls).toBe(0);
  });

  it("fallback/proxy signal explanations are explicit", () => {
    const result = runP7Turn({}, { turnId: "fallback-proxy", query: "zzzz", limit: 3 });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.modelCalls).toBe(0);
    expect(result.ranked_results[0]?.reasons.join(" ")).toContain("review_signal fallback");
    expect(result.ranked_results[0]?.reasons.join(" ")).toContain("freshness_score fallback");
  });
});
