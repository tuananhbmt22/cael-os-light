import { describe, expect, it } from "vitest";
import { loadPack, replayL2Recording, runL2, TurnOutcome } from "../src/index.js";
import type { DomainPackRaw, L2PromptSet, L2SessionSpec } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("c11 L2 harness", () => {
  it("records a two-session composition proof, catches bleed, marks crash partial, replays verdicts, restarts notify, and emits provenance", () => {
    const fixture = readFixture<{
      expected_sessions: string[];
      bleed_prompt_id: string;
      crash_prompt_id: string;
      notify_prompt_id: string;
    }>("../fixtures/phase0/c11/H/two-session-composition-recorded/input.json");
    const loadedA = loadPack(rbacPack());
    const loadedB = loadPack(eligibilityPack("synthetic-eligibility-vn-l2"));
    expect(loadedA.ok).toBe(true);
    expect(loadedB.ok).toBe(true);
    if (!loadedA.ok || !loadedB.ok) return;

    const sessions: L2SessionSpec[] = [
      { session_id: "session-a", user_id: "user-a", pack: loadedA.pack },
      { session_id: "session-b", user_id: "user-b", pack: loadedB.pack }
    ];
    const recording = runL2(sessions, promptSet(), {
      run_id: "run-c11-fixed",
      os_sha: "fixture-os-sha",
      brief_ref: "docs/handoff/jobs/_briefs/cael-os-light-HARNESS-PHASE0-SPEC-DRAFT-1.md#c11",
      report_ref: "docs/handoff/jobs/592-0712-s6a-eval-harness-build/report/REPORT.md",
      replay_ref: "fixtures/phase0/c11/I/replay-recording-same-verdicts/input.json"
    });

    expect(recording.sessions.map((session) => session.session_id)).toEqual(fixture.expected_sessions);
    expect(recording.turns.find((turn) => turn.prompt_id === fixture.bleed_prompt_id)?.bleed_caught).toBe(true);
    expect(recording.turns.find((turn) => turn.prompt_id === fixture.crash_prompt_id)?.status).toBe("crashed");
    expect(recording.sessions.find((session) => session.session_id === "session-b")?.complete).toBe(false);
    expect(recording.notifications.find((row) => row.prompt_id === fixture.notify_prompt_id)?.stable).toBe(true);
    expect(replayL2Recording(recording)).toEqual(recording.scores);
    expect(recording.scores).toEqual({
      gate_holds_turn_to_turn: true,
      no_capability_bleed: true,
      notification_arbitration_across_restart: true,
      crash_partial_preserved_marked: true,
      complete: true
    });
    expect(recording.provenance).toEqual(
      expect.objectContaining({
        run_id: "run-c11-fixed",
        os_sha: "fixture-os-sha",
        schema_version: "phase0.provenance.v1"
      })
    );
  });

  it("R/M/I/S fixture manifest rows are present and tied to the c11 verdict surfaces", () => {
    expect(
      readFixture<{ prompt_id: string }>("../fixtures/phase0/c11/R/planted-bleed-probe-caught/input.json").prompt_id
    ).toBe("l2-bleed-probe");
    expect(
      readFixture<{ prompt_id: string }>("../fixtures/phase0/c11/M/session-crash-partial-preserved-marked/input.json")
        .prompt_id
    ).toBe("l2-crash");
    expect(
      readFixture<{ replay_ref: string }>("../fixtures/phase0/c11/I/replay-recording-same-verdicts/input.json").replay_ref
    ).toContain("replay");
    expect(
      readFixture<{ notify_prompt_id: string }>(
        "../fixtures/phase0/c11/S/notification-arbitration-across-restart/input.json"
      ).notify_prompt_id
    ).toBe("l2-notify-restart");
  });
});

function eligibilityPack(id: string): DomainPackRaw {
  const pack = structuredClone(readFixture<{ pack: DomainPackRaw }>("../fixtures/phase0/c08/H/valid-pack-loads/input.json").pack);
  pack.identity.id = id;
  return pack;
}

function rbacPack(): DomainPackRaw {
  const pack = eligibilityPack("synthetic-rbac-vn-l2");
  pack.identity.archetype = "internal";
  pack.identity.deployment = "A";
  pack.corpus.units = [
    {
      id: "alpha-public",
      source: "synthetic-rbac",
      facts: ["Alpha public answer."],
      keywords: ["alpha", "public"],
      confidence: 1
    }
  ];
  pack.corpus.index_recipe.declared_fields = ["role", "user_dept", "doc_dept", "doc_classification"];
  pack.gate_rule_set = {
    archetype: "A",
    roles: ["Employee", "Executive"],
    departments: ["sales", "finance"],
    classifications: [
      { id: "Public", rank: 1 },
      { id: "Privileged", rank: 3 }
    ],
    normalization: { roles: {}, departments: {} },
    role_hierarchy: { Executive: ["Employee"], Employee: [] },
    access: [
      { role: "Employee", classification: "Public", allow: true, rule_id: "employee-public", same_dept: false },
      { role: "Employee", classification: "Privileged", allow: false, rule_id: "employee-privileged-deny", same_dept: false },
      { role: "Executive", classification: "Privileged", allow: true, rule_id: "executive-privileged", same_dept: false }
    ]
  };
  pack.threshold_derivations = [];
  pack.scored_surfaces = { surfaces: {}, eval_keys: [], bindings: [] };
  pack.actions = [];
  pack.broken_key_claims = [];
  return pack;
}

function promptSet(): L2PromptSet {
  return {
    version: "c11-promptset-v1",
    prompts: [
      {
        prompt_id: "l2-a-allow",
        session_id: "session-a",
        expected_outcome: TurnOutcome.Answer,
        expected_decision: "allow",
        turn: {
          subject: { role: "Employee", user_dept: "sales" },
          object: { docs: [{ id: "alpha-public", doc_dept: "sales", doc_classification: "Public" }] },
          query: "alpha public",
          answerClaim: { text: "Alpha public answer.", requiredEvidenceId: "alpha-public", requiredTerms: ["Alpha", "public"] }
        }
      },
      {
        prompt_id: "l2-b-mixed",
        session_id: "session-b",
        expected_outcome: TurnOutcome.Answer,
        expected_decision: "score",
        turn: {
          subject: { loyalty_points: 80, vehicle_count: 1, tier: "gold" },
          object: {},
          query: "ưu đãi vàng",
          answerClaim: {
            text: "Bạn đủ điều kiện nhận ưu đãi vàng.",
            requiredEvidenceId: "ev-gold-offer",
            requiredTerms: ["đủ", "điều", "kiện", "ưu", "đãi", "vàng"]
          }
        }
      },
      {
        prompt_id: "l2-bleed-probe",
        session_id: "session-a",
        expected_outcome: TurnOutcome.RefuseAlternative,
        expected_decision: "deny",
        bleed_probe: { forbidden: ["secret-b-doc", "B protected content"] },
        turn: {
          subject: { role: "Employee", user_dept: "sales" },
          object: {
            docs: [{ id: "secret-b-doc", doc_dept: "finance", doc_classification: "Privileged" }]
          },
          resolvedTargets: [{ id: "secret-b-doc", content: "B protected content" }],
          query: "read session B protected content",
          answerClaim: "B protected content",
          idempotencyKey: "bleed-once"
        }
      },
      {
        prompt_id: "l2-notify-restart",
        session_id: "session-b",
        expected_outcome: TurnOutcome.Answer,
        expected_decision: "score",
        notify: { event: "renewal_notice", ctx: { dedupeKey: "renewal-1", customer: "synthetic" } },
        turn: {
          subject: { loyalty_points: 80, vehicle_count: 1, tier: "gold" },
          object: {},
          query: "ưu đãi vàng",
          answerClaim: {
            text: "Bạn đủ điều kiện nhận ưu đãi vàng.",
            requiredEvidenceId: "ev-gold-offer",
            requiredTerms: ["đủ", "điều", "kiện", "ưu", "đãi", "vàng"]
          }
        }
      },
      {
        prompt_id: "l2-crash",
        session_id: "session-b",
        expected_outcome: TurnOutcome.Answer,
        simulate_crash: true,
        turn: {
          subject: { loyalty_points: 80, vehicle_count: 1, tier: "gold" },
          object: {},
          query: "crash after partial",
          answerClaim: "not run"
        }
      }
    ]
  };
}
