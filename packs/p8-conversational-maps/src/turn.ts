import { receiptSchema, validate } from "@cael/os-light";
import type { Receipt } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "./pack.js";
import { composeP8Turn, type P8Clarification, type P8ComposeRequest, type P8MapAction, type P8Recommendation, type P8TurnLocation } from "./compose.js";

export interface P8TurnRequest {
  turnId: string;
  sessionId: string;
  userId?: string;
  message: string;
  conversation_history?: readonly { readonly role: "user" | "assistant"; readonly content: string }[];
  userLocation?: P8TurnLocation;
}

export interface P8ContextState {
  retained_slots: Record<string, string>;
  user_profile_id?: string;
}

export interface P8TurnResponse {
  intent: string;
  assistant_response: string;
  recommendations: P8Recommendation[];
  map_action: P8MapAction;
  clarification?: P8Clarification;
  context_state: P8ContextState;
  receipt: Receipt;
  modelCalls: number;
}

export function p8_turn(state: unknown, input: P8TurnRequest): P8TurnResponse {
  return runP8Turn(state, input);
}

export function runP8Turn(state: unknown, request: P8TurnRequest): P8TurnResponse {
  const prior = unwrapPriorContext(state);
  const decision = composeP8Turn(prior, request as P8ComposeRequest);
  const cited_ids = dedupe(decision.recommendations.map((recommendation) => recommendation.poi_id).filter((id): id is string => Boolean(id)));
  const receipt: Receipt = {
    kind: "answer",
    decision: "score",
    firing_rule: decision.firing_rule,
    cited_ids,
    evidence_refs: decision.recommendations.map((recommendation) => ({
      id: recommendation.poi_id ?? recommendation.poi_name,
      source: "synthetic-p8-workbook:POI_Dataset",
      quote: recommendation.reason
    })),
    confidence: decision.confidence,
    escalation_used: false,
    pack_id: PACK_ID,
    image_sha: PACK_IMAGE_SHA,
    schema_version: "phase0.s3.receipt"
  };
  const validatedReceipt = validate(receiptSchema, receipt);
  if (!validatedReceipt.ok) {
    throw new Error(`P8 receipt validation failed: ${validatedReceipt.errors.map((error) => error.message).join("; ")}`);
  }

  return {
    intent: decision.intent,
    assistant_response: decision.assistant_response,
    recommendations: [...decision.recommendations],
    map_action: decision.map_action,
    clarification: decision.clarification,
    context_state: {
      retained_slots: decision.context.retained_slots,
      ...(decision.context.user_profile_id ? { user_profile_id: decision.context.user_profile_id } : {})
    },
    receipt: validatedReceipt.value,
    modelCalls: 0
  };
}

function unwrapPriorContext(state: unknown): unknown {
  if (state && typeof state === "object" && "context_state" in state) {
    return (state as { context_state?: unknown }).context_state;
  }
  return state;
}

function dedupe(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}
