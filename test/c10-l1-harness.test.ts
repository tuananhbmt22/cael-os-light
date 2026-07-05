import { describe, expect, it } from "vitest";
import { judgeRubric, loadPack, scoreL1 } from "../src/index.js";
import type { DomainPackRaw, L1EvalSet, RubricJudge, ScoredFunctionMap } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("c10 L1 harness", () => {
  it("H scored-fn-end-to-end-report scores every declared key and names PUBLIC scope", () => {
    const fixture = readFixture<{ eval_set_version: string; expected_public_eval_keys: string[] }>(
      "../fixtures/phase0/c10/H/scored-fn-end-to-end-report/input.json"
    );
    const loaded = loadPack(l1Pack());
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const report = scoreL1(loaded.pack, goodScoredFns(), evalSet(fixture.eval_set_version));

    expect(report.public_scope.eval_keys).toEqual(fixture.expected_public_eval_keys);
    expect(report.keys.map((key) => key.eval_key).sort()).toEqual(fixture.expected_public_eval_keys);
    expect(report.keys.every((key) => key.scope === "PUBLIC")).toBe(true);
    expect(report.keys.every((key) => key.scored_count === 2)).toBe(true);
  });

  it("R planted-broken-key-quarantined-with-claim proves claim-gated quarantine in both directions", () => {
    const fixture = readFixture<{ claimed_case: string; unclaimed_case: string }>(
      "../fixtures/phase0/c10/R/planted-broken-key-quarantined-with-claim/input.json"
    );
    const loaded = loadPack(l1Pack());
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const report = scoreL1(loaded.pack, goodScoredFns(), evalSet("c10-claim-gated-v1"));

    expect(report.rows.filter((row) => row.case_id === fixture.claimed_case && row.disposition === "quarantined")).toHaveLength(2);
    expect(report.client_flags.map((flag) => flag.case_id)).toContain(fixture.claimed_case);
    const unclaimedRows = report.rows.filter((row) => row.case_id === fixture.unclaimed_case);
    expect(unclaimedRows).toHaveLength(2);
    expect(unclaimedRows.every((row) => row.disposition === "scored" && row.correct === false)).toBe(true);
    expect(report.keys.every((key) => key.quarantined_count === 1 && key.score === 0.5)).toBe(true);
  });

  it("M fn-schema-violating-output-caught records structured-output errors", () => {
    const fixture = readFixture<{ bad_fn: string }>(
      "../fixtures/phase0/c10/M/fn-schema-violating-output-caught/input.json"
    );
    const loaded = loadPack(l1Pack());
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const report = scoreL1(
      loaded.pack,
      {
        ...goodScoredFns(),
        [fixture.bad_fn]: () => ({ wrong_surface: "gold" })
      },
      evalSet("c10-schema-bad-v1")
    );

    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.errors.some((row) => row.errors?.some((error) => error.path === "$.recommendation"))).toBe(true);
  });

  it("I re-run-identical-score-report returns deterministic reports", () => {
    const fixture = readFixture<{ eval_set_version: string }>(
      "../fixtures/phase0/c10/I/re-run-identical-score-report/input.json"
    );
    const loaded = loadPack(l1Pack());
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const first = scoreL1(loaded.pack, goodScoredFns(), evalSet(fixture.eval_set_version));
    const second = scoreL1(loaded.pack, goodScoredFns(), evalSet(fixture.eval_set_version));
    expect(second).toEqual(first);
  });

  it("S eval-set-version-pinned-in-report and rubric-judge validates an independent judge receipt", () => {
    const fixture = readFixture<{ eval_set_version: string }>(
      "../fixtures/phase0/c10/S/eval-set-version-pinned-in-report/input.json"
    );
    const loaded = loadPack(l1Pack());
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(scoreL1(loaded.pack, goodScoredFns(), evalSet(fixture.eval_set_version)).eval_set_version).toBe(
      fixture.eval_set_version
    );

    const judge: RubricJudge = {
      judge_model_id: "phase0-independent-judge",
      evaluate(rubric, sample) {
        return {
          rubric_id: rubric.rubric_id,
          sample_id: sample.sample_id,
          judge_model_id: this.judge_model_id,
          total_score: 1,
          max_score: 1,
          criteria: { "evidence cited": 1 },
          rationale: "deterministic stub receipt",
          schema_version: "phase0.rubric.v1"
        };
      }
    };
    const receipt = judgeRubric(
      { rubric_id: "soft-eval-placeholder", criteria: ["evidence cited"] },
      { sample_id: "sample-1", producer_model_id: "producer-model", output: { text: "ok" } },
      judge
    );
    expect(receipt.ok).toBe(true);

    const selfJudge = judgeRubric(
      { rubric_id: "soft-eval-placeholder", criteria: ["evidence cited"] },
      { sample_id: "sample-1", producer_model_id: "same-model", output: { text: "ok" } },
      { ...judge, judge_model_id: "same-model" }
    );
    expect(selfJudge.ok).toBe(false);
  });
});

function validPack(): DomainPackRaw {
  return structuredClone(readFixture<{ pack: DomainPackRaw }>("../fixtures/phase0/c08/H/valid-pack-loads/input.json").pack);
}

function l1Pack(): DomainPackRaw {
  const pack = validPack();
  pack.scored_surfaces = {
    surfaces: {
      recommendation: { visibility: "public" },
      tier: { visibility: "public" }
    },
    eval_keys: ["eligibility.public", "tier.public"],
    bindings: [
      {
        fn_name: "p2_recommend",
        eval_key: "eligibility.public",
        surface_key: "recommendation",
        state_refs: ["loyalty_points"]
      },
      {
        fn_name: "p2_tier",
        eval_key: "tier.public",
        surface_key: "tier",
        state_refs: ["tier"]
      }
    ]
  };
  pack.broken_key_claims = [
    {
      case_id: "case-broken-claimed",
      defect_type: "ambiguous_expected",
      corpus_evidence: ["ev-gold-offer"],
      competing_expected: "gold",
      client_flag_text: "Synthetic public broken key quarantined by reviewed claim.",
      score_disposition: { action: "quarantine", visibility: "public" },
      reviewer: "phase0-builder"
    }
  ];
  return pack;
}

function evalSet(version: string): L1EvalSet {
  return {
    version,
    cases: [
      {
        case_id: "case-good",
        state: { loyalty_points: 80, tier: "gold" },
        input: { q: "ưu đãi vàng" },
        expected: { "eligibility.public": ["gold"], "tier.public": "gold" }
      },
      {
        case_id: "case-broken-claimed",
        state: { loyalty_points: 80, tier: "gold" },
        input: { q: "broken expected with claim" },
        expected: { "eligibility.public": ["silver"], "tier.public": "silver" }
      },
      {
        case_id: "case-broken-unclaimed",
        state: { loyalty_points: 80, tier: "gold" },
        input: { q: "broken expected without claim" },
        expected: { "eligibility.public": ["silver"], "tier.public": "silver" }
      }
    ]
  };
}

function goodScoredFns(): ScoredFunctionMap {
  return {
    p2_recommend: () => ({ recommendation: ["gold"] }),
    p2_tier: () => ({ tier: "gold" })
  };
}
