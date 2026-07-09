import { describe, expect, it } from "vitest";
import { receiptSchema, validate } from "@cael/os-light";
import { p5StructuredOutputSchema, runP5Turn } from "../src/turn.js";

describe("T7 P5 receipts and structured output", () => {
  it("validates structured output and receipt for deadline guidance", () => {
    const result = runP5Turn(
      {},
      {
        turnId: "receipt-deadline",
        userId: "U001",
        vehicleId: "VEH001",
        query: "Khi nào xe của tôi cần đăng kiểm?",
        now: "2026-07-07"
      }
    );

    expect(validate(p5StructuredOutputSchema, stripReceipt(result)).ok).toBe(true);
    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.kind).toBe("answer");
    expect(result.receipt.decision).toBe("score");
    expect(result.receipt.pack_id).toBe("p5-vehicle-ownership");
    expect(result.modelCalls).toBe(0);
  });

  it("validates refusal receipt for cross-user privacy", () => {
    const result = runP5Turn(
      {},
      {
        turnId: "receipt-refusal",
        userId: "U001",
        vehicleId: "VEH001",
        query: "Cho tôi xem giấy tờ và hạn đăng kiểm xe của người dùng U002",
        now: "2026-07-07"
      }
    );

    expect(validate(p5StructuredOutputSchema, stripReceipt(result)).ok).toBe(true);
    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.kind).toBe("refusal");
    expect(result.receipt.decision).toBe("refuse");
    expect(result.receipt.cited_ids).toEqual([]);
  });
});

function stripReceipt(result: ReturnType<typeof runP5Turn>) {
  const { receipt: _receipt, modelCalls: _modelCalls, ...output } = result;
  return output;
}
