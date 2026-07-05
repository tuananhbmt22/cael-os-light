import type { Receipt, SessionId, UserId } from "../types/index.js";
import { TurnOutcome } from "../types/index.js";
import type { IdempotencyKey } from "../types/index.js";
import { auditRecordSchema, receiptSchema } from "../receipts/receipt-schema.js";
import { EventLedger, IdempotencyGuard, InMemoryKernelStore } from "./state-kernel.js";
import type { KernelResult, KernelStore, StoredEvent } from "./state-kernel.js";
import type { Schema, ValidationError } from "../validate/structured-output.js";
import { s } from "../validate/structured-output.js";

export interface LedgerTurnEntry {
  turnId: string;
  outcome: TurnOutcome;
  text: string;
  receipt: Receipt | null;
  metadata: Record<string, string>;
}

export interface SessionTurnRecord {
  sessionId: SessionId;
  entry: LedgerTurnEntry;
}

export interface LedgerTurn {
  seq: number;
  sessionId: SessionId;
  entry: LedgerTurnEntry;
}

const turnOutcomeSchema: Schema<TurnOutcome> = s.enumOf([
  TurnOutcome.Answer,
  TurnOutcome.RefuseEvidence,
  TurnOutcome.RefuseAlternative,
  TurnOutcome.Clarify,
  TurnOutcome.Escalate
] as const);

const receiptOrNullSchema: Schema<Receipt | null> = s.union<Receipt | null>([
  receiptSchema,
  s.literal(null)
]);

export const ledgerTurnEntrySchema: Schema<LedgerTurnEntry> = s.object(
  {
    turnId: s.string(),
    outcome: turnOutcomeSchema,
    text: s.string(),
    receipt: receiptOrNullSchema,
    metadata: s.record(s.string())
  },
  "LedgerTurnEntry"
);

export const sessionTurnRecordSchema: Schema<SessionTurnRecord> = s.object(
  {
    sessionId: s.string(),
    entry: ledgerTurnEntrySchema
  },
  "SessionTurnRecord"
);

const storedSessionTurnSchema: Schema<StoredEvent<SessionTurnRecord>> = s.object(
  {
    userId: s.string(),
    seq: s.number(),
    event: sessionTurnRecordSchema
  },
  "StoredSessionTurn"
);

export class LedgerMemory {
  private readonly ledger: EventLedger<SessionTurnRecord>;
  private readonly guard: IdempotencyGuard<StoredEvent<SessionTurnRecord>>;

  constructor(
    private readonly store: KernelStore = new InMemoryKernelStore(),
    private readonly log: (errors: ValidationError[]) => void = () => {}
  ) {
    this.ledger = new EventLedger(sessionTurnRecordSchema, store, log);
    this.guard = new IdempotencyGuard(store, storedSessionTurnSchema);
    void auditRecordSchema;
  }

  appendTurn(
    userId: UserId,
    sessionId: SessionId,
    entry: unknown,
    idempotencyKey?: IdempotencyKey
  ): KernelResult<LedgerTurn> {
    const append = (): KernelResult<StoredEvent<SessionTurnRecord>> =>
      this.ledger.append(userId, { sessionId, entry });

    const result = idempotencyKey ? this.guard.once(userId, idempotencyKey, append) : append();
    if (!result.ok) return result;
    return { ok: true, value: this.toLedgerTurn(result.value) };
  }

  readSession(userId: UserId, sessionId: SessionId): LedgerTurn[] {
    return this.ledger
      .read(userId)
      .filter((row) => row.event.sessionId === sessionId)
      .map((row) => this.toLedgerTurn(row));
  }

  readUser(userId: UserId): LedgerTurn[] {
    return this.ledger.read(userId).map((row) => this.toLedgerTurn(row));
  }

  readSince(userId: UserId, seq: number): LedgerTurn[] {
    return this.ledger.readSince(userId, seq).map((row) => this.toLedgerTurn(row));
  }

  private toLedgerTurn(row: StoredEvent<SessionTurnRecord>): LedgerTurn {
    return {
      seq: row.seq,
      sessionId: row.event.sessionId,
      entry: row.event.entry
    };
  }
}
