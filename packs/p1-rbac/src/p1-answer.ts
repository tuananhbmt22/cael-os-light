import { buildRuleSet } from "@cael/os-light";
import type { CorpusScope } from "@cael/os-light";
import { p1RbacRuleSet, canonicalDepartment, canonicalRole, type P1Permission } from "./rbac-rule-set.js";
import { identifyDocuments } from "./identify.js";
import { syntheticCorpus } from "./synthetic-corpus.js";

export interface P1AnswerRecord {
  permission: P1Permission;
  document_id: string | string[] | null;
}

const fallbackCorpus: CorpusScope = { units: syntheticCorpus };

export function p1_answer(state: unknown, input: unknown): P1AnswerRecord {
  const request = isRecord(input) ? input : {};
  const identified = identifyDocuments(state, request, fallbackCorpus);
  if (identified.routeAmbiguous || identified.docs.length === 0) {
    return { permission: "Deny", document_id: null };
  }

  const subject = {
    role: canonicalRole(request.user_role),
    user_dept: canonicalDepartment(request.user_department)
  };
  const object = {
    docs: identified.docs.map((doc) => {
      const gateDoc: { id: string; doc_dept: string; doc_classification: string; blocks?: { classification: string }[] } = {
        id: doc.id,
        doc_dept: canonicalDepartment(doc.department),
        doc_classification: doc.classification
      };
      if (doc.blocks) gateDoc.blocks = doc.blocks;
      return gateDoc;
    })
  };
  const decision = buildRuleSet(p1RbacRuleSet).decide({ subject, object });
  const documentIds = identified.docs.map((doc) => doc.id);
  return {
    permission: decision.decision === "allow" ? "Allow" : "Deny",
    document_id: documentIds.length === 1 ? documentIds[0] ?? null : documentIds
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
