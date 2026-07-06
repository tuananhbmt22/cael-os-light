import type { Decision, EvidenceState } from "../types/index.js";
import type {
  EligibilityRuleSetData,
  OpenWorldRuleSetData,
  RbacRuleSetData
} from "./rule-set-schema.js";
import { validateEligibilityRuleSetData, validateOpenWorldRuleSetData, validateRbacRuleSetData } from "./rule-set-schema.js";
import { createEligibilityRuleSet } from "./archetype-b-eligibility.js";
import { createOpenWorldRuleSet } from "./archetype-c-openworld.js";
import { createRbacRuleSet } from "./archetype-a-rbac.js";

export type GateArchetype = "A" | "B" | "C";
export type GatePrimitive = string | number | boolean;

export interface GateInput {
  subject: unknown;
  object: unknown;
  ctx?: Record<string, unknown>;
}

export interface DecisionEvidence {
  key: string;
  state: EvidenceState;
  value?: GatePrimitive;
}

export interface RankedCandidate {
  id: string;
  score: number;
  firing_rule: string;
}

export interface GateDecision {
  decision: Decision;
  firing_rule: string;
  evidence: DecisionEvidence[];
  ranked?: RankedCandidate[];
  fallback_used?: boolean;
}

export interface GateRuleSet {
  archetype: GateArchetype;
  decide(input: GateInput): GateDecision;
}

export class GateRuleSetValidationError extends Error {
  readonly validationName: string;
  readonly details: string[];

  constructor(validationName: string, details: string[]) {
    super(`${validationName}: ${details.join("; ")}`);
    this.name = "GateRuleSetValidationError";
    this.validationName = validationName;
    this.details = details;
  }
}

export function refuseDecision(firingRule: string, evidence: DecisionEvidence[] = []): GateDecision {
  return {
    decision: "refuse",
    firing_rule: firingRule,
    evidence
  };
}

export function buildRuleSet(data: unknown): GateRuleSet {
  const archetype = readArchetype(data);
  if (archetype === "A") {
    return createRbacRuleSet(requireValid("rbac_ruleset_validation_error", validateRbacRuleSetData(data)));
  }
  if (archetype === "B") {
    return createEligibilityRuleSet(
      requireValid("eligibility_ruleset_validation_error", validateEligibilityRuleSetData(data))
    );
  }
  if (archetype === "C") {
    return createOpenWorldRuleSet(requireValid("open_world_ruleset_validation_error", validateOpenWorldRuleSetData(data)));
  }
  throw new GateRuleSetValidationError("archetype_validation_error", ["$.archetype expected A, B, or C"]);
}

function readArchetype(data: unknown): GateArchetype | null {
  if (data === null || typeof data !== "object" || Array.isArray(data)) return null;
  const archetype = (data as Record<string, unknown>).archetype;
  return archetype === "A" || archetype === "B" || archetype === "C" ? archetype : null;
}

function requireValid<T extends RbacRuleSetData | EligibilityRuleSetData | OpenWorldRuleSetData>(
  validationName: string,
  result: { ok: true; value: T } | { ok: false; errors: { path: string; message: string }[] }
): T {
  if (result.ok) return result.value;
  throw new GateRuleSetValidationError(
    validationName,
    result.errors.map((error) => `${error.path} ${error.message}`)
  );
}
