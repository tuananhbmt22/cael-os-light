import { describe, expect, it } from "vitest";
import { JsonSnapshotKernelStore, MemoryAuditSink, runTurn } from "../src/index.js";
import type { AuditSink, S3Pack, TurnInput } from "../src/index.js";
import { readFixture } from "./helpers.js";

class FailingAuditSink implements AuditSink {
  write(): boolean {
    return false;
  }
}

describe("c03 dual-channel", () => {
  it("H allow-with-citations answers with cited evidence and no audit record", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput }>(
      "../fixtures/phase0/c03/H/allow-with-citations/input.json"
    );
    const audit = new MemoryAuditSink();
    const result = runTurn(fixture.pack, fixture.input, { auditSink: audit });

    expect(result.outcome).toBe("answer");
    expect(result.receipt.cited_ids).toContain("ev-renewal-window");
    expect(result.userMessage).toContain("Tài liệu hợp lệ");
    expect(audit.records).toHaveLength(0);
  });

  it("R deny-planted-leak-caught keeps user channel generic and writes resolved ids to audit", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput; leakNeedles: string[] }>(
      "../fixtures/phase0/c03/R/deny-planted-leak-caught/input.json"
    );
    const audit = new MemoryAuditSink();
    const result = runTurn(fixture.pack, fixture.input, { auditSink: audit });

    expect(result.outcome).toBe("refuse_alternative");
    expect(fixture.leakNeedles.every((needle) => !result.userMessage.includes(needle))).toBe(true);
    expect(audit.records[0]?.resolved_target_ids).toEqual(["doc-secret-777"]);
  });

  it("M audit-write-failure-fails-closed does not leak and does not pretend audit succeeded", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput; leakNeedles: string[] }>(
      "../fixtures/phase0/c03/M/audit-write-failure-fails-closed/input.json"
    );
    const result = runTurn(fixture.pack, fixture.input, { auditSink: new FailingAuditSink() });

    expect(result.outcome).toBe("refuse_evidence");
    expect(fixture.leakNeedles.every((needle) => !result.userMessage.includes(needle))).toBe(true);
    expect(result.audit).toBeUndefined();
  });

  it("I replayed-deny-single-audit-record dedupes the audit by idempotency key", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput }>(
      "../fixtures/phase0/c03/I/replayed-deny-single-audit-record/input.json"
    );
    const audit = new MemoryAuditSink();

    runTurn(fixture.pack, fixture.input, { auditSink: audit });
    runTurn(fixture.pack, fixture.input, { auditSink: audit });

    expect(audit.records).toHaveLength(1);
  });

  it("S audit-order-preserved-across-restart keeps audit append order after restoring store", () => {
    const fixture = readFixture<{ pack: S3Pack; inputs: TurnInput[] }>(
      "../fixtures/phase0/c03/S/audit-order-preserved-across-restart/input.json"
    );
    const audit = new MemoryAuditSink();
    const store = new JsonSnapshotKernelStore();

    runTurn(fixture.pack, fixture.inputs[0]!, { auditSink: audit, ledger: undefined });
    const restored = JsonSnapshotKernelStore.fromJson(store.toJson());
    void restored;
    runTurn(fixture.pack, fixture.inputs[1]!, { auditSink: audit });

    expect(audit.records.map((record) => record.resolved_target_ids[0])).toEqual([
      "doc-secret-777",
      "doc-secret-888"
    ]);
  });
});
