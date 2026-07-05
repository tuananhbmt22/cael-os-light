export interface EvidenceUnit {
  id: string;
  source: string;
  text: string;
  confidence?: number;
  polarity?: "positive" | "negative";
  scope?: string;
  numbers?: number[];
  keywords?: string[];
  corrupt?: boolean;
}

export interface CorpusUnit {
  id: string;
  source: string;
  text?: string;
  facts?: string[];
  confidence?: number;
  polarity?: "positive" | "negative";
  scope?: string;
  numbers?: number[];
  keywords?: string[];
  corrupt?: boolean;
}

export interface CorpusScope {
  units: CorpusUnit[];
  embeddingRecipe?: EmbeddingRecipe;
}

export interface EmbeddingRecipe {
  provider: "pack";
  name: string;
}

export interface GroundResult {
  units: EvidenceUnit[];
}

const boilerplatePatterns = [
  /^copyright\b/i,
  /^all rights reserved\b/i,
  /^terms\b/i,
  /^privacy\b/i,
  /^navigation\b/i,
  /^footer\b/i,
  /^header\b/i
];

export function ground(query: string, corpusScope: CorpusScope): GroundResult {
  const queryTokens = tokenSet(query);
  const units = corpusScope.units.flatMap((unit) => atomicUnits(unit));
  const scored = units
    .map((unit, index) => ({ unit, index, score: scoreUnit(queryTokens, unit) }))
    .filter((row) => row.score > 0 || queryTokens.size === 0)
    .sort((a, b) => b.score - a.score || a.index - b.index || a.unit.id.localeCompare(b.unit.id));

  return { units: scored.map((row) => row.unit) };
}

function atomicUnits(unit: CorpusUnit): EvidenceUnit[] {
  const facts = unit.facts ?? splitFacts(unit.text ?? "");
  return facts
    .map(stripBoilerplate)
    .filter((text) => text.length > 0)
    .map((text, index) => {
      const id = facts.length === 1 ? unit.id : `${unit.id}#${index + 1}`;
      const evidenceUnit: EvidenceUnit = {
        id,
        source: unit.source,
        text,
        numbers: unit.numbers ?? extractNumbers(text),
      };
      if (unit.confidence !== undefined) evidenceUnit.confidence = unit.confidence;
      if (unit.polarity !== undefined) evidenceUnit.polarity = unit.polarity;
      if (unit.scope !== undefined) evidenceUnit.scope = unit.scope;
      if (unit.keywords !== undefined) evidenceUnit.keywords = unit.keywords;
      if (unit.corrupt !== undefined) evidenceUnit.corrupt = unit.corrupt;
      return evidenceUnit;
    });
}

function splitFacts(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function stripBoilerplate(text: string): string {
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => !boilerplatePatterns.some((pattern) => pattern.test(line)));
  return lines.join(" ").replace(/\s+/gu, " ").trim();
}

function scoreUnit(queryTokens: Set<string>, unit: EvidenceUnit): number {
  if (unit.corrupt) return 0;
  const haystack = tokenSet(`${unit.id} ${unit.source} ${unit.text} ${(unit.keywords ?? []).join(" ")}`);
  let score = 0;
  for (const token of queryTokens) {
    if (haystack.has(token)) score += 1;
  }
  return score;
}

function tokenSet(text: string): Set<string> {
  return new Set(
    text
      .toLocaleLowerCase("en-US")
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function extractNumbers(text: string): number[] {
  return (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map((value) => Number(value));
}
