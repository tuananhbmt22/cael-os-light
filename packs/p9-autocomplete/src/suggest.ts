import {
  abbreviationEntries,
  categorySuggestions,
  p9Pois,
  popularQueries
} from "./autocomplete-corpus.js";
import type { P9AbbreviationEntry, P9CategorySuggestion, P9Poi, P9PopularQuery } from "./autocomplete-corpus.js";
import { foldForMatch, normalizePrefix } from "./normalize.js";
import type { P9Correction } from "./normalize.js";

export interface P9SuggestInput {
  prefix: string;
  recent_queries?: string[];
  limit?: number;
}

export interface P9AutocompleteState {
  pois?: P9Poi[];
}

export type P9SuggestionType = "poi" | "popular_query" | "abbreviation_expansion" | "category";

export interface P9RankedSuggestion {
  text: string;
  predicted_intent: string;
  score: number;
  reason: string;
  id: string;
  suggestion_type: P9SuggestionType;
}

export interface P9SuggestionDecision {
  suggestions: P9RankedSuggestion[];
  normalized_prefix: string;
  corrections: P9Correction[];
  firing_rule: string;
  fallback_used: boolean;
}

interface Candidate extends P9RankedSuggestion {
  popularity: number;
  query_frequency: number;
  foldedText: string;
}

interface MatchResult {
  strength: number;
  basis: string;
}

interface CorpusStats {
  maxPopularity: number;
  maxFrequency: number;
}

export const RANKING_WEIGHTS = {
  match: 100,
  popularity: 10,
  frequency: 5,
  recent: 3
} as const;

export function p9_suggest(state: unknown, input: unknown): { suggestions: string[] } {
  return {
    suggestions: evaluateP9Suggestions(state, input).suggestions.map((suggestion) => suggestion.text)
  };
}

export function evaluateP9Suggestions(state: unknown, input: unknown): P9SuggestionDecision {
  return evaluateP9SuggestionsWithCorpus(selectPois(state), input);
}

export function evaluateP9SuggestionsWithCorpus(pois: P9Poi[], input: unknown): P9SuggestionDecision {
  const request = selectInput(input);
  const normalized = normalizePrefix(request.prefix);
  const limit = normalizeLimit(request.limit);
  const stats = statsFor(pois);
  const recent = new Set((request.recent_queries ?? []).map(foldForMatch));
  const candidates = rankCandidates([
    ...poiCandidates(pois, normalized.folded, stats, recent),
    ...popularQueryCandidates(normalized.folded, stats, recent),
    ...categoryCandidates(normalized.folded, stats, recent),
    ...abbreviationCandidates(normalized.raw, normalized.folded, stats, recent)
  ]).slice(0, limit);

  if (candidates.length === 0) {
    return {
      suggestions: [fallbackCandidate(stats)],
      normalized_prefix: normalized.normalized,
      corrections: normalized.corrections,
      firing_rule: "P9_PREFIX_FALLBACK",
      fallback_used: true
    };
  }

  return {
    suggestions: candidates,
    normalized_prefix: normalized.normalized,
    corrections: normalized.corrections,
    firing_rule: "P9_PREFIX_RANK",
    fallback_used: false
  };
}

function poiCandidates(pois: P9Poi[], foldedPrefix: string, stats: CorpusStats, recent: Set<string>): Candidate[] {
  if (foldedPrefix.length === 0) return [];
  const candidates: Candidate[] = [];
  for (const poi of pois) {
    const match = matchPoi(poi, foldedPrefix);
    if (!match) continue;
    const isBrandFamily = foldForMatch(poi.name).startsWith("vin");
    candidates.push(
      candidateFrom({
        id: poi.id,
        text: poi.name,
        suggestion_type: "poi",
        predicted_intent: isBrandFamily ? "brand_search" : "navigate_to_poi",
        matchStrength: match.strength,
        popularity: poi.popularity,
        query_frequency: poi.query_frequency,
        stats,
        recent,
        reason: `${match.basis}; synthetic popularity ${poi.popularity}; synthetic query_frequency ${poi.query_frequency}`
      })
    );
  }
  return candidates;
}

function popularQueryCandidates(foldedPrefix: string, stats: CorpusStats, recent: Set<string>): Candidate[] {
  if (foldedPrefix.length === 0) return [];
  return popularQueries
    .map((query) => {
      const match = matchText(query.text, foldedPrefix, 3, 2);
      if (!match) return null;
      return candidateFrom({
        id: query.id,
        text: query.text,
        suggestion_type: "popular_query",
        predicted_intent: "popular_query",
        matchStrength: match.strength,
        popularity: 0,
        query_frequency: query.query_frequency,
        stats,
        recent,
        reason: `${match.basis}; synthetic popular-query frequency ${query.query_frequency}`
      });
    })
    .filter(isCandidate);
}

function categoryCandidates(foldedPrefix: string, stats: CorpusStats, recent: Set<string>): Candidate[] {
  if (foldedPrefix.length === 0) return [];
  return categorySuggestions
    .map((category) => {
      const match = matchText(category.text, foldedPrefix, 2, 2);
      if (!match) return null;
      return categoryCandidate(category, match, stats, recent);
    })
    .filter(isCandidate);
}

function abbreviationCandidates(rawPrefix: string, foldedPrefix: string, stats: CorpusStats, recent: Set<string>): Candidate[] {
  const foldedRaw = foldForMatch(rawPrefix);
  if (foldedRaw.length === 0 && foldedPrefix.length === 0) return [];
  return abbreviationEntries
    .map((entry) => {
      const foldedAbbr = foldForMatch(entry.abbr);
      const foldedExpansion = foldForMatch(entry.expansion);
      const rawMatchesAbbr = foldedRaw === foldedAbbr || startsAtWordBoundary(foldedRaw, foldedAbbr);
      const normalizedMatchesExpansion = foldedPrefix === foldedExpansion;
      if (!rawMatchesAbbr && !normalizedMatchesExpansion) return null;
      return abbreviationCandidate(entry, stats, recent);
    })
    .filter(isCandidate);
}

function matchPoi(poi: P9Poi, foldedPrefix: string): MatchResult | null {
  const primary = matchText(poi.name, foldedPrefix, 3, 2);
  if (primary) return primary;
  for (const alias of poi.aliases ?? []) {
    const aliasMatch = matchText(alias, foldedPrefix, 1, 1);
    if (aliasMatch) return aliasMatch;
  }
  return null;
}

function matchText(text: string, foldedPrefix: string, startStrength: number, laterStrength: number): MatchResult | null {
  const folded = foldForMatch(text);
  if (folded.startsWith(foldedPrefix)) {
    return { strength: startStrength, basis: "prefix matches start" };
  }
  if (startsAtWordBoundary(folded, foldedPrefix)) {
    return { strength: laterStrength, basis: "prefix matches later token" };
  }
  return null;
}

function startsAtWordBoundary(foldedText: string, foldedPrefix: string): boolean {
  if (foldedPrefix.length === 0) return false;
  return foldedText.split(/\s+/).some((token) => token.startsWith(foldedPrefix)) || foldedText.includes(` ${foldedPrefix}`);
}

function categoryCandidate(category: P9CategorySuggestion, match: MatchResult, stats: CorpusStats, recent: Set<string>): Candidate {
  return candidateFrom({
    id: category.id,
    text: category.text,
    suggestion_type: "category",
    predicted_intent: "category_browse",
    matchStrength: match.strength,
    popularity: category.popularity,
    query_frequency: category.query_frequency,
    stats,
    recent,
    reason: `${match.basis}; synthetic category popularity ${category.popularity}; synthetic query_frequency ${category.query_frequency}`
  });
}

function abbreviationCandidate(entry: P9AbbreviationEntry, stats: CorpusStats, recent: Set<string>): Candidate {
  return candidateFrom({
    id: entry.id,
    text: entry.expansion,
    suggestion_type: "abbreviation_expansion",
    predicted_intent: "abbreviation_expansion",
    matchStrength: 2,
    popularity: entry.popularity,
    query_frequency: entry.query_frequency,
    stats,
    recent,
    reason: `explicit abbreviation ${entry.abbr} expands to ${entry.expansion}`
  });
}

function fallbackCandidate(stats: CorpusStats): Candidate {
  const fallback = [...popularQueries].sort(comparePopularQueries)[0] ?? {
    id: "SYN-Q-FALLBACK",
    text: "bệnh viện gần nhất",
    query_frequency: stats.maxFrequency
  };
  return candidateFrom({
    id: fallback.id,
    text: fallback.text,
    suggestion_type: "popular_query",
    predicted_intent: "popular_query",
    matchStrength: 0,
    popularity: 0,
    query_frequency: fallback.query_frequency,
    stats,
    recent: new Set<string>(),
    reason: "deterministic fallback to top synthetic popular query"
  });
}

function candidateFrom(params: {
  id: string;
  text: string;
  suggestion_type: P9SuggestionType;
  predicted_intent: string;
  matchStrength: number;
  popularity: number;
  query_frequency: number;
  stats: CorpusStats;
  recent: Set<string>;
  reason: string;
}): Candidate {
  const popularityNorm = params.stats.maxPopularity > 0 ? params.popularity / params.stats.maxPopularity : 0;
  const frequencyNorm = params.stats.maxFrequency > 0 ? params.query_frequency / params.stats.maxFrequency : 0;
  const foldedText = foldForMatch(params.text);
  const recentBonus = params.recent.has(foldedText) ? 1 : 0;
  const score =
    RANKING_WEIGHTS.match * params.matchStrength +
    RANKING_WEIGHTS.popularity * popularityNorm +
    RANKING_WEIGHTS.frequency * frequencyNorm +
    RANKING_WEIGHTS.recent * recentBonus;
  return {
    id: params.id,
    text: params.text,
    predicted_intent: params.predicted_intent,
    score: roundScore(score),
    reason: `${params.reason}; recent_bonus ${recentBonus}`,
    suggestion_type: params.suggestion_type,
    popularity: params.popularity,
    query_frequency: params.query_frequency,
    foldedText
  };
}

function rankCandidates(candidates: Candidate[]): Candidate[] {
  const ordered = [...candidates].sort(compareCandidates);
  const seen = new Set<string>();
  const deduped: Candidate[] = [];
  for (const candidate of ordered) {
    if (seen.has(candidate.foldedText)) continue;
    seen.add(candidate.foldedText);
    deduped.push(candidate);
  }
  return deduped;
}

function compareCandidates(left: Candidate, right: Candidate): number {
  const score = right.score - left.score;
  if (score !== 0) return score;
  const popularity = right.popularity - left.popularity;
  if (popularity !== 0) return popularity;
  const frequency = right.query_frequency - left.query_frequency;
  if (frequency !== 0) return frequency;
  const text = left.foldedText.localeCompare(right.foldedText);
  if (text !== 0) return text;
  return left.id.localeCompare(right.id);
}

function comparePopularQueries(left: P9PopularQuery, right: P9PopularQuery): number {
  const frequency = right.query_frequency - left.query_frequency;
  if (frequency !== 0) return frequency;
  const text = foldForMatch(left.text).localeCompare(foldForMatch(right.text));
  if (text !== 0) return text;
  return left.id.localeCompare(right.id);
}

function statsFor(pois: P9Poi[]): CorpusStats {
  const popularityValues = [
    ...pois.map((poi) => poi.popularity),
    ...categorySuggestions.map((category) => category.popularity),
    ...abbreviationEntries.map((entry) => entry.popularity),
    0
  ];
  const frequencyValues = [
    ...pois.map((poi) => poi.query_frequency),
    ...popularQueries.map((query) => query.query_frequency),
    ...categorySuggestions.map((category) => category.query_frequency),
    ...abbreviationEntries.map((entry) => entry.query_frequency),
    1
  ];
  return {
    maxPopularity: Math.max(...popularityValues),
    maxFrequency: Math.max(...frequencyValues)
  };
}

function selectPois(state: unknown): P9Poi[] {
  if (isRecord(state) && Array.isArray(state.pois)) {
    const pois = state.pois.filter(isPoi);
    if (pois.length > 0) return pois;
  }
  return p9Pois;
}

function selectInput(input: unknown): P9SuggestInput {
  if (!isRecord(input)) return { prefix: "" };
  const prefix = typeof input.prefix === "string" ? input.prefix : "";
  const selected: P9SuggestInput = { prefix };
  if (Array.isArray(input.recent_queries)) {
    selected.recent_queries = input.recent_queries.filter((item): item is string => typeof item === "string");
  }
  if (typeof input.limit === "number") selected.limit = input.limit;
  return selected;
}

function normalizeLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) return 5;
  return Math.max(1, Math.trunc(limit));
}

function roundScore(value: number): number {
  return Number(value.toFixed(6));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPoi(value: unknown): value is P9Poi {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    typeof value.popularity === "number" &&
    typeof value.query_frequency === "number"
  );
}

function isCandidate(value: Candidate | null): value is Candidate {
  return value !== null;
}
