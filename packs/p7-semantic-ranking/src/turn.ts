import type { Receipt } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "./pack.js";
import { evaluateP7Ranking, type P7PlaceResultDto, type P7RankedResult, type P7TurnLocation } from "./rank.js";

export interface P7TurnRequest {
  turnId: string;
  sessionId?: string;
  query: string;
  userLocation?: P7TurnLocation;
  limit?: number;
}

export interface P7PublicRankedResult {
  poi_id: string;
  poi_name: string;
  score: number;
  matched_attributes: readonly string[];
  ranking_signals: readonly string[];
  reasons: readonly string[];
  place: P7PlaceResultDto;
}

export interface P7TurnResponse {
  normalized_query: string;
  intent: string;
  ranked_results: P7PublicRankedResult[];
  receipt: Receipt;
  modelCalls: number;
}

export function runP7Turn(state: unknown, request: P7TurnRequest): P7TurnResponse {
  void request.turnId;
  const decision = evaluateP7Ranking(state, request);
  const receipt: Receipt = {
    kind: "answer",
    decision: "score",
    firing_rule: decision.firing_rule,
    cited_ids: dedupe(decision.ranked_results.map((result) => result.poi_id)),
    evidence_refs: decision.ranked_results.map((result) => ({
      id: result.poi_id,
      source: "synthetic-p7-workbook:POI_Dataset",
      quote: result.reasons.join("; ")
    })),
    confidence: decision.fallback_used ? 0.35 : 0.92,
    escalation_used: false,
    pack_id: PACK_ID,
    image_sha: PACK_IMAGE_SHA,
    schema_version: "phase0.s3.receipt"
  };

  return {
    normalized_query: decision.normalized_query,
    intent: decision.intent,
    ranked_results: decision.ranked_results.map(publicResult),
    receipt,
    modelCalls: 0
  };
}

function publicResult(result: P7RankedResult): P7PublicRankedResult {
  return {
    poi_id: result.poi_id,
    poi_name: result.poi_name,
    score: result.score,
    matched_attributes: result.matched_attributes,
    ranking_signals: result.ranking_signals,
    reasons: result.reasons,
    place: result.place
  };
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
