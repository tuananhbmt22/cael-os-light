import { describe, expect, it } from "vitest";
import { TurnOutcome, receiptSchema, validate } from "@cael/os-light";
import { runP1Turn } from "../src/turn.js";
import { syntheticDocuments } from "../src/synthetic-corpus.js";

describe("T7 receipts and graded-cooper", () => {
  it("ordinary allowed turns validate receipts and make zero second-brain calls", () => {
    const result = runP1Turn(
      { documents: syntheticDocuments },
      {
        turnId: "ordinary-allow",
        query: "operations kpi completion",
        user_role: "Manager",
        user_department: "Operations",
        answerClaim: "Operations KPI completion is 93 percent."
      }
    );

    expect(result.outcome).toBe(TurnOutcome.Answer);
    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.receipt.escalation_used).toBe(false);
    expect(result.secondBrainCalls).toBe(0);
  });

  it("multi-doc denied turns put the union of target ids in the audit channel", () => {
    const result = runP1Turn(
      { documents: syntheticDocuments },
      {
        turnId: "multi-doc-deny",
        query: "finance forecast and executive strategy",
        user_role: "Manager",
        user_department: "Finance"
      }
    );

    expect(validate(receiptSchema, result.receipt).ok).toBe(true);
    expect(result.auditRecords[0]?.resolved_target_ids).toEqual(["SYN-FIN-011", "SYN-EXEC-037"]);
  });

  it("residual and step-up states escalate visibly", () => {
    const residual = runP1Turn(
      { documents: syntheticDocuments },
      {
        turnId: "residual-escalates",
        query: "operations kpi completion",
        user_role: "Manager",
        user_department: "Finance",
        answerClaim: "Operations KPI completion is 93 percent.",
        escalationState: { residualMetadataIntentConflict: true }
      }
    );
    const stepUp = runP1Turn(
      { documents: syntheticDocuments },
      {
        turnId: "step-up-escalates",
        query: "finance forecast variance",
        user_role: "Executive",
        user_department: "Executive Office",
        answerClaim: "Finance forecast variance is 12.",
        escalationState: { stepUpAction: true }
      }
    );

    expect(residual.outcome).toBe(TurnOutcome.Escalate);
    expect(residual.receipt.escalation_used).toBe(true);
    expect(residual.receipt.escalation_trigger).toBe("residual_metadata_intent_conflict");
    expect(stepUp.outcome).toBe(TurnOutcome.Escalate);
    expect(stepUp.receipt.escalation_trigger).toBe("step_up_action");
  });
});
