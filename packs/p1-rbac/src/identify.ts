import { accentFold } from "@cael/os-light";
import type { CorpusScope, CorpusUnit } from "@cael/os-light";
import { syntheticDocuments, type P1Document } from "./synthetic-corpus.js";
import { canonicalClassification, canonicalDepartment } from "./rbac-rule-set.js";

export interface P1RuntimeState {
  documents?: P1Document[];
  corpus?: CorpusScope;
}

export interface P1AnswerInput {
  query?: string;
  user_role?: string;
  user_department?: string;
}

export interface IdentifiedDocuments {
  docs: P1Document[];
  routeAmbiguous: boolean;
  confidence: number;
}

type IndexedDocument = {
  id: string;
  titleTerms: Set<string>;
  bodyTerms: Set<string>;
};

type RankedDocument = {
  id: string;
  score: number;
};

const MIN_SEGMENT_SCORE = 4;
const MIN_SINGLE_SCORE = 4;
const STOP_TERMS = new Set(
  "la gi duoc de va trong cho cua co can nao nhung cac mot toi xem lam the nao bao nhieu sau khi tren vao nam theo nay lien quan quy dinh chinh sach quy trinh tai lieu".split(
    " "
  )
);

export function identifyDocuments(state: unknown, input: unknown, fallbackCorpus: CorpusScope): IdentifiedDocuments {
  const runtime = isRecord(state) ? (state as P1RuntimeState) : {};
  const request = isRecord(input) ? (input as P1AnswerInput) : {};
  const documents = normalizeDocuments(runtime.documents ?? syntheticDocuments);
  const byId = new Map(documents.map((doc) => [doc.id, doc]));
  const query = typeof request.query === "string" ? request.query : "";
  if (query.trim() === "") return { docs: [], routeAmbiguous: true, confidence: 0 };

  const corpus = runtime.corpus ?? corpusFromDocuments(documents, fallbackCorpus);
  const ranked = rankDocuments(query, corpus, documents);
  if (ranked.length === 0 || (ranked[0]?.score ?? 0) < MIN_SINGLE_SCORE) {
    return { docs: [], routeAmbiguous: true, confidence: 0 };
  }

  const segmentIds = resolveSegmentIds(query, corpus, documents);
  const ids = segmentIds.length > 1 ? segmentIds : [ranked[0]?.id].filter((id): id is string => id !== undefined);
  const resolvedDocs = ids.map((id) => byId.get(id)).filter((doc): doc is P1Document => doc !== undefined);
  return {
    docs: resolvedDocs,
    routeAmbiguous: resolvedDocs.length === 0,
    confidence: confidenceFromScore(ranked[0]?.score ?? 0)
  };
}

export function normalizeDocuments(documents: P1Document[]): P1Document[] {
  return documents.map((doc) => {
    const normalized: P1Document = {
      id: doc.id,
      department: canonicalDepartment(doc.department),
      classification: canonicalClassification(doc.classification) as P1Document["classification"]
    };
    if (doc.blocks) {
      normalized.blocks = doc.blocks.map((block) => ({
        classification: canonicalClassification(block.classification) as P1Document["classification"]
      }));
    }
    if (doc.title) normalized.title = doc.title;
    if (doc.text) normalized.text = doc.text;
    if (doc.facts) normalized.facts = doc.facts;
    if (doc.keywords) normalized.keywords = doc.keywords;
    return normalized;
  });
}

function resolveSegmentIds(query: string, corpus: CorpusScope, documents: P1Document[]): string[] {
  const segments = splitSegments(query);
  if (segments.length < 2) return [];
  return unique(
    segments
      .map((segment) => rankDocuments(segment, corpus, documents)[0])
      .filter((row): row is RankedDocument => row !== undefined && row.score >= MIN_SEGMENT_SCORE)
      .map((row) => row.id)
  );
}

function rankDocuments(query: string, corpus: CorpusScope, documents: P1Document[]): RankedDocument[] {
  const indexed = buildIndex(corpus, documents);
  const idf = buildIdf(indexed);
  const queryTerms = terms(query);
  return indexed
    .map((doc) => {
      let score = 0;
      for (const term of queryTerms) {
        const weight = idf.get(term) ?? 1;
        const factor = term.includes(" ") ? 4 : /[0-9]/u.test(term) ? 12 : isImportant(term) ? 3 : 1;
        if (doc.titleTerms.has(term)) score += weight * factor * 3;
        else if (doc.bodyTerms.has(term)) score += weight * factor;
      }
      const foldedQuery = fold(query);
      const foldedTitle = [...doc.titleTerms].join(" ");
      if (foldedTitle && foldedQuery.includes(foldedTitle)) score += 12;
      return { id: doc.id, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}

function buildIndex(corpus: CorpusScope, documents: P1Document[]): IndexedDocument[] {
  const byId = new Map(documents.map((doc) => [doc.id, doc]));
  const grouped = new Map<string, CorpusUnit[]>();
  for (const unit of corpus.units) {
    const id = baseEvidenceId(unit.id);
    if (!byId.has(id)) continue;
    const rows = grouped.get(id) ?? [];
    rows.push(unit);
    grouped.set(id, rows);
  }

  return documents.map((doc) => {
    const units = grouped.get(doc.id) ?? [];
    const titleText = [doc.title, ...units.map((unit) => unit.source)].filter(Boolean).join(" ");
    const bodyText = [
      doc.text,
      ...(doc.facts ?? []),
      ...(doc.keywords ?? []),
      ...units.flatMap((unit) => [unit.text, ...(unit.facts ?? []), ...(unit.keywords ?? [])])
    ]
      .filter(Boolean)
      .join(" ");
    return {
      id: doc.id,
      titleTerms: new Set(terms(titleText)),
      bodyTerms: new Set(terms(bodyText))
    };
  });
}

function corpusFromDocuments(documents: P1Document[], fallbackCorpus: CorpusScope): CorpusScope {
  const units: CorpusUnit[] = documents.flatMap((doc) => {
    const text = [doc.title, doc.text, ...(doc.facts ?? [])].filter(Boolean).join("\n");
    if (!text) return [];
    const unit: CorpusUnit = { id: doc.id, source: doc.title ?? doc.id, text };
    if (doc.keywords) unit.keywords = doc.keywords;
    return [unit];
  });
  return units.length > 0 ? { units } : fallbackCorpus;
}

function buildIdf(rows: IndexedDocument[]): Map<string, number> {
  const documentFrequency = new Map<string, number>();
  for (const row of rows) {
    for (const term of new Set([...row.titleTerms, ...row.bodyTerms])) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }
  return new Map(
    [...documentFrequency.entries()].map(([term, count]) => [term, Math.log((rows.length + 1) / (count + 1)) + 1])
  );
}

function splitSegments(query: string): string[] {
  return query
    .split(/,|\s+and\s+|\s+và\s+/giu)
    .map((part) => part.trim())
    .filter((part) => tokens(part).length >= 2);
}

function terms(value: unknown): string[] {
  const base = tokens(value);
  return unique([...base, ...ngrams(base, 2), ...ngrams(base, 3)]);
}

function tokens(value: unknown): string[] {
  return (
    fold(value)
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((token) => token.length > 1 && !STOP_TERMS.has(token)) ?? []
  );
}

function ngrams(items: string[], size: number): string[] {
  const out: string[] = [];
  for (let index = 0; index + size <= items.length; index += 1) {
    out.push(items.slice(index, index + size).join(" "));
  }
  return out;
}

function fold(value: unknown): string {
  return accentFold(String(value ?? "")).toLocaleLowerCase("en-US");
}

function baseEvidenceId(id: string): string {
  return id.split("#")[0] ?? id;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function isImportant(term: string): boolean {
  return /^[a-z]{2,}$/u.test(term) || term.length >= 5;
}

function confidenceFromScore(score: number): number {
  return Math.max(0, Math.min(1, score / 100));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
