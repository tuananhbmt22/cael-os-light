import type { EvidenceState } from "../types/index.js";
import type { DecisionEvidence, GateDecision, GateInput, GateRuleSet, RankedCandidate } from "./gate-engine.js";
import type { EligibilityCondition, EligibilityRuleData, EligibilityRuleSetData } from "./rule-set-schema.js";

type SubjectState = Record<string, unknown>;

export function createEligibilityRuleSet(data: EligibilityRuleSetData): GateRuleSet {
  const cap = data.cap ?? 3;
  const rules = [...data.rules];

  return {
    archetype: "B",
    decide(input: GateInput): GateDecision {
      if (input.subject === null || typeof input.subject !== "object" || Array.isArray(input.subject)) {
        return {
          decision: "refuse",
          firing_rule: "eligibility_input_state_malformed",
          evidence: []
        };
      }

      const state = input.subject as SubjectState;
      const matches = rules
        .filter((rule) => rule.conditions.every((condition) => evaluateCondition(condition, state, data.thresholds)))
        .sort((left, right) => right.priority - left.priority || left.rule_id.localeCompare(right.rule_id))
        .slice(0, cap);

      const ranked: RankedCandidate[] =
        matches.length > 0
          ? matches.map((rule) => toCandidate(rule))
          : [
              {
                id: data.fallback.recommendation,
                score: data.fallback.priority,
                firing_rule: data.fallback.rule_id
              }
            ];

      return {
        decision: "score",
        firing_rule: ranked[0]?.firing_rule ?? data.fallback.rule_id,
        ranked,
        evidence: evidenceForRules(matches.length > 0 ? matches : [], state),
        fallback_used: matches.length === 0
      };
    }
  };
}

function toCandidate(rule: EligibilityRuleData): RankedCandidate {
  return {
    id: rule.recommendation,
    score: rule.priority,
    firing_rule: rule.rule_id
  };
}

function evaluateCondition(
  condition: EligibilityCondition,
  state: SubjectState,
  thresholds: Record<string, number>
): boolean {
  const actual = state[condition.field];
  const expected = condition.threshold_id ? thresholds[condition.threshold_id] : condition.value;
  switch (condition.op) {
    case "lt":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "lte":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "gt":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "gte":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "in":
      return Array.isArray(expected) && typeof actual === "string" && expected.includes(actual);
    case "contains":
      return Array.isArray(actual) && typeof expected === "string" && actual.includes(expected);
    case "truthy":
      return actual === true;
    case "falsy":
      return actual === false;
  }
}

function evidenceForRules(rules: EligibilityRuleData[], state: SubjectState): DecisionEvidence[] {
  const fields = new Set<string>();
  for (const rule of rules) {
    for (const condition of rule.conditions) fields.add(condition.field);
  }
  return [...fields].sort().map((field) => {
    const value = state[field];
    return {
      key: field,
      state: "present" as EvidenceState,
      value: typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : String(value)
    };
  });
}
