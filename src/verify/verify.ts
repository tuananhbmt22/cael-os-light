import type { EvidenceRef } from "../types/index.js";
import { TurnOutcome } from "../types/index.js";
import type { EvidenceUnit } from "../ground/ground.js";

export interface AnswerClaim {
  text: string;
  requiredEvidenceId?: string;
  requiredTerms?: string[];
  polarity?: "positive" | "negative";
  scope?: string;
  number?: number;
}

export interface VerifyResult {
  ok: boolean;
  outcome: TurnOutcome;
  refusal_reason?: string;
  cited: EvidenceRef[];
}

export function verify(answerClaim: string | AnswerClaim, groundedUnits: EvidenceUnit[]): VerifyResult {
  const claim = typeof answerClaim === "string" ? { text: answerClaim } : answerClaim;
  const usableUnits = groundedUnits.filter((unit) => !unit.corrupt);
  const missing = missingEvidenceRef(claim);

  if (usableUnits.length === 0) {
    return refuse("missing_evidence", [missing]);
  }

  if (claim.requiredEvidenceId && !usableUnits.some((unit) => unit.id === claim.requiredEvidenceId)) {
    return refuse("required_evidence_absent", [missing]);
  }

  const candidates = usableUnits.filter((unit) => supportsClaim(claim, unit));
  if (candidates.length === 0) {
    return refuse("claim_not_supported", [missing]);
  }

  const contradictions = candidates.filter((unit) => contradictsClaim(claim, unit));
  if (contradictions.length > 0 || candidates.length === 0) {
    return refuse("claim_contradicts_evidence", candidates.map(toEvidenceRef));
  }

  return {
    ok: true,
    outcome: TurnOutcome.Answer,
    cited: candidates.slice(0, 3).map(toEvidenceRef)
  };
}

function supportsClaim(claim: AnswerClaim, unit: EvidenceUnit): boolean {
  if (claim.requiredEvidenceId && unit.id !== claim.requiredEvidenceId) return false;
  const unitTokens = tokenSet(`${unit.id} ${unit.source} ${unit.text} ${(unit.keywords ?? []).join(" ")}`);
  const terms = claim.requiredTerms ?? significantTokens(claim.text);
  if (terms.length === 0) return false;
  return terms.every((term) => unitTokens.has(normalizeToken(term)));
}

function contradictsClaim(claim: AnswerClaim, unit: EvidenceUnit): boolean {
  const claimPolarity = claim.polarity ?? detectPolarity(claim.text);
  const unitPolarity = unit.polarity ?? detectPolarity(unit.text);
  if (claimPolarity !== unitPolarity) return true;
  if (claim.scope && unit.scope && claim.scope !== unit.scope) return true;
  const claimNumber = claim.number ?? firstNumber(claim.text);
  if (claimNumber !== undefined && unit.numbers && unit.numbers.length > 0 && !unit.numbers.includes(claimNumber)) {
    return true;
  }
  return false;
}

function missingEvidenceRef(claim: AnswerClaim): EvidenceRef {
  return {
    id: claim.requiredEvidenceId ? `missing:${claim.requiredEvidenceId}` : "missing:evidence",
    source: "ground",
    quote: claim.text
  };
}

function refuse(refusal_reason: string, cited: EvidenceRef[]): VerifyResult {
  return {
    ok: false,
    outcome: TurnOutcome.RefuseEvidence,
    refusal_reason,
    cited
  };
}

function toEvidenceRef(unit: EvidenceUnit): EvidenceRef {
  return {
    id: unit.id,
    source: unit.source,
    quote: unit.text
  };
}

function detectPolarity(text: string): "positive" | "negative" {
  return /\b(no|not|never|without|absent|denied|khong|không|chua|chưa)\b/iu.test(text) ? "negative" : "positive";
}

function firstNumber(text: string): number | undefined {
  const match = text.match(/-?\d+(?:\.\d+)?/u);
  return match ? Number(match[0]) : undefined;
}

function significantTokens(text: string): string[] {
  const stop = new Set(["the", "a", "an", "is", "are", "to", "for", "of", "and", "or", "it", "this", "that"]);
  return [...tokenSet(text)].filter((token) => token.length > 2 && !stop.has(token));
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

function normalizeToken(text: string): string {
  return (
    text
      .toLocaleLowerCase("en-US")
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .match(/[\p{L}\p{N}]+/u)?.[0] ?? ""
  );
}
