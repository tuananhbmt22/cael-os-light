import type { Schema, ValidationError } from "../validate/structured-output.js";
import { s, validate } from "../validate/structured-output.js";

export interface Rubric {
  rubric_id: string;
  criteria: string[];
}

export interface RubricSample {
  sample_id: string;
  producer_model_id: string;
  output: unknown;
}

export interface RubricReceipt {
  rubric_id: string;
  sample_id: string;
  judge_model_id: string;
  total_score: number;
  max_score: number;
  criteria: Record<string, number>;
  rationale: string;
  schema_version: "phase0.rubric.v1";
}

export interface RubricJudge {
  judge_model_id: string;
  evaluate(rubric: Rubric, sample: RubricSample): unknown;
}

export type RubricJudgeResult =
  | { ok: true; receipt: RubricReceipt }
  | { ok: false; errors: ValidationError[] };

const rubricReceiptSchema: Schema<RubricReceipt> = s.object(
  {
    rubric_id: s.string(),
    sample_id: s.string(),
    judge_model_id: s.string(),
    total_score: s.number(),
    max_score: s.number(),
    criteria: s.record(s.number()),
    rationale: s.string(),
    schema_version: s.literal("phase0.rubric.v1")
  },
  "RubricReceipt"
) as Schema<RubricReceipt>;

export function judgeRubric(rubric: Rubric, sample: RubricSample, judge: RubricJudge): RubricJudgeResult {
  if (judge.judge_model_id === sample.producer_model_id) {
    return {
      ok: false,
      errors: [
        {
          path: "$.judge_model_id",
          message: "rubric judge must be an independent injected judge, not the producing model"
        }
      ]
    };
  }

  let raw: unknown;
  try {
    raw = judge.evaluate(rubric, sample);
  } catch (error) {
    const message = error instanceof Error ? error.message : "rubric judge threw";
    return { ok: false, errors: [{ path: "$", message }] };
  }

  const receipt = validate(rubricReceiptSchema, raw);
  if (!receipt.ok) return { ok: false, errors: receipt.errors };
  return { ok: true, receipt: receipt.value };
}
