import type { AuditRecord, Decision, EvidenceRef, Receipt } from "../types/index.js";
import type { Schema, Validated } from "../validate/structured-output.js";
import { s } from "../validate/structured-output.js";

const decisionSchema: Schema<Decision> = s.enumOf(["allow", "deny", "score", "refuse"] as const);

export const evidenceRefSchema: Schema<EvidenceRef> = s.object(
  {
    id: s.string(),
    source: s.string(),
    quote: s.string()
  },
  "EvidenceRef"
);

const receiptBaseSchema: Schema<Receipt> = s.object(
  {
    kind: s.enumOf(["answer", "refusal"] as const),
    decision: decisionSchema,
    firing_rule: s.string(),
    cited_ids: s.array(s.string()),
    evidence_refs: s.array(evidenceRefSchema),
    confidence: s.number(),
    escalation_used: s.boolean(),
    escalation_trigger: s.optional(s.string()),
    pack_id: s.string(),
    image_sha: s.string(),
    schema_version: s.string()
  },
  "Receipt"
);

export const receiptSchema: Schema<Receipt> = {
  name: "Receipt",
  validate(input: unknown, path?: string): Validated<Receipt> {
    const result = receiptBaseSchema.validate(input, path);
    if (!result.ok) return result;
    return {
      ok: true,
      value: {
        ...result.value,
        cited_ids: [...new Set(result.value.cited_ids)]
      }
    };
  }
};

export const auditRecordSchema: Schema<AuditRecord> = s.object(
  {
    resolved_target_ids: s.array(s.string()),
    decision: decisionSchema,
    evidence: s.array(evidenceRefSchema),
    firing_rule: s.string(),
    schema_version: s.string()
  },
  "AuditRecord"
);
