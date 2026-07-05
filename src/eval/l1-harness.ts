import type { LoadedPack } from "../pack/pack-loader.js";
import type { BrokenKeyClaim, PackVisibility, ScoredSurfaceBinding } from "../pack/pack-schema.js";
import type { Schema, ValidationError } from "../validate/structured-output.js";
import { s, validate } from "../validate/structured-output.js";

export type ScoredFunction = (state: unknown, input: unknown) => unknown;

export interface ScoredFunctionMap {
  [fnName: string]: ScoredFunction;
}

export interface L1EvalCase {
  case_id: string;
  input: unknown;
  state?: unknown;
  expected: Record<string, unknown>;
}

export interface L1EvalSet {
  version: string;
  cases: L1EvalCase[];
}

export interface L1KeyReport {
  eval_key: string;
  surface_key: string;
  fn_name: string;
  visibility: PackVisibility;
  scope: "PUBLIC" | "HIDDEN";
  scored_count: number;
  correct_count: number;
  quarantined_count: number;
  error_count: number;
  score: number | null;
}

export interface L1RowResult {
  case_id: string;
  eval_key: string;
  surface_key: string;
  visibility: PackVisibility;
  disposition: "scored" | "quarantined" | "error";
  expected?: unknown;
  actual?: unknown;
  correct?: boolean;
  claim?: BrokenKeyClaim | undefined;
  errors?: ValidationError[] | undefined;
}

export interface L1ClientFlag {
  case_id: string;
  eval_key: string;
  text: string;
  score_disposition: BrokenKeyClaim["score_disposition"];
}

export interface L1Report {
  pack_id: string;
  eval_set_version: string;
  public_scope: {
    eval_keys: string[];
    surfaces: string[];
  };
  hidden_scope: {
    eval_keys: string[];
    surfaces: string[];
  };
  keys: L1KeyReport[];
  rows: L1RowResult[];
  client_flags: L1ClientFlag[];
  errors: L1RowResult[];
}

type OutputRecord = Record<string, unknown>;

const outputRecordSchema: Schema<OutputRecord> = s.record(
  s.union<unknown>([s.string(), s.number(), s.boolean(), s.array(s.string()), s.literal(null)])
) as Schema<OutputRecord>;

export function scoreL1(pack: LoadedPack, scoredFns: ScoredFunctionMap, evalSet: L1EvalSet): L1Report {
  const declarations = pack.raw.scored_surfaces;
  const claimsByCase = new Map(pack.raw.broken_key_claims.map((claim) => [claim.case_id, claim]));
  const rows: L1RowResult[] = [];
  const clientFlags: L1ClientFlag[] = [];

  for (const binding of declarations.bindings) {
    const surface = declarations.surfaces[binding.surface_key];
    if (!surface) {
      rows.push(errorRow(binding, "hidden", "declared binding points at missing surface"));
      continue;
    }
    const fn = scoredFns[binding.fn_name];
    if (!fn) {
      rows.push(errorRow(binding, surface.visibility, `missing scored function ${binding.fn_name}`));
      continue;
    }

    for (const evalCase of evalSet.cases) {
      const claim = claimsByCase.get(evalCase.case_id);
      if (claim?.score_disposition.action === "quarantine") {
        rows.push({
          case_id: evalCase.case_id,
          eval_key: binding.eval_key,
          surface_key: binding.surface_key,
          visibility: surface.visibility,
          disposition: "quarantined",
          expected: evalCase.expected[binding.eval_key],
          claim
        });
        clientFlags.push({
          case_id: evalCase.case_id,
          eval_key: binding.eval_key,
          text: claim.client_flag_text,
          score_disposition: claim.score_disposition
        });
        continue;
      }

      const output = validateScoredOutput(fn, evalCase, binding);
      if (!output.ok) {
        rows.push({
          case_id: evalCase.case_id,
          eval_key: binding.eval_key,
          surface_key: binding.surface_key,
          visibility: surface.visibility,
          disposition: "error",
          expected: evalCase.expected[binding.eval_key],
          errors: output.errors
        });
        continue;
      }

      if (claim) {
        clientFlags.push({
          case_id: evalCase.case_id,
          eval_key: binding.eval_key,
          text: claim.client_flag_text,
          score_disposition: claim.score_disposition
        });
      }

      const expected = evalCase.expected[binding.eval_key];
      const actual = output.value[binding.surface_key];
      rows.push({
        case_id: evalCase.case_id,
        eval_key: binding.eval_key,
        surface_key: binding.surface_key,
        visibility: surface.visibility,
        disposition: "scored",
        expected,
        actual,
        correct: stableEqual(actual, expected),
        claim
      });
    }
  }

  return {
    pack_id: pack.packId,
    eval_set_version: evalSet.version,
    public_scope: scopeFor(declarations.bindings, pack, "public"),
    hidden_scope: scopeFor(declarations.bindings, pack, "hidden"),
    keys: keyReports(declarations.bindings, pack, rows),
    rows,
    client_flags: clientFlags,
    errors: rows.filter((row) => row.disposition === "error")
  };
}

function validateScoredOutput(
  fn: ScoredFunction,
  evalCase: L1EvalCase,
  binding: ScoredSurfaceBinding
): { ok: true; value: OutputRecord } | { ok: false; errors: ValidationError[] } {
  let raw: unknown;
  try {
    raw = fn(evalCase.state, evalCase.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "scored function threw";
    return { ok: false, errors: [{ path: "$", message }] };
  }

  const validated = validate(outputRecordSchema, raw);
  if (!validated.ok) return validated;
  if (!(binding.surface_key in validated.value)) {
    return {
      ok: false,
      errors: [{ path: `$.${binding.surface_key}`, message: "missing declared scored surface key" }]
    };
  }
  return validated;
}

function keyReports(bindings: ScoredSurfaceBinding[], pack: LoadedPack, rows: L1RowResult[]): L1KeyReport[] {
  return bindings.map((binding) => {
    const visibility = pack.raw.scored_surfaces.surfaces[binding.surface_key]?.visibility ?? "hidden";
    const keyRows = rows.filter((row) => row.eval_key === binding.eval_key && row.surface_key === binding.surface_key);
    const scored = keyRows.filter((row) => row.disposition === "scored");
    const correct = scored.filter((row) => row.correct).length;
    return {
      eval_key: binding.eval_key,
      surface_key: binding.surface_key,
      fn_name: binding.fn_name,
      visibility,
      scope: visibility === "public" ? "PUBLIC" : "HIDDEN",
      scored_count: scored.length,
      correct_count: correct,
      quarantined_count: keyRows.filter((row) => row.disposition === "quarantined").length,
      error_count: keyRows.filter((row) => row.disposition === "error").length,
      score: scored.length === 0 ? null : correct / scored.length
    };
  });
}

function scopeFor(
  bindings: ScoredSurfaceBinding[],
  pack: LoadedPack,
  visibility: PackVisibility
): { eval_keys: string[]; surfaces: string[] } {
  const evalKeys = new Set<string>();
  const surfaces = new Set<string>();
  for (const binding of bindings) {
    const surface = pack.raw.scored_surfaces.surfaces[binding.surface_key];
    if (surface?.visibility !== visibility) continue;
    evalKeys.add(binding.eval_key);
    surfaces.add(binding.surface_key);
  }
  return { eval_keys: [...evalKeys].sort(), surfaces: [...surfaces].sort() };
}

function errorRow(binding: ScoredSurfaceBinding, visibility: PackVisibility, message: string): L1RowResult {
  return {
    case_id: "__harness__",
    eval_key: binding.eval_key,
    surface_key: binding.surface_key,
    visibility,
    disposition: "error",
    errors: [{ path: "$", message }]
  };
}

function stableEqual(left: unknown, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right);
}

function stableStringify(input: unknown): string {
  if (input === null || typeof input !== "object") return JSON.stringify(input);
  if (Array.isArray(input)) return `[${input.map((item) => stableStringify(item)).join(",")}]`;
  const record = input as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
