import { buildRuleSet } from "@cael/os-light";
import type { RankedCandidate } from "@cael/os-light";
import {
  ACTIVE_STATUS,
  FALLBACK_LABEL,
  canonicalRecommendationOrder,
  p2EligibilityRuleSet,
  recommendationRank,
  rulePriorityByRecommendation
} from "./eligibility-rule-set.js";

export interface P2UserState {
  user_id?: string;
  wallet_status?: string;
  monthly_toll_transactions?: number | string;
}

export interface P2VehicleState {
  vehicle_id?: string;
  user_id?: string;
  vehicle_age_years?: number | string;
  insurance_days_left?: number | string;
  inspection_days_left?: number | string;
  registration_days_left?: number | string;
  roadside_status?: string;
  civil_liability_status?: string;
  frequent_route?: string;
}

export interface P2State {
  user?: P2UserState;
  vehicles?: P2VehicleState[];
}

export interface P2Input {
  user_id?: string;
  question?: string;
}

export interface P2RankedCandidate extends RankedCandidate {
  vehicle_id: string | null;
}

export interface P2RecommendationDecision {
  recommendation: string[];
  ranked_candidates: P2RankedCandidate[];
  fallback_used: boolean;
  firing_rule: string;
}

const eligibilityEngine = buildRuleSet({ ...p2EligibilityRuleSet, cap: p2EligibilityRuleSet.rules.length });

export function p2_recommend(state: unknown, input: unknown): { recommendation: string[] } {
  return { recommendation: evaluateP2Recommendations(state, input).recommendation };
}

export function evaluateP2Recommendations(state: unknown, input: unknown): P2RecommendationDecision {
  void input;
  const { user, vehicles } = selectState(state);
  const subjects = vehicles.length > 0 ? vehicles : [{}];
  const byRecommendation = new Map<string, P2RankedCandidate>();

  for (const vehicle of subjects) {
    const decision = eligibilityEngine.decide({
      subject: subjectFor(user, vehicle),
      object: {}
    });
    if (decision.fallback_used) continue;
    for (const candidate of decision.ranked ?? []) {
      const next: P2RankedCandidate = {
        id: candidate.id,
        score: candidate.score,
        firing_rule: candidate.firing_rule,
        vehicle_id: stringValue(vehicle, ["vehicle_id"]) || null
      };
      const current = byRecommendation.get(next.id);
      if (!current || compareCandidate(next, current) < 0) {
        byRecommendation.set(next.id, next);
      }
    }
  }

  const ranked = [...byRecommendation.values()].sort(compareCandidate).slice(0, p2EligibilityRuleSet.cap ?? 3);
  if (ranked.length === 0) {
    const fallback: P2RankedCandidate = {
      id: FALLBACK_LABEL,
      score: rulePriorityByRecommendation[FALLBACK_LABEL] ?? 10,
      firing_rule: p2EligibilityRuleSet.fallback.rule_id,
      vehicle_id: null
    };
    return {
      recommendation: [fallback.id],
      ranked_candidates: [fallback],
      fallback_used: true,
      firing_rule: fallback.firing_rule
    };
  }

  return {
    recommendation: canonicalRecommendationOrder(ranked.map((candidate) => candidate.id)).slice(0, p2EligibilityRuleSet.cap ?? 3),
    ranked_candidates: ranked,
    fallback_used: false,
    firing_rule: ranked[0]?.firing_rule ?? p2EligibilityRuleSet.fallback.rule_id
  };
}

function selectState(state: unknown): { user: Record<string, unknown>; vehicles: Record<string, unknown>[] } {
  const root = isRecord(state) ? state : {};
  const user = isRecord(root.user) ? root.user : root;
  const vehicles = Array.isArray(root.vehicles)
    ? root.vehicles.filter(isRecord)
    : Array.isArray(user.vehicles)
      ? user.vehicles.filter(isRecord)
      : [];
  return { user, vehicles };
}

function subjectFor(user: Record<string, unknown>, vehicle: Record<string, unknown>): Record<string, unknown> {
  return {
    vehicle_age_years: numberValue(vehicle, ["vehicle_age_years"]),
    insurance_days_left: numberValue(vehicle, ["insurance_days_left"]),
    inspection_days_left: numberValue(vehicle, ["inspection_days_left"]),
    registration_days_left: numberValue(vehicle, ["registration_days_left"]),
    roadside_status: stringValue(vehicle, ["roadside_status"]) || ACTIVE_STATUS,
    civil_liability_status: stringValue(vehicle, ["civil_liability_status"]) || ACTIVE_STATUS,
    wallet_status: stringValue(user, ["wallet_status"]) || ACTIVE_STATUS,
    monthly_toll_transactions: numberValue(user, ["monthly_toll_transactions"]),
    frequent_route_present: stringValue(vehicle, ["frequent_route"]).trim().length > 0
  };
}

function compareCandidate(left: P2RankedCandidate, right: P2RankedCandidate): number {
  const score = right.score - left.score;
  if (score !== 0) return score;
  const rank = (recommendationRank[left.id] ?? 500) - (recommendationRank[right.id] ?? 500);
  if (rank !== 0) return rank;
  return left.firing_rule.localeCompare(right.firing_rule);
}

function numberValue(source: Record<string, unknown>, names: string[]): number {
  for (const name of names) {
    const value = source[name];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return Number.NaN;
}

function stringValue(source: Record<string, unknown>, names: string[]): string {
  for (const name of names) {
    const value = source[name];
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }
  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
