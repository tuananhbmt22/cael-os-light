import { describe, expect, it } from "vitest";
import { receiptSchema, validate } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "../src/pack.js";
import { runP2Turn } from "../src/turn.js";
import { syntheticStateForUser } from "../src/synthetic-corpus.js";

describe("T7 receipts and graded-cooper", () => {
  it("ordinary recommendation turns validate receipts and make zero second-brain calls", () => {
    const result = runP2Turn(syntheticStateForUser("SYN-ALL-SIGNALS"), {
      turnId: "ordinary-score",
      user_id: "SYN-ALL-SIGNALS",
      question: "Recommend actions."
    });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.decision).toBe("score");
    expect(result.receipt.confidence).toBe(1);
    expect(result.receipt.pack_id).toBe(PACK_ID);
    expect(result.receipt.image_sha).toBe(PACK_IMAGE_SHA);
    expect(result.ranked_candidates.every((candidate) => candidate.firing_rule.length > 0)).toBe(true);
    expect(result.secondBrainCalls).toBe(0);
  });

  it("fallback turns still carry a typed receipt", () => {
    const result = runP2Turn(syntheticStateForUser("SYN-HEALTHY"), {
      turnId: "fallback-score",
      user_id: "SYN-HEALTHY",
      question: "Recommend actions."
    });

    expect(result.fallback_used).toBe(true);
    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.firing_rule).toBe("FALLBACK_DISCOVERY_LOYALTY");
  });
});

