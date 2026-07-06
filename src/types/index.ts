export type UserId = string;
export type SessionId = string;
export type EntityKey = string;
export type IdempotencyKey = string;

export type Decision = "allow" | "deny" | "score" | "refuse";

export enum TurnOutcome {
  Answer = "answer",
  RefuseEvidence = "refuse_evidence",
  RefuseAlternative = "refuse_alternative",
  Clarify = "clarify",
  Escalate = "escalate"
}

export type EvidenceState = "present" | "absent" | "unknown";

export interface EvidenceRef {
  id: string;
  source: string;
  quote: string;
}

export interface Evidence {
  ref: EvidenceRef;
  state: EvidenceState;
  value: string;
}

export interface Receipt {
  kind: "answer" | "refusal";
  decision: Decision;
  firing_rule: string;
  cited_ids: string[];
  evidence_refs: EvidenceRef[];
  confidence: number;
  escalation_used: boolean;
  escalation_trigger?: string | undefined;
  pack_id: string;
  image_sha: string;
  schema_version: string;
}

export interface AuditRecord {
  resolved_target_ids: string[];
  decision: Decision;
  evidence: EvidenceRef[];
  firing_rule: string;
  schema_version: string;
}
