import { describe, expect, it } from "vitest";
import { receiptSchema, validate } from "@cael/os-light";
import { p6StructuredOutputSchema, runP6Turn } from "../src/turn.js";
import { createStubIntentModel } from "../src/query-model.js";

describe("T7 P6 receipts and structured output", () => {
  it("validates structured output and receipt for a clear query with zero model calls", () => {
    const result = runP6Turn(
      {},
      {
        turnId: "clear-cafe",
        query: "quan cafe gan day"
      },
      { intentModel: createStubIntentModel() }
    );

    expect(validate(p6StructuredOutputSchema, stripReceipt(result)).ok).toBe(true);
    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.intent).toBe("category_search");
    expect(result.receipt.kind).toBe("answer");
    expect(result.receipt.decision).toBe("score");
    expect(result.receipt.firing_rule).toBe("p6_query_understood");
    expect(result.modelCalls).toBe(0);
  });

  it("validates parsed address output for incomplete VN addresses", () => {
    const result = runP6Turn(
      {},
      {
        turnId: "address-ng-hue",
        query: "123 ng hue, p ben nghe"
      }
    );

    expect(validate(p6StructuredOutputSchema, stripReceipt(result)).ok).toBe(true);
    expect(result.parsed_address).toMatchObject({
      street: "123 nguyễn huệ",
      ward: "phường bến nghé"
    });
    expect(result.receipt.decision).toBe("score");
  });

  it("refuses a too-ambiguous query with a valid phase0.s3 receipt", () => {
    const result = runP6Turn(
      {},
      {
        turnId: "ambiguous-restaurant",
        query: "nha hang"
      },
      { intentModel: createStubIntentModel() }
    );

    expect(validate(p6StructuredOutputSchema, stripReceipt(result)).ok).toBe(true);
    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.ambiguity.detected).toBe(true);
    expect(result.receipt.kind).toBe("refusal");
    expect(result.receipt.decision).toBe("refuse");
    expect(result.receipt.firing_rule).toBe("p6_query_ambiguous");
    expect(result.modelCalls).toBe(0);
  });

  it("uses the stub seam only for tied synthetic POI candidates", () => {
    const result = runP6Turn(
      {},
      {
        turnId: "ambiguous-lotus",
        query: "lotus"
      },
      { intentModel: createStubIntentModel() }
    );

    expect(result.ambiguity.detected).toBe(true);
    expect(result.receipt.decision).toBe("refuse");
    expect(result.modelCalls).toBe(1);
    expect(result.ambiguity.resolution).toContain("SYN-POI-LOTUS-CAFE");
  });
});

function stripReceipt(result: ReturnType<typeof runP6Turn>) {
  const { receipt: _receipt, modelCalls: _modelCalls, ...output } = result;
  return output;
}

