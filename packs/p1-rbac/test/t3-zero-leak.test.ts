import { describe, expect, it } from "vitest";
import { GENERIC_DENY_MESSAGE, auditRecordSchema, validate } from "@cael/os-light";
import { runP1Turn } from "../src/turn.js";
import { syntheticDocuments } from "../src/synthetic-corpus.js";

describe("T3 zero leak", () => {
  it("denies restricted rows with a generic user message and audit-only ids", () => {
    const result = runP1Turn(
      { documents: syntheticDocuments },
      {
        turnId: "deny-restricted-employee",
        query: "executive strategy acquisition",
        user_role: "Employee",
        user_department: "Finance"
      }
    );

    expect(result.userMessage).toBe(GENERIC_DENY_MESSAGE);
    expect(result.auditRecords[0]?.resolved_target_ids).toEqual(["SYN-EXEC-037"]);
    expect(validate(auditRecordSchema, result.auditRecords[0]).ok).toBe(true);
    expect(result.userMessage).not.toContain("SYN-EXEC-037");
    expect(result.userMessage).not.toMatch(/executive|strategy|acquisition/i);
  });

  it("refuses a denied near-duplicate instead of substituting a visible neighbor", () => {
    const result = runP1Turn(
      { documents: syntheticDocuments },
      {
        turnId: "decoy-abstention",
        query: "access code decoy operations",
        user_role: "Employee",
        user_department: "Operations"
      }
    );

    expect(result.userMessage).toBe(GENERIC_DENY_MESSAGE);
    expect(result.auditRecords[0]?.resolved_target_ids).toEqual(["SYN-DECOY-016"]);
    expect(result.userMessage).not.toContain("SYN-DECOY-016");
  });
});
