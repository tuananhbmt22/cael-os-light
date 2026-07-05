import type { AuditRecord, EvidenceRef } from "../types/index.js";
import type { GateDecision } from "../gate/gate-engine.js";

export const GENERIC_DENY_MESSAGE = "You don't have access to what you requested.";
export const GENERIC_CLOSED_MESSAGE = "The request could not be completed.";

export interface ResolvedTarget {
  id: string;
  name?: string;
  content?: string;
}

export interface AuditSink {
  write(record: AuditRecord, idempotencyKey?: string): boolean;
}

export interface DualChannelSinks {
  audit: AuditSink;
  schemaVersion?: string;
  idempotencyKey?: string;
}

export interface DualChannelResult {
  userMessage: string;
  auditWritten: boolean;
  audit?: AuditRecord;
  failedClosed: boolean;
}

export class MemoryAuditSink implements AuditSink {
  private readonly keys = new Set<string>();
  readonly records: AuditRecord[];

  constructor(records: AuditRecord[] = []) {
    this.records = records;
  }

  write(record: AuditRecord, idempotencyKey?: string): boolean {
    if (idempotencyKey) {
      if (this.keys.has(idempotencyKey)) return true;
      this.keys.add(idempotencyKey);
    }
    this.records.push(JSON.parse(JSON.stringify(record)) as AuditRecord);
    return true;
  }
}

export function emit(decision: GateDecision, resolved: ResolvedTarget[], sinks: DualChannelSinks): DualChannelResult {
  const audit: AuditRecord = {
    resolved_target_ids: resolved.map((target) => target.id),
    decision: decision.decision,
    evidence: decision.evidence.map(toEvidenceRef),
    firing_rule: decision.firing_rule,
    schema_version: sinks.schemaVersion ?? "phase0.s3"
  };

  const auditWritten = sinks.audit.write(audit, sinks.idempotencyKey);
  if (!auditWritten) {
    return {
      userMessage: GENERIC_CLOSED_MESSAGE,
      auditWritten: false,
      failedClosed: true
    };
  }

  return {
    userMessage: GENERIC_DENY_MESSAGE,
    auditWritten: true,
    audit,
    failedClosed: false
  };
}

function toEvidenceRef(evidence: GateDecision["evidence"][number]): EvidenceRef {
  return {
    id: evidence.key,
    source: "gate",
    quote: evidence.value === undefined ? evidence.state : String(evidence.value)
  };
}
