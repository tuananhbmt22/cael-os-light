import type { Receipt } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "./pack.js";
import { evaluateP9Suggestions } from "./suggest.js";
import type { P9RankedSuggestion, P9SuggestInput } from "./suggest.js";
import type { P9Correction } from "./normalize.js";

export interface P9TurnRequest {
  turnId: string;
  prefix: string;
  recent_queries?: string[];
  limit?: number;
}

export interface P9PublicSuggestion {
  text: string;
  predicted_intent: string;
  score: number;
  reason: string;
}

export interface P9TurnResponse {
  suggestions: P9PublicSuggestion[];
  normalized_prefix: string;
  corrections: P9Correction[];
  receipt: Receipt;
  secondBrainCalls: number;
}

export function runP9Turn(state: unknown, request: P9TurnRequest): P9TurnResponse {
  void request.turnId;
  const input: P9SuggestInput = { prefix: request.prefix };
  if (request.recent_queries !== undefined) input.recent_queries = request.recent_queries;
  if (request.limit !== undefined) input.limit = request.limit;
  const decision = evaluateP9Suggestions(state, input);
  const receipt: Receipt = {
    kind: "answer",
    decision: "score",
    firing_rule: decision.firing_rule,
    cited_ids: dedupe(decision.suggestions.map((suggestion) => suggestion.id)),
    evidence_refs: decision.suggestions.map((suggestion) => ({
      id: suggestion.id,
      source: "synthetic-p9-autocomplete-corpus",
      quote: suggestion.reason
    })),
    confidence: 1,
    escalation_used: false,
    pack_id: PACK_ID,
    image_sha: PACK_IMAGE_SHA,
    schema_version: "phase0.s3.receipt"
  };

  return {
    suggestions: decision.suggestions.map(publicSuggestion),
    normalized_prefix: decision.normalized_prefix,
    corrections: decision.corrections,
    receipt,
    secondBrainCalls: 0
  };
}

function publicSuggestion(suggestion: P9RankedSuggestion): P9PublicSuggestion {
  return {
    text: suggestion.text,
    predicted_intent: suggestion.predicted_intent,
    score: suggestion.score,
    reason: suggestion.reason
  };
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}
