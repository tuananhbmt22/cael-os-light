import type { AuditRecord, Decision, EvidenceRef, IdempotencyKey, Receipt, SessionId, UserId } from "../types/index.js";
import { TurnOutcome } from "../types/index.js";
import { receiptSchema } from "../receipts/receipt-schema.js";
import { validateOrDegrade } from "../validate/structured-output.js";
import type { GateDecision, GateInput } from "../gate/gate-engine.js";
import { buildRuleSet } from "../gate/gate-engine.js";
import { LedgerMemory } from "../kernel/ledger-memory.js";
import type { ValidationError } from "../validate/structured-output.js";
import type { AnswerClaim } from "../verify/verify.js";
import { verify } from "../verify/verify.js";
import type { CorpusScope } from "../ground/ground.js";
import { ground } from "../ground/ground.js";
import type { AuditSink, ResolvedTarget } from "../dual-channel/dual-channel.js";
import { emit } from "../dual-channel/dual-channel.js";
import type { SecondBrain, TriggerConfig, TurnStateForEscalation } from "../graded-cooper/graded-cooper.js";
import { decideEscalation } from "../graded-cooper/graded-cooper.js";

export interface S3Pack {
  packId: string;
  imageSha: string;
  gateRuleSet: unknown;
  corpus: CorpusScope;
  triggerConfig?: TriggerConfig;
}

export interface TurnInput {
  userId: UserId;
  sessionId: SessionId;
  turnId: string;
  subject: unknown;
  object: unknown;
  query: string;
  answerClaim: string | AnswerClaim;
  ctx?: Record<string, unknown>;
  resolvedTargets?: ResolvedTarget[];
  routeAmbiguous?: boolean;
  idempotencyKey?: IdempotencyKey;
  escalationState?: TurnStateForEscalation;
}

export interface TurnDeps {
  ledger?: LedgerMemory;
  auditSink: AuditSink;
  secondBrain?: SecondBrain;
  clock?: () => string;
  idgen?: () => string;
  log?: (errors: ValidationError[]) => void;
}

export interface TurnResult {
  userMessage: string;
  receipt: Receipt;
  audit?: AuditRecord;
  outcome: TurnOutcome;
}

export function runTurn(pack: S3Pack, input: TurnInput, deps: TurnDeps): TurnResult {
  const ledger = deps.ledger ?? new LedgerMemory(undefined, deps.log);
  if (input.routeAmbiguous === true) {
    const receipt = makeReceipt(pack, "refusal", "refuse", "route_ambiguous", [], false);
    appendLedger(ledger, input, TurnOutcome.Clarify, "Please clarify what you want to access.", receipt);
    return { userMessage: "Please clarify what you want to access.", receipt, outcome: TurnOutcome.Clarify };
  }

  const gateInput: GateInput = input.ctx
    ? { subject: input.subject, object: input.object, ctx: input.ctx }
    : { subject: input.subject, object: input.object };
  const gateDecision = buildRuleSet(pack.gateRuleSet).decide(gateInput);

  if (gateDecision.decision === "deny" || gateDecision.decision === "refuse") {
    return runDeniedTurn(pack, input, deps, ledger, gateDecision);
  }

  const grounded = ground(input.query, pack.corpus);
  const verification = verify(input.answerClaim, grounded.units);
  if (!verification.ok) {
    const receipt = makeReceipt(pack, "refusal", "refuse", gateDecision.firing_rule, verification.cited, false);
    appendLedger(ledger, input, verification.outcome, "I can't answer that from the available evidence.", receipt);
    return {
      userMessage: "I can't answer that from the available evidence.",
      receipt,
      outcome: verification.outcome
    };
  }

  const escalation = decideEscalation(
    input.escalationState ?? { retrievalConfidence: averageConfidence(grounded.units) },
    pack.triggerConfig
  );
  if (escalation.escalate && escalation.trigger) {
    if (!deps.secondBrain) {
      const receipt = makeReceipt(pack, "refusal", "refuse", "second_brain_unavailable", verification.cited, true, escalation.trigger);
      appendLedger(ledger, input, TurnOutcome.RefuseEvidence, "I can't complete that review right now.", receipt);
      return { userMessage: "I can't complete that review right now.", receipt, outcome: TurnOutcome.RefuseEvidence };
    }
    const review = deps.secondBrain.review(input.escalationState ?? {}, escalation.trigger);
    if (!review.ok) {
      const receipt = makeReceipt(pack, "refusal", "refuse", "second_brain_failed", verification.cited, true, escalation.trigger);
      appendLedger(ledger, input, TurnOutcome.RefuseEvidence, "I can't complete that review right now.", receipt);
      return { userMessage: "I can't complete that review right now.", receipt, outcome: TurnOutcome.RefuseEvidence };
    }
    const receipt = makeReceipt(pack, "answer", gateDecision.decision, gateDecision.firing_rule, verification.cited, true, escalation.trigger);
    appendLedger(ledger, input, TurnOutcome.Escalate, "Escalated for review.", receipt);
    return { userMessage: "Escalated for review.", receipt, outcome: TurnOutcome.Escalate };
  }

  const receipt = makeReceipt(pack, "answer", gateDecision.decision, gateDecision.firing_rule, verification.cited, false);
  const answer = verification.cited.map((ref) => ref.quote).join(" ");
  appendLedger(ledger, input, TurnOutcome.Answer, answer, receipt);
  return { userMessage: answer, receipt, outcome: TurnOutcome.Answer };
}

function runDeniedTurn(
  pack: S3Pack,
  input: TurnInput,
  deps: TurnDeps,
  ledger: LedgerMemory,
  gateDecision: GateDecision
): TurnResult {
  const dualSinks = input.idempotencyKey
    ? { audit: deps.auditSink, schemaVersion: "phase0.s3", idempotencyKey: input.idempotencyKey }
    : { audit: deps.auditSink, schemaVersion: "phase0.s3" };
  const dual = emit(gateDecision, input.resolvedTargets ?? resolvedFromObject(input.object), dualSinks);
  const evidenceRefs = gateDecision.evidence.map((evidence) => ({
    id: evidence.key,
    source: "gate",
    quote: evidence.value === undefined ? evidence.state : String(evidence.value)
  }));
  const receipt = makeReceipt(pack, "refusal", gateDecision.decision, gateDecision.firing_rule, evidenceRefs, false);
  const outcome = dual.failedClosed ? TurnOutcome.RefuseEvidence : TurnOutcome.RefuseAlternative;
  appendLedger(ledger, input, outcome, dual.userMessage, receipt);
  return dual.audit ? { userMessage: dual.userMessage, receipt, outcome, audit: dual.audit } : { userMessage: dual.userMessage, receipt, outcome };
}

function makeReceipt(
  pack: S3Pack,
  kind: Receipt["kind"],
  decision: Decision,
  firingRule: string,
  evidenceRefs: EvidenceRef[],
  escalationUsed: boolean,
  escalationTrigger?: string
): Receipt {
  const candidate = {
    kind,
    decision,
    firing_rule: firingRule,
    cited_ids: evidenceRefs.map((ref) => ref.id),
    evidence_refs: evidenceRefs,
    confidence: evidenceRefs.length > 0 ? 1 : 0,
    escalation_used: escalationUsed,
    ...(escalationTrigger ? { escalation_trigger: escalationTrigger } : {}),
    pack_id: pack.packId,
    image_sha: pack.imageSha,
    schema_version: "phase0.s3"
  };
  const receipt = validateOrDegrade(receiptSchema, candidate, () => {});
  if (receipt === null) {
    return {
      kind: "refusal",
      decision: "refuse",
      firing_rule: "receipt_degraded",
      cited_ids: [],
      evidence_refs: [],
      confidence: 0,
      escalation_used: false,
      pack_id: pack.packId,
      image_sha: pack.imageSha,
      schema_version: "phase0.s3"
    };
  }
  return receipt;
}

function appendLedger(
  ledger: LedgerMemory,
  input: TurnInput,
  outcome: TurnOutcome,
  text: string,
  receipt: Receipt
): void {
  ledger.appendTurn(
    input.userId,
    input.sessionId,
    {
      turnId: input.turnId,
      outcome,
      text,
      receipt,
      metadata: {}
    },
    input.idempotencyKey
  );
}

function resolvedFromObject(object: unknown): ResolvedTarget[] {
  if (object === null || typeof object !== "object") return [];
  const record = object as Record<string, unknown>;
  if (typeof record.id === "string") return [{ id: record.id }];
  if (Array.isArray(record.ids)) {
    return record.ids.filter((id): id is string => typeof id === "string").map((id) => ({ id }));
  }
  return [];
}

function averageConfidence(units: { confidence?: number }[]): number {
  const values = units.map((unit) => unit.confidence).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return 1;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
