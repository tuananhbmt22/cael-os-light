import { accentFold, expandAbbreviations } from "@cael/os-light";
import { abbreviations, typoCorrections } from "./autocomplete-corpus.js";

export interface P9Correction {
  from: string;
  to: string;
}

export interface P9NormalizedPrefix {
  raw: string;
  normalized: string;
  folded: string;
  corrections: P9Correction[];
  steps: string[];
}

export function normalizePrefix(raw: string): P9NormalizedPrefix {
  const steps: string[] = [];
  const corrections: P9Correction[] = [];
  const original = typeof raw === "string" ? raw : "";
  let current = original.trim().replace(/\s+/g, " ");
  if (current !== original) steps.push("trim-collapse");

  const lower = current.toLowerCase();
  if (lower !== current) steps.push("lowercase");
  current = lower;

  const corrected = applyTypoCorrections(current, corrections);
  if (corrected !== current) steps.push("typo-corrections");
  current = corrected;

  const expanded = expandAbbreviations(current, abbreviations).trim().replace(/\s+/g, " ");
  if (expanded !== current) steps.push("abbrev-dict");
  current = expanded;

  const folded = foldForMatch(current);
  steps.push("accent-fold-shadow");

  return {
    raw: original,
    normalized: current,
    folded,
    corrections,
    steps
  };
}

export function foldForMatch(text: string): string {
  return accentFold(text).toLowerCase().trim().replace(/\s+/g, " ");
}

function applyTypoCorrections(input: string, corrections: P9Correction[]): string {
  let current = input;
  const entries = Object.entries(typoCorrections).sort(([left], [right]) => right.length - left.length || left.localeCompare(right));
  for (const [from, to] of entries) {
    const pattern = new RegExp(`(^|\\s)${escapeRegExp(from)}(?=\\s|$|,|\\.)`, "g");
    let applied = false;
    current = current.replace(pattern, (_match, prefix: string) => {
      applied = true;
      return `${prefix}${to}`;
    });
    if (applied) corrections.push({ from, to });
  }
  return current;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
