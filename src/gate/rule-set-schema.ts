import { s, validate } from "../validate/structured-output.js";
import type { Schema, Validated } from "../validate/structured-output.js";

export type ComparisonOperator = "lt" | "lte" | "gt" | "gte" | "eq" | "neq" | "in" | "contains" | "truthy" | "falsy";
export type FieldKind = "boolean" | "string" | "number";

export interface RbacAccessRow {
  role: string;
  classification: string;
  allow: boolean;
  rule_id: string;
  same_dept: boolean | undefined;
}

export interface ClassificationRank {
  id: string;
  rank: number;
}

export interface RbacRuleSetData {
  archetype: "A";
  roles: string[];
  departments: string[];
  classifications: ClassificationRank[];
  normalization: {
    roles: Record<string, string>;
    departments: Record<string, string>;
  };
  role_hierarchy: Record<string, string[]>;
  access: RbacAccessRow[];
}

export interface EligibilityCondition {
  field: string;
  op: ComparisonOperator;
  value: string | number | boolean | string[] | undefined;
  threshold_id: string | undefined;
}

export interface EligibilityRuleData {
  rule_id: string;
  recommendation: string;
  priority: number;
  conditions: EligibilityCondition[];
  threshold_refs: string[] | undefined;
}

export interface EligibilityRuleSetData {
  archetype: "B";
  cap: number | undefined;
  thresholds: Record<string, number>;
  rules: EligibilityRuleData[];
  fallback: {
    rule_id: string;
    recommendation: string;
    priority: number;
  };
}

export interface OpenWorldFieldDefinition {
  kind: FieldKind;
  hard: boolean;
}

export interface OpenWorldCategoryAxis {
  field: string;
  token_categories: Record<string, string>;
}

export interface OpenWorldSoftRankConfig {
  top_n: number;
  token_present_score: number;
  token_absent_penalty: number;
  token_negated_present_penalty: number;
  token_unknown_score: number;
  category_match_score: number;
  geo_distance_penalty_per_km: number | undefined;
  minimum_score: number | undefined;
}

export interface OpenWorldRuleSetData {
  archetype: "C";
  fields: Record<string, OpenWorldFieldDefinition>;
  token_synonyms: Record<string, string>;
  category_axis: OpenWorldCategoryAxis;
  soft_rank: OpenWorldSoftRankConfig;
}

const primitiveValueSchema = s.union<string | number | boolean>([s.string(), s.number(), s.boolean()]);
const conditionValueSchema = s.union<string | number | boolean | string[]>([
  s.string(),
  s.number(),
  s.boolean(),
  s.array(s.string())
]);

const classificationRankSchema: Schema<ClassificationRank> = s.object(
  {
    id: s.string(),
    rank: s.number()
  },
  "ClassificationRank"
);

const rbacAccessRowSchema: Schema<RbacAccessRow> = s.object(
  {
    role: s.string(),
    classification: s.string(),
    allow: s.boolean(),
    rule_id: s.string(),
    same_dept: s.optional(s.boolean())
  },
  "RbacAccessRow"
);

export const rbacRuleSetSchema: Schema<RbacRuleSetData> = s.object(
  {
    archetype: s.literal("A"),
    roles: s.array(s.string()),
    departments: s.array(s.string()),
    classifications: s.array(classificationRankSchema),
    normalization: s.object(
      {
        roles: s.record(s.string()),
        departments: s.record(s.string())
      },
      "RbacNormalization"
    ),
    role_hierarchy: s.record(s.array(s.string())),
    access: s.array(rbacAccessRowSchema)
  },
  "RbacRuleSet"
);

const eligibilityConditionSchema: Schema<EligibilityCondition> = s.object(
  {
    field: s.string(),
    op: s.enumOf(["lt", "lte", "gt", "gte", "eq", "neq", "in", "contains", "truthy", "falsy"]),
    value: s.optional(conditionValueSchema),
    threshold_id: s.optional(s.string())
  },
  "EligibilityCondition"
);

const eligibilityRuleSchema: Schema<EligibilityRuleData> = s.object(
  {
    rule_id: s.string(),
    recommendation: s.string(),
    priority: s.number(),
    conditions: s.array(eligibilityConditionSchema),
    threshold_refs: s.optional(s.array(s.string()))
  },
  "EligibilityRule"
);

export const eligibilityRuleSetSchema: Schema<EligibilityRuleSetData> = s.object(
  {
    archetype: s.literal("B"),
    cap: s.optional(s.number()),
    thresholds: s.record(s.number()),
    rules: s.array(eligibilityRuleSchema),
    fallback: s.object(
      {
        rule_id: s.string(),
        recommendation: s.string(),
        priority: s.number()
      },
      "EligibilityFallback"
    )
  },
  "EligibilityRuleSet"
);

const fieldDefinitionSchema: Schema<OpenWorldFieldDefinition> = s.object(
  {
    kind: s.enumOf(["boolean", "string", "number"]),
    hard: s.boolean()
  },
  "OpenWorldFieldDefinition"
);

const categoryAxisSchema: Schema<OpenWorldCategoryAxis> = s.object(
  {
    field: s.string(),
    token_categories: s.record(s.string())
  },
  "OpenWorldCategoryAxis"
);

const softRankSchema: Schema<OpenWorldSoftRankConfig> = s.object(
  {
    top_n: s.number(),
    token_present_score: s.number(),
    token_absent_penalty: s.number(),
    token_negated_present_penalty: s.number(),
    token_unknown_score: s.number(),
    category_match_score: s.number(),
    geo_distance_penalty_per_km: s.optional(s.number()),
    minimum_score: s.optional(s.number())
  },
  "OpenWorldSoftRankConfig"
);

export const openWorldRuleSetSchema: Schema<OpenWorldRuleSetData> = s.object(
  {
    archetype: s.literal("C"),
    fields: s.record(fieldDefinitionSchema),
    token_synonyms: s.record(s.string()),
    category_axis: categoryAxisSchema,
    soft_rank: softRankSchema
  },
  "OpenWorldRuleSet"
);

export function validateRbacRuleSetData(input: unknown): Validated<RbacRuleSetData> {
  return validate(rbacRuleSetSchema, input);
}

export function validateEligibilityRuleSetData(input: unknown): Validated<EligibilityRuleSetData> {
  return validate(eligibilityRuleSetSchema, input);
}

export function validateOpenWorldRuleSetData(input: unknown): Validated<OpenWorldRuleSetData> {
  return validate(openWorldRuleSetSchema, input);
}

export { primitiveValueSchema };
