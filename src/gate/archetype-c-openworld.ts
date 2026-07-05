import type { EvidenceState } from "../types/index.js";
import type { DecisionEvidence, GateDecision, GateInput, GatePrimitive, GateRuleSet, RankedCandidate } from "./gate-engine.js";
import type { OpenWorldRuleSetData } from "./rule-set-schema.js";

interface GeoPoint {
  lat: number;
  lon: number;
}

interface OpenWorldQuery {
  field_constraints: Record<string, GatePrimitive>;
  tokens: string[];
  category?: string;
  geo?: GeoPoint;
  negations?: string[];
}

interface OpenWorldCandidate {
  id: string;
  category: string;
  fields: Record<string, GatePrimitive>;
  tokens: Record<string, EvidenceState>;
  rating: number;
  popularity: number;
  review_count: number;
  geo?: GeoPoint;
}

interface ScoredCandidate {
  candidate: OpenWorldCandidate;
  score: number;
  firingRules: string[];
  evidence: DecisionEvidence[];
}

export function createOpenWorldRuleSet(data: OpenWorldRuleSetData): GateRuleSet {
  const config = { ...data.soft_rank };

  return {
    archetype: "C",
    decide(input: GateInput): GateDecision {
      const parsed = parseOpenWorldInput(input);
      if (!parsed.ok) {
        return {
          decision: "refuse",
          firing_rule: parsed.firingRule,
          evidence: parsed.evidence,
          fallback_used: true
        };
      }

      const normalizedTokens = normalizeTokens(parsed.query.tokens, data);
      const negatedTokens = new Set(normalizeTokens(parsed.query.negations ?? [], data));
      const lane1 = fieldHardGate(parsed.candidates, parsed.query.field_constraints, data);
      if (lane1.survivors.length === 0) {
        return refuse(`openworld_field_hard_gate_empty:${lane1.firingRule}`, lane1.evidence);
      }

      const hardKillToken = soleDiscriminatorToken(parsed.query, normalizedTokens, negatedTokens, lane1.survivors, data);
      const tokenSurvivors = hardKillToken
        ? lane1.survivors.filter((candidate) => tokenState(candidate, hardKillToken) === "present")
        : lane1.survivors;
      if (tokenSurvivors.length === 0) {
        return refuse(`openworld_token_hard_kill_empty:${hardKillToken ?? "none"}`, lane1.evidence);
      }

      const scored = tokenSurvivors
        .map((candidate) => scoreCandidate(candidate, parsed.query, normalizedTokens, negatedTokens, data))
        .filter((candidate) => candidate.score >= (config.minimum_score ?? Number.NEGATIVE_INFINITY))
        .sort(compareScoredCandidates)
        .slice(0, config.top_n);

      if (scored.length === 0) {
        return refuse("openworld_no_ranked_candidate_above_minimum", lane1.evidence);
      }

      const ranked: RankedCandidate[] = scored.map((candidate) => ({
        id: candidate.candidate.id,
        score: candidate.score,
        firing_rule: candidate.firingRules[0] ?? "openworld_objective_rank"
      }));

      return {
        decision: "score",
        firing_rule: ranked[0]?.firing_rule ?? "openworld_objective_rank",
        ranked,
        evidence: [...lane1.evidence, ...scored.flatMap((candidate) => candidate.evidence)],
        fallback_used: false
      };
    }
  };
}

function fieldHardGate(
  candidates: OpenWorldCandidate[],
  constraints: Record<string, GatePrimitive>,
  data: OpenWorldRuleSetData
): { survivors: OpenWorldCandidate[]; firingRule: string; evidence: DecisionEvidence[] } {
  const evidenceRows: DecisionEvidence[] = [];
  const survivors = candidates.filter((candidate) => {
    for (const [field, expected] of Object.entries(constraints)) {
      const definition = data.fields[field];
      if (!definition?.hard) continue;
      const actual = candidate.fields[field];
      const state: EvidenceState = actual === undefined ? "unknown" : "present";
      evidenceRows.push({ key: `field:${field}:${candidate.id}`, state, value: primitiveOrString(actual) });
      if (actual !== expected) return false;
    }
    return true;
  });
  const firingRule = Object.keys(constraints).length > 0 ? `field:${Object.keys(constraints).sort().join(",")}` : "field:none";
  return { survivors, firingRule, evidence: evidenceRows };
}

function soleDiscriminatorToken(
  query: OpenWorldQuery,
  tokens: string[],
  negatedTokens: Set<string>,
  candidates: OpenWorldCandidate[],
  data: OpenWorldRuleSetData
): string | null {
  const category = query.category ?? categoryFromTokens(tokens, data);
  const fieldCount = Object.keys(query.field_constraints).length;
  if (tokens.length !== 1 || fieldCount > 0 || negatedTokens.size > 0 || query.geo) return null;
  const token = tokens[0];
  if (!token) return null;
  const inCategory = category ? candidates.filter((candidate) => candidate.category === category) : candidates;
  return inCategory.some((candidate) => tokenState(candidate, token) === "present") ? token : null;
}

function scoreCandidate(
  candidate: OpenWorldCandidate,
  query: OpenWorldQuery,
  tokens: string[],
  negatedTokens: Set<string>,
  data: OpenWorldRuleSetData
): ScoredCandidate {
  let score = 0;
  const firingRules: string[] = [];
  const evidenceRows: DecisionEvidence[] = [];
  for (const token of tokens) {
    const state = tokenState(candidate, token);
    const negated = negatedTokens.has(token);
    evidenceRows.push({ key: `token:${token}:${candidate.id}`, state });
    if (negated) {
      score += state === "present" ? data.soft_rank.token_negated_present_penalty : data.soft_rank.token_present_score;
      firingRules.push(`token_negation:${token}`);
    } else if (state === "present") {
      score += data.soft_rank.token_present_score;
      firingRules.push(`token_present:${token}`);
    } else if (state === "absent") {
      score += data.soft_rank.token_absent_penalty;
      firingRules.push(`token_absent_penalty:${token}`);
    } else {
      score += data.soft_rank.token_unknown_score;
      firingRules.push(`token_unknown:${token}`);
    }
  }
  const category = query.category ?? categoryFromTokens(tokens, data);
  if (category && candidate.category === category) {
    score += data.soft_rank.category_match_score;
    firingRules.push(`category_match:${category}`);
  }
  if (query.geo && candidate.geo && data.soft_rank.geo_distance_penalty_per_km) {
    score -= distanceKm(query.geo, candidate.geo) * data.soft_rank.geo_distance_penalty_per_km;
    firingRules.push("geo_distance_rank");
  }
  score += candidate.rating * 0.001 + candidate.popularity * 0.000001 + candidate.review_count * 0.000000001;
  if (firingRules.length === 0) firingRules.push("openworld_objective_rank");
  return { candidate, score, firingRules, evidence: evidenceRows };
}

function compareScoredCandidates(left: ScoredCandidate, right: ScoredCandidate): number {
  return (
    right.score - left.score ||
    right.candidate.rating - left.candidate.rating ||
    right.candidate.popularity - left.candidate.popularity ||
    right.candidate.review_count - left.candidate.review_count ||
    left.candidate.id.localeCompare(right.candidate.id)
  );
}

function normalizeTokens(tokens: string[], data: OpenWorldRuleSetData): string[] {
  return [...new Set(tokens.map((token) => data.token_synonyms[token] ?? token))];
}

function tokenState(candidate: OpenWorldCandidate, token: string): EvidenceState {
  return candidate.tokens[token] ?? "unknown";
}

function categoryFromTokens(tokens: string[], data: OpenWorldRuleSetData): string | null {
  for (const token of tokens) {
    const category = data.category_axis.token_categories[token];
    if (category) return category;
  }
  return null;
}

function refuse(firingRule: string, evidence: DecisionEvidence[]): GateDecision {
  return {
    decision: "refuse",
    firing_rule: firingRule,
    evidence,
    fallback_used: true
  };
}

function parseOpenWorldInput(input: GateInput):
  | { ok: true; query: OpenWorldQuery; candidates: OpenWorldCandidate[] }
  | { ok: false; firingRule: string; evidence: DecisionEvidence[] } {
  if (input.subject === null || typeof input.subject !== "object" || Array.isArray(input.subject)) {
    return { ok: false, firingRule: "openworld_query_malformed", evidence: [] };
  }
  if (input.object === null || typeof input.object !== "object" || Array.isArray(input.object)) {
    return { ok: false, firingRule: "openworld_candidates_malformed", evidence: [] };
  }
  const query = input.subject as Record<string, unknown>;
  const object = input.object as Record<string, unknown>;
  if (!isPrimitiveRecord(query.field_constraints) || !Array.isArray(query.tokens)) {
    return { ok: false, firingRule: "openworld_query_malformed", evidence: [] };
  }
  if (query.tokens.some((token) => typeof token !== "string")) {
    return { ok: false, firingRule: "openworld_query_malformed", evidence: [] };
  }
  if (!Array.isArray(object.candidates)) {
    return { ok: false, firingRule: "openworld_candidates_malformed", evidence: [] };
  }
  const candidates = parseCandidates(object.candidates);
  if (!candidates) return { ok: false, firingRule: "openworld_candidates_malformed", evidence: [] };
  const parsedQuery: OpenWorldQuery = {
    field_constraints: query.field_constraints,
    tokens: query.tokens as string[]
  };
  if (typeof query.category === "string") parsedQuery.category = query.category;
  if (isGeo(query.geo)) parsedQuery.geo = query.geo;
  if (Array.isArray(query.negations) && query.negations.every((token) => typeof token === "string")) {
    parsedQuery.negations = query.negations as string[];
  }
  return { ok: true, query: parsedQuery, candidates };
}

function parseCandidates(rawCandidates: unknown[]): OpenWorldCandidate[] | null {
  const candidates: OpenWorldCandidate[] = [];
  for (const rawCandidate of rawCandidates) {
    if (rawCandidate === null || typeof rawCandidate !== "object" || Array.isArray(rawCandidate)) return null;
    const candidate = rawCandidate as Record<string, unknown>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.category !== "string" ||
      !isPrimitiveRecord(candidate.fields) ||
      !isEvidenceStateRecord(candidate.tokens) ||
      typeof candidate.rating !== "number" ||
      typeof candidate.popularity !== "number" ||
      typeof candidate.review_count !== "number"
    ) {
      return null;
    }
    const parsedCandidate: OpenWorldCandidate = {
      id: candidate.id,
      category: candidate.category,
      fields: candidate.fields,
      tokens: candidate.tokens,
      rating: candidate.rating,
      popularity: candidate.popularity,
      review_count: candidate.review_count
    };
    if (isGeo(candidate.geo)) parsedCandidate.geo = candidate.geo;
    candidates.push(parsedCandidate);
  }
  return candidates;
}

function isPrimitiveRecord(input: unknown): input is Record<string, GatePrimitive> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return false;
  return Object.values(input).every(
    (value) => typeof value === "string" || typeof value === "number" || typeof value === "boolean"
  );
}

function isEvidenceStateRecord(input: unknown): input is Record<string, EvidenceState> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return false;
  return Object.values(input).every((value) => value === "present" || value === "absent" || value === "unknown");
}

function isGeo(input: unknown): input is GeoPoint {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return false;
  const geo = input as Record<string, unknown>;
  return typeof geo.lat === "number" && typeof geo.lon === "number";
}

function primitiveOrString(value: unknown): GatePrimitive {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return "unknown";
}

function distanceKm(left: GeoPoint, right: GeoPoint): number {
  const dLat = left.lat - right.lat;
  const dLon = left.lon - right.lon;
  return Math.sqrt(dLat * dLat + dLon * dLon) * 111;
}
