import { describe, expect, it } from "vitest";
import { EntityStore, JsonSnapshotKernelStore, LedgerMemory, TurnOutcome, s } from "../src/index.js";
import type { KernelSnapshot, LedgerTurnEntry, ValidationError } from "../src/index.js";
import { readFixture } from "./helpers.js";

interface ContinuityFixture {
  userId: string;
  sessionId: string;
  turns: LedgerTurnEntry[];
}

function appendFixtureTurns(ledger: LedgerMemory, userId: string, sessionId: string, turns: LedgerTurnEntry[]): void {
  for (const turn of turns) {
    const result = ledger.appendTurn(userId, sessionId, turn);
    expect(result.ok).toBe(true);
  }
}

describe("c06 ledger isolation", () => {
  it("H continuity-across-turns preserves order and Vietnamese UTF-8 byte-exact", () => {
    const input = readFixture<ContinuityFixture>(
      "../fixtures/phase0/c06/H/continuity-across-turns/input.json"
    );
    const expected = readFixture<{ turnCount: number; seq: number[]; vietnameseText: string }>(
      "../fixtures/phase0/c06/H/continuity-across-turns/expected.json"
    );
    const ledger = new LedgerMemory();

    appendFixtureTurns(ledger, input.userId, input.sessionId, input.turns);
    const rows = ledger.readSession(input.userId, input.sessionId);

    expect(rows).toHaveLength(expected.turnCount);
    expect(rows.map((row) => row.seq)).toEqual(expected.seq);
    expect(rows[0]?.entry.text).toBe(expected.vietnameseText);
  });

  it("R cross-user-read-probe-denied leaks zero user A rows through exposed surfaces", () => {
    const input = readFixture<{
      userA: string;
      userB: string;
      sessionA: string;
      sessionB: string;
      userATurns: string[];
      userBTurns: string[];
    }>("../fixtures/phase0/c06/R/cross-user-read-probe-denied/input.json");
    const expected = readFixture<{
      userBReadSessionA: number;
      userBReadUser: number;
      userBReadSinceZero: number;
      leakedUserARows: number;
    }>("../fixtures/phase0/c06/R/cross-user-read-probe-denied/expected.json");
    const ledger = new LedgerMemory();
    const entityStore = new EntityStore(s.object({ owner: s.string() }, "OwnerEntity"));

    for (const turnId of input.userATurns) {
      ledger.appendTurn(input.userA, input.sessionA, {
        turnId,
        outcome: TurnOutcome.Answer,
        text: `user A ${turnId}`,
        receipt: null,
        metadata: {}
      });
    }
    for (const turnId of input.userBTurns) {
      ledger.appendTurn(input.userB, input.sessionB, {
        turnId,
        outcome: TurnOutcome.Answer,
        text: `user B ${turnId}`,
        receipt: null,
        metadata: {}
      });
    }
    entityStore.put(input.userA, "session-a", { owner: input.userA });

    const userBReadSessionA = ledger.readSession(input.userB, input.sessionA);
    const userBReadUser = ledger.readUser(input.userB);
    const userBReadSinceZero = ledger.readSince(input.userB, 0);
    const directKeyGuess = entityStore.get(input.userB, "session-a");
    const leakedUserARows = [...userBReadSessionA, ...userBReadUser, ...userBReadSinceZero].filter((row) =>
      row.entry.text.includes("user A")
    );

    expect(userBReadSessionA).toHaveLength(expected.userBReadSessionA);
    expect(userBReadUser).toHaveLength(expected.userBReadUser);
    expect(userBReadSinceZero).toHaveLength(expected.userBReadSinceZero);
    expect(directKeyGuess).toBeNull();
    expect(leakedUserARows).toHaveLength(expected.leakedUserARows);
  });

  it("M corrupted-row-recovery skips invalid rows, logs, and reads surrounding rows", () => {
    const input = readFixture<{ snapshot: KernelSnapshot }>(
      "../fixtures/phase0/c06/M/corrupted-row-recovery/input.json"
    );
    const expected = readFixture<{ readTurnIds: string[]; loggedMinimum: number }>(
      "../fixtures/phase0/c06/M/corrupted-row-recovery/expected.json"
    );
    const logs: ValidationError[][] = [];
    const ledger = new LedgerMemory(new JsonSnapshotKernelStore(input.snapshot), (errors) => logs.push(errors));

    const rows = ledger.readSession("user-a", "session-corrupt");

    expect(rows.map((row) => row.entry.turnId)).toEqual(expected.readTurnIds);
    expect(logs.flat().length).toBeGreaterThanOrEqual(expected.loggedMinimum);
  });

  it("I replayed-append-single-entry stores one entry and returns the recorded outcome", () => {
    const input = readFixture<{
      userId: string;
      sessionId: string;
      idempotencyKey: string;
      entry: LedgerTurnEntry;
    }>("../fixtures/phase0/c06/I/replayed-append-single-entry/input.json");
    const expected = readFixture<{ storedEntries: number; firstSeq: number; secondSeq: number }>(
      "../fixtures/phase0/c06/I/replayed-append-single-entry/expected.json"
    );
    const ledger = new LedgerMemory();

    const first = ledger.appendTurn(input.userId, input.sessionId, input.entry, input.idempotencyKey);
    const second = ledger.appendTurn(input.userId, input.sessionId, input.entry, input.idempotencyKey);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.ok ? first.value.seq : 0).toBe(expected.firstSeq);
    expect(second.ok ? second.value.seq : 0).toBe(expected.secondSeq);
    expect(ledger.readSession(input.userId, input.sessionId)).toHaveLength(expected.storedEntries);
  });

  it("S restart-mid-session-resume snapshots and resumes with contiguous sequence numbers", () => {
    const input = readFixture<{
      userId: string;
      sessionId: string;
      beforeRestart: LedgerTurnEntry[];
      afterRestart: LedgerTurnEntry;
    }>("../fixtures/phase0/c06/S/restart-mid-session-resume/input.json");
    const expected = readFixture<{ turnCount: number; seq: number[] }>(
      "../fixtures/phase0/c06/S/restart-mid-session-resume/expected.json"
    );
    const store = new JsonSnapshotKernelStore();
    const before = new LedgerMemory(store);
    appendFixtureTurns(before, input.userId, input.sessionId, input.beforeRestart);

    const afterStore = JsonSnapshotKernelStore.fromJson(store.toJson());
    const after = new LedgerMemory(afterStore);
    const appendResult = after.appendTurn(input.userId, input.sessionId, input.afterRestart);

    expect(appendResult.ok).toBe(true);
    const rows = after.readSession(input.userId, input.sessionId);
    expect(rows).toHaveLength(expected.turnCount);
    expect(rows.map((row) => row.seq)).toEqual(expected.seq);
  });
});
