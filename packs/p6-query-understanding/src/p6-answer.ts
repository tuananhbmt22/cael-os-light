import { understandQuery } from "./intent-rules.js";

export interface P6ScoredInput {
  query?: unknown;
}

export interface P6ScoredOutput {
  normalized_query: string;
  intent: string;
  entities: string[];
}

export function p6_answer(_state: unknown, input: unknown): P6ScoredOutput {
  const query = readQuery(input);
  const understood = understandQuery(query);
  return {
    normalized_query: understood.normalized.normalized_query,
    intent: understood.intent,
    entities: understood.entities
  };
}

function readQuery(input: unknown): string {
  if (input !== null && typeof input === "object" && !Array.isArray(input)) {
    const query = (input as P6ScoredInput).query;
    if (typeof query === "string") return query;
  }
  return "";
}

