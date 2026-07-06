import { describe, expect, it } from "vitest";
import { buildRuleSet, GateRuleSetValidationError } from "../src/index.js";
import type { GateDecision, GateInput } from "../src/index.js";
import { readFixture } from "./helpers.js";

interface GateCase {
  id: string;
  input: GateInput;
}

interface ExpectedCase {
  id: string;
  decision: GateDecision["decision"];
  firing_rule?: string;
  ranked_ids?: string[];
  absent_ranked_ids?: string[];
  evidence?: { key: string; state: string; value?: string | number | boolean }[];
  fallback_used?: boolean;
}

interface GateFixture {
  ruleSet: unknown;
  cases: GateCase[];
  declared_allow_minimum?: number;
  quarantined_rows?: string[];
}

interface ExpectedFixture {
  cases: ExpectedCase[];
  false_refusal_cap?: number;
  valid_result_coverage_minimum?: number;
}

describe("c02 gate batteries", () => {
  it("A H a-allow-rows allows declared rows, canonicalizes names, and catches deny-everything gates", () => {
    const input = readFixture<GateFixture>("../fixtures/phase0/c02/H/a-allow-rows/input.json");
    const expected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/H/a-allow-rows/expected.json");
    const decisions = runCases(input.ruleSet, input.cases);

    assertExpected(decisions, expected.cases);
    expect(countDecisions(decisions, "allow")).toBeGreaterThanOrEqual(input.declared_allow_minimum ?? 0);

    const badRuleSet = {
      ...(input.ruleSet as Record<string, unknown>),
      access: ((input.ruleSet as { access: Record<string, unknown>[] }).access ?? []).map((row) => ({
        ...row,
        allow: false
      }))
    };
    expect(() => assertAllowMinimum(badRuleSet, input.cases, input.declared_allow_minimum ?? 0)).toThrow(
      "allow minimum"
    );
  });

  it("A R/M deny rows enforce deny-if-any, densest denial, and unknown role/dept without crashing", () => {
    const denyInput = readFixture<GateFixture>("../fixtures/phase0/c02/R/a-deny-rows/input.json");
    const denyExpected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/R/a-deny-rows/expected.json");
    assertExpected(runCases(denyInput.ruleSet, denyInput.cases), denyExpected.cases);

    const unknownInput = readFixture<GateFixture>("../fixtures/phase0/c02/M/a-unknown-role-dept/input.json");
    const unknownExpected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/M/a-unknown-role-dept/expected.json");
    assertExpected(runCases(unknownInput.ruleSet, unknownInput.cases), unknownExpected.cases);
  });

  it("B H/R/M ranks, caps at 3, never empties fallback, ignores question text, and cites every rule", () => {
    const input = readFixture<GateFixture>("../fixtures/phase0/c02/H/b-rec-rows/input.json");
    const expected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/H/b-rec-rows/expected.json");
    const decisions = runCases(input.ruleSet, input.cases);
    assertExpected(decisions, expected.cases);
    expect(decisions.get("rank-cap-three")?.ranked).toHaveLength(3);
    expect([...decisions.values()].every((decision) => (decision.ranked ?? []).every((candidate) => candidate.firing_rule))).toBe(true);

    const questionVariants = ["What should I buy?", "Can I renew?", "Tư vấn hôm nay?"];
    const state = input.cases[0]?.input.subject;
    const ruleSet = buildRuleSet(input.ruleSet);
    const rankedByQuestion = questionVariants.map((question) => {
      const decision = ruleSet.decide({ subject: state, object: {}, ctx: { question } });
      return JSON.stringify({ ranked: decision.ranked, firing_rule: decision.firing_rule });
    });
    expect(new Set(rankedByQuestion).size).toBe(1);

    const redInput = readFixture<GateFixture>("../fixtures/phase0/c02/R/b-inelig-rows/input.json");
    const redExpected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/R/b-inelig-rows/expected.json");
    assertExpected(runCases(redInput.ruleSet, redInput.cases), redExpected.cases);

    const malformed = readFixture<{ malformedRuleSet: unknown; input: GateInput; expected: ExpectedCase }>(
      "../fixtures/phase0/c02/M/b-malformed-state/input.json"
    );
    expect(() => buildRuleSet(malformed.malformedRuleSet)).toThrow(GateRuleSetValidationError);
    const malformedDecision = buildRuleSet(input.ruleSet).decide(malformed.input);
    assertExpected(new Map([[malformed.expected.id, malformedDecision]]), [malformed.expected]);
  });

  it("C H/R/M proves open-world tri-state, field-first precision, sole discriminator, negation, and honest fallback", () => {
    const cleanInput = readFixture<GateFixture>("../fixtures/phase0/c02/H/c-clean-rows/input.json");
    const cleanExpected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/H/c-clean-rows/expected.json");
    expect(cleanInput.quarantined_rows).toEqual([]);
    const cleanDecisions = runCases(cleanInput.ruleSet, cleanInput.cases);
    assertExpected(cleanDecisions, cleanExpected.cases);
    assertCleanPartition(cleanInput.ruleSet, cleanInput.cases, cleanExpected);

    const refuseInput = readFixture<GateFixture>("../fixtures/phase0/c02/R/c-refuse-rows/input.json");
    const refuseExpected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/R/c-refuse-rows/expected.json");
    expect(refuseInput.quarantined_rows).toEqual([]);
    assertExpected(runCases(refuseInput.ruleSet, refuseInput.cases), refuseExpected.cases);

    const unknownInput = readFixture<GateFixture>("../fixtures/phase0/c02/M/c-unknown-token/input.json");
    const unknownExpected = readFixture<ExpectedFixture>("../fixtures/phase0/c02/M/c-unknown-token/expected.json");
    assertExpected(runCases(unknownInput.ruleSet, unknownInput.cases), unknownExpected.cases);

    const breachInput = readFixture<GateFixture>(
      "../fixtures/phase0/c02/R/c-over-refusal-cap-breach-fails/input.json"
    );
    const breachExpected = readFixture<ExpectedFixture>(
      "../fixtures/phase0/c02/R/c-over-refusal-cap-breach-fails/expected.json"
    );
    expect(() => assertCleanPartition(breachInput.ruleSet, breachInput.cases, breachExpected)).toThrow(
      "false refusal cap"
    );
  });

  it("I same-input-identical-decision-replay returns deep-identical decisions for all archetypes", () => {
    const input = readFixture<{ cases: { id: string; ruleSet: unknown; input: GateInput }[] }>(
      "../fixtures/phase0/c02/I/same-input-identical-decision-replay/input.json"
    );
    const expected = readFixture<{ replay_equal: boolean }>(
      "../fixtures/phase0/c02/I/same-input-identical-decision-replay/expected.json"
    );
    for (const replayCase of input.cases) {
      const ruleSet = buildRuleSet(replayCase.ruleSet);
      const first = ruleSet.decide(replayCase.input);
      const second = ruleSet.decide(replayCase.input);
      expect(first).toEqual(second);
      expect(first.firing_rule).not.toBe("");
    }
    expect(expected.replay_equal).toBe(true);
  });

  it("S ruleset-hot-swap-takes-effect-only-after-reload keeps interpreters immutable", () => {
    const input = readFixture<{
      originalRuleSet: unknown;
      swappedRuleSet: unknown;
      input: GateInput;
    }>("../fixtures/phase0/c02/S/ruleset-hot-swap-takes-effect-only-after-reload/input.json");
    const expected = readFixture<{ before: string; old_after_swap: string; rebuilt_after_swap: string }>(
      "../fixtures/phase0/c02/S/ruleset-hot-swap-takes-effect-only-after-reload/expected.json"
    );
    const oldInterpreter = buildRuleSet(input.originalRuleSet);
    const before = oldInterpreter.decide(input.input);
    const oldAfterSwap = oldInterpreter.decide(input.input);
    const rebuilt = buildRuleSet(input.swappedRuleSet).decide(input.input);

    expect(before.decision).toBe(expected.before);
    expect(oldAfterSwap.decision).toBe(expected.old_after_swap);
    expect(rebuilt.decision).toBe(expected.rebuilt_after_swap);
  });
});

function runCases(ruleSetData: unknown, cases: GateCase[]): Map<string, GateDecision> {
  const ruleSet = buildRuleSet(ruleSetData);
  return new Map(cases.map((testCase) => [testCase.id, ruleSet.decide(testCase.input)]));
}

function assertExpected(decisions: Map<string, GateDecision>, expectedCases: ExpectedCase[]): void {
  for (const expected of expectedCases) {
    const decision = decisions.get(expected.id);
    expect(decision, expected.id).toBeDefined();
    if (!decision) continue;
    expect(decision.decision, expected.id).toBe(expected.decision);
    expect(decision.firing_rule, expected.id).not.toBe("");
    if (expected.firing_rule) expect(decision.firing_rule, expected.id).toBe(expected.firing_rule);
    if (expected.ranked_ids) expect((decision.ranked ?? []).map((candidate) => candidate.id)).toEqual(expected.ranked_ids);
    if (expected.absent_ranked_ids) {
      expect((decision.ranked ?? []).map((candidate) => candidate.id)).not.toEqual(
        expect.arrayContaining(expected.absent_ranked_ids)
      );
    }
    if (expected.fallback_used !== undefined) expect(decision.fallback_used).toBe(expected.fallback_used);
    for (const evidence of expected.evidence ?? []) {
      expect(decision.evidence).toEqual(expect.arrayContaining([expect.objectContaining(evidence)]));
    }
  }
}

function countDecisions(decisions: Map<string, GateDecision>, decision: GateDecision["decision"]): number {
  return [...decisions.values()].filter((row) => row.decision === decision).length;
}

function assertAllowMinimum(ruleSet: unknown, cases: GateCase[], minimum: number): void {
  const decisions = runCases(ruleSet, cases);
  const allows = countDecisions(decisions, "allow");
  if (allows < minimum) throw new Error(`allow minimum failed: ${allows} < ${minimum}`);
}

function assertCleanPartition(ruleSet: unknown, cases: GateCase[], expected: ExpectedFixture): void {
  const decisions = runCases(ruleSet, cases);
  const falseRefusals = [...decisions.values()].filter((decision) => decision.decision === "refuse").length;
  const validResults = [...decisions.values()].filter((decision) => (decision.ranked ?? []).length > 0).length;
  const coverage = validResults / cases.length;
  if (falseRefusals > (expected.false_refusal_cap ?? 0)) {
    throw new Error(`false refusal cap failed: ${falseRefusals} > ${expected.false_refusal_cap ?? 0}`);
  }
  if (coverage < (expected.valid_result_coverage_minimum ?? 1)) {
    throw new Error(`valid result coverage failed: ${coverage} < ${expected.valid_result_coverage_minimum ?? 1}`);
  }
}
