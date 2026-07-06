import { createNotifyEngine } from "@cael/os-light";
import type { NotificationEmission, Receipt } from "@cael/os-light";
import {
  ACTIVE_STATUS,
  INSURANCE_STATUS_NEEDS_ACTION,
  eligibilityThresholdIds,
  p2EligibilityRuleSet
} from "./eligibility-rule-set.js";
import { PACK_ID, PACK_IMAGE_SHA, p2EligibilityPack } from "./pack.js";
import { evaluateP2Recommendations } from "./p2-recommend.js";
import type { P2Input, P2RankedCandidate, P2State, P2VehicleState } from "./p2-recommend.js";

export interface P2TurnRequest {
  userId?: string;
  sessionId?: string;
  turnId: string;
  user_id: string;
  question: string;
}

export interface P2TurnResponse {
  recommendation: string[];
  ranked_candidates: P2RankedCandidate[];
  fallback_used: boolean;
  receipt: Receipt;
  notifications: NotificationEmission[];
  secondBrainCalls: number;
}

export function runP2Turn(state: P2State, request: P2TurnRequest): P2TurnResponse {
  const input: P2Input = { user_id: request.user_id, question: request.question };
  const decision = evaluateP2Recommendations(state, input);
  const receipt: Receipt = {
    kind: "answer",
    decision: "score",
    firing_rule: decision.firing_rule,
    cited_ids: decision.recommendation,
    evidence_refs: decision.ranked_candidates.map((candidate) => ({
      id: candidate.id,
      source: "p2-eligibility-rule-set",
      quote: candidate.firing_rule
    })),
    confidence: 1,
    escalation_used: false,
    pack_id: PACK_ID,
    image_sha: PACK_IMAGE_SHA,
    schema_version: "phase0.s3.receipt"
  };
  return {
    recommendation: decision.recommendation,
    ranked_candidates: decision.ranked_candidates,
    fallback_used: decision.fallback_used,
    receipt,
    notifications: fireP2Notifications(state, input, request.turnId),
    secondBrainCalls: 0
  };
}

export function fireP2Notifications(state: P2State, input: P2Input, turnId = "p2-turn"): NotificationEmission[] {
  const user = state.user ?? {};
  const vehicles = state.vehicles ?? [];
  const userId = input.user_id ?? user.user_id ?? "synthetic-user";
  const engine = createNotifyEngine(p2EligibilityPack, { scopeUserId: String(userId) });
  const out: NotificationEmission[] = [];

  if (stringValue(user.wallet_status) !== ACTIVE_STATUS) {
    out.push(
      ...engine.fire("wallet_activation", {
        user_id: userId,
        turnId,
        dedupeKey: `${userId}:wallet_activation`
      })
    );
  }

  for (const vehicle of vehicles) {
    const vehicleId = vehicle.vehicle_id ?? "synthetic-vehicle";
    if (firesRoadside(vehicle)) {
      out.push(
        ...engine.fire("roadside_recommendation", {
          user_id: userId,
          vehicle_id: vehicleId,
          turnId,
          dedupeKey: `${userId}:${vehicleId}:roadside_recommendation`
        })
      );
    }
    if (firesInsurance(vehicle)) {
      out.push(
        ...engine.fire("insurance_expiring", {
          user_id: userId,
          vehicle_id: vehicleId,
          turnId,
          dedupeKey: `${userId}:${vehicleId}:insurance_expiring`
        })
      );
    }
    if (firesDocWallet(vehicle)) {
      out.push(
        ...engine.fire("inspection_due", {
          user_id: userId,
          vehicle_id: vehicleId,
          turnId,
          dedupeKey: `${userId}:${vehicleId}:inspection_due`
        })
      );
    }
  }

  const recommendation = evaluateP2Recommendations(state, input);
  if (recommendation.fallback_used) {
    out.push(
      ...engine.fire("service_discovery", {
        user_id: userId,
        turnId,
        dedupeKey: `${userId}:service_discovery`
      }),
      ...engine.fire("loyalty_offer", {
        user_id: userId,
        turnId,
        dedupeKey: `${userId}:loyalty_offer`
      })
    );
  }

  return out;
}

function firesRoadside(vehicle: P2VehicleState): boolean {
  return (
    numberValue(vehicle.vehicle_age_years) >= threshold(eligibilityThresholdIds.vehicleAgeYearsAtLeast) &&
    stringValue(vehicle.roadside_status) !== ACTIVE_STATUS
  );
}

function firesInsurance(vehicle: P2VehicleState): boolean {
  return (
    INSURANCE_STATUS_NEEDS_ACTION.includes(stringValue(vehicle.civil_liability_status) as (typeof INSURANCE_STATUS_NEEDS_ACTION)[number]) ||
    numberValue(vehicle.insurance_days_left) < threshold(eligibilityThresholdIds.insuranceDaysLeftBelow)
  );
}

function firesDocWallet(vehicle: P2VehicleState): boolean {
  return (
    numberValue(vehicle.inspection_days_left) < threshold(eligibilityThresholdIds.inspectionDaysLeftBelow) ||
    numberValue(vehicle.registration_days_left) <= threshold(eligibilityThresholdIds.registrationDaysLeftAtMost)
  );
}

function threshold(id: string): number {
  return p2EligibilityRuleSet.thresholds[id] ?? Number.NaN;
}

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.NaN;
}

function stringValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

