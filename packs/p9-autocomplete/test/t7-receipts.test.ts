import { describe, expect, it } from "vitest";
import { receiptSchema, validate } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "../src/pack.js";
import { p9_suggest } from "../src/suggest.js";
import { runP9Turn } from "../src/turn.js";

describe("T7 receipts and structured turn surface", () => {
  it("ordinary autocomplete turns validate receipts and make zero second-brain calls", () => {
    const result = runP9Turn({}, { turnId: "ordinary-score", prefix: "vin", limit: 3 });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.decision).toBe("score");
    expect(result.receipt.firing_rule).toBe("P9_PREFIX_RANK");
    expect(result.receipt.confidence).toBe(1);
    expect(result.receipt.pack_id).toBe(PACK_ID);
    expect(result.receipt.image_sha).toBe(PACK_IMAGE_SHA);
    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual(
      p9_suggest({}, { prefix: "vin", limit: 3 }).suggestions
    );
    expect(result.secondBrainCalls).toBe(0);
  });

  it("fallback turns still carry a typed receipt", () => {
    const result = runP9Turn({}, { turnId: "fallback-score", prefix: "zzzz", limit: 5 });

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.firing_rule).toBe("P9_PREFIX_FALLBACK");
    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual(["bệnh viện gần nhất"]);
    expect(result.secondBrainCalls).toBe(0);
  });
});
