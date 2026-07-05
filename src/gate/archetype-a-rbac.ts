import type { EvidenceState } from "../types/index.js";
import type { DecisionEvidence, GateDecision, GateInput, GateRuleSet } from "./gate-engine.js";
import type { RbacAccessRow, RbacRuleSetData } from "./rule-set-schema.js";

interface RbacSubject {
  role: string;
  user_dept: string;
}

interface RbacDoc {
  id: string;
  doc_dept: string;
  doc_classification: string;
  blocks?: { classification: string }[];
}

interface RbacObject {
  docs: RbacDoc[];
}

interface DocDecision {
  decision: "allow" | "deny";
  firingRule: string;
  rank: number;
  classification: string;
  docDept: string;
}

export function createRbacRuleSet(data: RbacRuleSetData): GateRuleSet {
  const roles = new Set(data.roles);
  const departments = new Set(data.departments);
  const classificationRanks = new Map(data.classifications.map((classification) => [classification.id, classification.rank]));
  const maxRank = Math.max(...data.classifications.map((classification) => classification.rank));
  const accessRows = [...data.access];
  const roleHierarchy = new Map(Object.entries(data.role_hierarchy));

  return {
    archetype: "A",
    decide(input: GateInput): GateDecision {
      const parsed = parseRbacInput(input);
      if (!parsed.ok) return deny(parsed.firingRule, parsed.evidence);

      const role = normalize(data.normalization.roles, parsed.subject.role);
      const userDept = normalize(data.normalization.departments, parsed.subject.user_dept);
      const baseEvidence: DecisionEvidence[] = [
        evidence("role", "present", role),
        evidence("user_dept", "present", userDept),
        evidence("doc_count", "present", parsed.object.docs.length)
      ];

      if (!roles.has(role)) return deny("rbac_unknown_role", baseEvidence);
      if (!departments.has(userDept)) return deny("rbac_unknown_department", baseEvidence);

      const docDecisions = parsed.object.docs.map((doc) =>
        decideDoc(doc, role, userDept, accessRows, roleHierarchy, classificationRanks, maxRank)
      );
      const denies = docDecisions.filter((doc): doc is DocDecision & { decision: "deny" } => doc.decision === "deny");
      const selected = denies.length > 0 ? densest(denies) : densest(docDecisions);

      return {
        decision: denies.length > 0 ? "deny" : "allow",
        firing_rule: selected.firingRule,
        evidence: [
          ...baseEvidence,
          evidence("classification", "present", selected.classification),
          evidence("doc_dept", "present", selected.docDept)
        ]
      };
    }
  };
}

function decideDoc(
  doc: RbacDoc,
  role: string,
  userDept: string,
  accessRows: RbacAccessRow[],
  roleHierarchy: Map<string, string[]>,
  classificationRanks: Map<string, number>,
  maxRank: number
): DocDecision {
  const classification = mostRestrictiveClassification(doc, classificationRanks);
  const rank = classificationRanks.get(classification) ?? maxRank + 1;
  const docDept = doc.doc_dept;

  if (classification === "Privileged" && role !== "Executive") {
    return {
      decision: "deny",
      firingRule: `rbac_privileged_executive_only:${doc.id}`,
      rank,
      classification,
      docDept
    };
  }

  const activeRoles = new Set([role, ...(roleHierarchy.get(role) ?? [])]);
  const matchingRows = accessRows.filter(
    (row) =>
      activeRoles.has(row.role) &&
      row.classification === classification &&
      (!row.same_dept || userDept === docDept)
  );
  const allowRow = matchingRows.find((row) => row.allow);
  if (allowRow) {
    return {
      decision: "allow",
      firingRule: allowRow.rule_id,
      rank,
      classification,
      docDept
    };
  }
  const denyRow = matchingRows.find((row) => !row.allow);
  return {
    decision: "deny",
    firingRule: denyRow?.rule_id ?? `rbac_no_matching_allow:${doc.id}`,
    rank,
    classification,
    docDept
  };
}

function mostRestrictiveClassification(doc: RbacDoc, classificationRanks: Map<string, number>): string {
  const classifications = [doc.doc_classification, ...(doc.blocks?.map((block) => block.classification) ?? [])];
  return classifications.reduce((best, candidate) => {
    const bestRank = classificationRanks.get(best) ?? Number.POSITIVE_INFINITY;
    const candidateRank = classificationRanks.get(candidate) ?? Number.POSITIVE_INFINITY;
    return candidateRank > bestRank ? candidate : best;
  }, classifications[0] ?? doc.doc_classification);
}

function densest<T extends DocDecision>(decisions: T[]): T {
  return [...decisions].sort((left, right) => right.rank - left.rank || left.firingRule.localeCompare(right.firingRule))[0] as T;
}

function normalize(dictionary: Record<string, string>, value: string): string {
  return dictionary[value] ?? value;
}

function parseRbacInput(input: GateInput):
  | { ok: true; subject: RbacSubject; object: RbacObject }
  | { ok: false; firingRule: string; evidence: DecisionEvidence[] } {
  if (input.subject === null || typeof input.subject !== "object" || Array.isArray(input.subject)) {
    return { ok: false, firingRule: "rbac_input_subject_malformed", evidence: [] };
  }
  if (input.object === null || typeof input.object !== "object" || Array.isArray(input.object)) {
    return { ok: false, firingRule: "rbac_input_object_malformed", evidence: [] };
  }
  const subject = input.subject as Record<string, unknown>;
  const object = input.object as Record<string, unknown>;
  if (typeof subject.role !== "string" || typeof subject.user_dept !== "string") {
    return { ok: false, firingRule: "rbac_input_subject_malformed", evidence: [] };
  }
  if (!Array.isArray(object.docs) || object.docs.length === 0) {
    return { ok: false, firingRule: "rbac_input_docs_malformed", evidence: [] };
  }
  const docs: RbacDoc[] = [];
  for (const rawDoc of object.docs) {
    if (rawDoc === null || typeof rawDoc !== "object" || Array.isArray(rawDoc)) {
      return { ok: false, firingRule: "rbac_input_docs_malformed", evidence: [] };
    }
    const doc = rawDoc as Record<string, unknown>;
    if (
      typeof doc.id !== "string" ||
      typeof doc.doc_dept !== "string" ||
      typeof doc.doc_classification !== "string"
    ) {
      return { ok: false, firingRule: "rbac_input_docs_malformed", evidence: [] };
    }
    const blocks = Array.isArray(doc.blocks)
      ? doc.blocks.map((block) => {
          if (block === null || typeof block !== "object" || Array.isArray(block)) return null;
          const typedBlock = block as Record<string, unknown>;
          return typeof typedBlock.classification === "string" ? { classification: typedBlock.classification } : null;
        })
      : undefined;
    if (blocks?.some((block) => block === null)) {
      return { ok: false, firingRule: "rbac_input_blocks_malformed", evidence: [] };
    }
    const parsedDoc: RbacDoc = {
      id: doc.id,
      doc_dept: doc.doc_dept,
      doc_classification: doc.doc_classification
    };
    if (blocks) parsedDoc.blocks = blocks as { classification: string }[];
    docs.push(parsedDoc);
  }
  return {
    ok: true,
    subject: { role: subject.role, user_dept: subject.user_dept },
    object: { docs }
  };
}

function deny(firingRule: string, evidenceRows: DecisionEvidence[]): GateDecision {
  return {
    decision: "deny",
    firing_rule: firingRule,
    evidence: evidenceRows
  };
}

function evidence(key: string, state: EvidenceState, value: string | number | boolean): DecisionEvidence {
  return { key, state, value };
}
