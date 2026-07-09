import { describe, expect, it } from "vitest";
import { receiptSchema, validate } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "../src/pack.js";
import { runP8Turn } from "../src/turn.js";

describe("T7 receipts and structured P8 turn surface", () => {
  it("ordinary recommendation turns validate receipts and make zero model calls", () => {
    const result = runP8Turn({}, {
      turnId: "ordinary-p8",
      sessionId: "receipts",
      userId: "U001",
      message: "Tìm quán cà phê yên tĩnh để làm việc gần tôi."
    });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.decision).toBe("score");
    expect(result.receipt.pack_id).toBe(PACK_ID);
    expect(result.receipt.image_sha).toBe(PACK_IMAGE_SHA);
    expect(result.receipt.cited_ids).toEqual(result.recommendations.map((row) => row.poi_id));
    expect(result.modelCalls).toBe(0);
  });

  it("clarification turns validate receipts and cite P8 ambiguity candidates", () => {
    const result = runP8Turn({}, {
      turnId: "clarify-p8",
      sessionId: "receipts",
      userId: "U004",
      message: "Đưa tôi đến Galaxy."
    });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.firing_rule).toBe("P8_CLARIFY_AMBIGUITY");
    expect(result.receipt.cited_ids).toContain("POI008");
    expect(result.receipt.cited_ids).toContain("POI009");
    expect(result.modelCalls).toBe(0);
  });
});
