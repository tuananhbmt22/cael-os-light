import { describe, expect, it } from "vitest";
import { LedgerMemory, TurnOutcome, receiptSchema, validateOrDegrade } from "../src/index.js";
import type { LedgerTurnEntry, Receipt, ValidationError } from "../src/index.js";
import { readFixture } from "./helpers.js";

interface ValidReceiptFixture {
  turns: { turnId: string; receipt: unknown }[];
}

interface ExpectedValidReceipt {
  validReceipts: number;
  dedupedFirstReceiptIds: string[];
}

interface ForcedInvalidFixture {
  userId: string;
  sessionId: string;
  turnId: string;
  answerText: string;
  invalidReceipt: unknown;
}

describe("c05 receipts", () => {
  it("H valid-receipt-every-turn validates every synthetic turn receipt", () => {
    const input = readFixture<ValidReceiptFixture>(
      "../fixtures/phase0/c05/H/valid-receipt-every-turn/input.json"
    );
    const expected = readFixture<ExpectedValidReceipt>(
      "../fixtures/phase0/c05/H/valid-receipt-every-turn/expected.json"
    );
    const logs: ValidationError[][] = [];

    const receipts = input.turns.map((turn) =>
      validateOrDegrade(receiptSchema, turn.receipt, (errors) => logs.push(errors))
    );

    expect(receipts).toHaveLength(expected.validReceipts);
    expect(receipts.every((receipt): receipt is Receipt => receipt !== null)).toBe(true);
    expect(receipts[0]?.cited_ids).toEqual(expected.dedupedFirstReceiptIds);
    expect(logs).toEqual([]);
  });

  it("R forced-invalid-degrades-locally blocks receipt mutation and keeps local answer", () => {
    const input = readFixture<ForcedInvalidFixture>(
      "../fixtures/phase0/c05/R/forced-invalid-degrades-locally/input.json"
    );
    const expected = readFixture<{ degraded: boolean; appendedReceipts: number; loggedMinimum: number }>(
      "../fixtures/phase0/c05/R/forced-invalid-degrades-locally/expected.json"
    );
    const logs: ValidationError[][] = [];
    const ledger = new LedgerMemory(undefined, (errors) => logs.push(errors));

    const receipt = validateOrDegrade(receiptSchema, input.invalidReceipt, (errors) => logs.push(errors));
    const localAnswer = receipt === null ? { degraded: true, text: input.answerText } : { degraded: false, text: "" };

    if (receipt !== null) {
      const entry: LedgerTurnEntry = {
        turnId: input.turnId,
        outcome: TurnOutcome.Answer,
        text: input.answerText,
        receipt,
        metadata: {}
      };
      ledger.appendTurn(input.userId, input.sessionId, entry);
    }

    expect(localAnswer.degraded).toBe(expected.degraded);
    expect(localAnswer.text).toBe(input.answerText);
    expect(ledger.readSession(input.userId, input.sessionId)).toHaveLength(expected.appendedReceipts);
    expect(logs.flat()).toHaveLength(expected.loggedMinimum);
  });

  it("M schema-violating-fields-logged captures wrong and extra field paths", () => {
    const input = readFixture<{ receipt: unknown }>(
      "../fixtures/phase0/c05/M/schema-violating-fields-logged/input.json"
    );
    const expected = readFixture<{ errorPaths: string[] }>(
      "../fixtures/phase0/c05/M/schema-violating-fields-logged/expected.json"
    );
    const logs: ValidationError[][] = [];

    const receipt = validateOrDegrade(receiptSchema, input.receipt, (errors) => logs.push(errors));

    expect(receipt).toBeNull();
    expect(logs.flat().map((error) => error.path)).toEqual(expect.arrayContaining(expected.errorPaths));
  });

  it("S schema-version-bump-old-receipts-readable accepts an older schema_version", () => {
    const input = readFixture<{ receipt: unknown }>(
      "../fixtures/phase0/c05/S/schema-version-bump-old-receipts-readable/input.json"
    );
    const expected = readFixture<{ schema_version: string; readable: boolean }>(
      "../fixtures/phase0/c05/S/schema-version-bump-old-receipts-readable/expected.json"
    );
    const logs: ValidationError[][] = [];

    const receipt = validateOrDegrade(receiptSchema, input.receipt, (errors) => logs.push(errors));

    expect(receipt !== null).toBe(expected.readable);
    expect(receipt?.schema_version).toBe(expected.schema_version);
    expect(logs).toEqual([]);
  });
});
