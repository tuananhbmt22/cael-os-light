import { MemoryAuditSink, runTurn } from "@cael/os-light";
import type { S3Pack, SecondBrain, TurnInput, TurnResult } from "@cael/os-light";
import { p1RbacPack, PACK_ID, PACK_IMAGE_SHA } from "./pack.js";
import { p1RbacRuleSet, canonicalDepartment, canonicalRole } from "./rbac-rule-set.js";
import { identifyDocuments } from "./identify.js";
import { syntheticCorpus } from "./synthetic-corpus.js";

export interface P1TurnRequest {
  userId?: string;
  sessionId?: string;
  turnId: string;
  query: string;
  user_role: string;
  user_department: string;
  answerClaim?: string;
  escalationState?: {
    retrievalConfidence?: number;
    permissionBoundaryProximity?: number;
    stepUpAction?: boolean;
    residualMetadataIntentConflict?: boolean;
  };
}

export interface P1TurnResponse extends TurnResult {
  auditRecords: MemoryAuditSink["records"];
  secondBrainCalls: number;
}

class CountingSecondBrain implements SecondBrain {
  calls = 0;
  review() {
    this.calls += 1;
    return { ok: true } as const;
  }
}

export function runP1Turn(state: unknown, request: P1TurnRequest): P1TurnResponse {
  const auditSink = new MemoryAuditSink();
  const secondBrain = new CountingSecondBrain();
  const identified = identifyDocuments(state, request, p1RbacPack.corpus);
  const pack: S3Pack = {
    packId: PACK_ID,
    imageSha: PACK_IMAGE_SHA,
    gateRuleSet: p1RbacRuleSet,
    corpus: { units: syntheticCorpus }
  };
  if (p1RbacPack.trigger_config !== undefined) pack.triggerConfig = p1RbacPack.trigger_config;
  const turnInput: TurnInput = {
    userId: request.userId ?? "synthetic-user",
    sessionId: request.sessionId ?? "synthetic-session",
    turnId: request.turnId,
    subject: {
      role: canonicalRole(request.user_role),
      user_dept: canonicalDepartment(request.user_department)
    },
    object: {
      docs: identified.docs.map((doc) => ({
        id: doc.id,
        doc_dept: canonicalDepartment(doc.department),
        doc_classification: doc.classification,
        ...(doc.blocks ? { blocks: doc.blocks } : {})
      }))
    },
    query: request.query,
    answerClaim: request.answerClaim ?? request.query,
    resolvedTargets: identified.docs.map((doc) => ({ id: doc.id })),
    routeAmbiguous: identified.routeAmbiguous,
    idempotencyKey: request.turnId
  };
  if (request.escalationState !== undefined) turnInput.escalationState = request.escalationState;
  const result = runTurn(
    pack,
    turnInput,
    { auditSink, secondBrain }
  );
  return { ...result, auditRecords: auditSink.records, secondBrainCalls: secondBrain.calls };
}
