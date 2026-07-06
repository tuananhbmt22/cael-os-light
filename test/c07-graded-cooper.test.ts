import { describe, expect, it } from "vitest";
import { decideEscalation, MemoryAuditSink, runTurn, TurnOutcome } from "../src/index.js";
import type { S3Pack, SecondBrain, TurnInput } from "../src/index.js";
import { readFixture } from "./helpers.js";

class SpySecondBrain implements SecondBrain {
  calls = 0;
  constructor(private readonly fail = false) {}
  review() {
    this.calls += 1;
    return this.fail ? ({ ok: false, reason: "fixture failure" } as const) : ({ ok: true } as const);
  }
}

describe("c07 graded-cooper", () => {
  it("H ordinary-rows-zero-secondbrain-calls stays on deterministic path", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput }>(
      "../fixtures/phase0/c07/H/ordinary-rows-zero-secondbrain-calls/input.json"
    );
    const secondBrain = new SpySecondBrain();
    const result = runTurn(fixture.pack, fixture.input, { auditSink: new MemoryAuditSink(), secondBrain });

    expect(result.outcome).toBe(TurnOutcome.Answer);
    expect(secondBrain.calls).toBe(0);
    expect(result.receipt.escalation_used).toBe(false);
  });

  it.each([
    ["residual-trigger-escalates", "residual_metadata_intent_conflict"],
    ["step-up-trigger-escalates", "step_up_action"],
    ["low-confidence-trigger-escalates", "low_retrieval_confidence"]
  ])("R %s escalates and records trigger in receipt", (id, trigger) => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput }>(`../fixtures/phase0/c07/R/${id}/input.json`);
    const secondBrain = new SpySecondBrain();
    const result = runTurn(fixture.pack, fixture.input, { auditSink: new MemoryAuditSink(), secondBrain });

    expect(result.outcome).toBe(TurnOutcome.Escalate);
    expect(secondBrain.calls).toBe(1);
    expect(result.receipt.escalation_used).toBe(true);
    expect(result.receipt.escalation_trigger).toBe(trigger);
  });

  it("M escalation-seam-failure-refuses-not-answers", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput }>(
      "../fixtures/phase0/c07/M/escalation-seam-failure-refuses-not-answers/input.json"
    );
    const result = runTurn(fixture.pack, fixture.input, {
      auditSink: new MemoryAuditSink(),
      secondBrain: new SpySecondBrain(true)
    });

    expect(result.outcome).toBe(TurnOutcome.RefuseEvidence);
    expect(result.receipt.kind).toBe("refusal");
    expect(result.receipt.escalation_used).toBe(true);
  });

  it("I same-trigger-same-escalation-replay is deterministic", () => {
    const fixture = readFixture<{ pack: S3Pack; state: TurnInput["escalationState"] }>(
      "../fixtures/phase0/c07/I/same-trigger-same-escalation-replay/input.json"
    );
    const first = decideEscalation(fixture.state ?? {}, fixture.pack.triggerConfig);
    const second = decideEscalation(fixture.state ?? {}, fixture.pack.triggerConfig);

    expect(first).toEqual(second);
  });

  it("S trigger-config-change-applies without code change", () => {
    const fixture = readFixture<{ packA: S3Pack; packB: S3Pack; state: TurnInput["escalationState"] }>(
      "../fixtures/phase0/c07/S/trigger-config-change-applies/input.json"
    );

    expect(decideEscalation(fixture.state ?? {}, fixture.packA.triggerConfig).escalate).toBe(false);
    expect(decideEscalation(fixture.state ?? {}, fixture.packB.triggerConfig).trigger).toBe("low_retrieval_confidence");
  });
});
