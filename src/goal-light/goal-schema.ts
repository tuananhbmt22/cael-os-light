import { s } from "../validate/structured-output.js";
import type { Schema } from "../validate/structured-output.js";

export const GOAL_SCHEMA_VERSION = "goal-light.v1";

export const goalStatuses = [
  "decoded",
  "ready",
  "executing",
  "awaiting_verification",
  "completed",
  "blocked",
  "paused"
] as const;

export type GoalStatus = (typeof goalStatuses)[number];

export const relationKinds = ["blocked_by", "parent", "child", "relates_to", "supersedes", "duplicate_of"] as const;

export type RelationKind = (typeof relationKinds)[number];

export interface GoalStep {
  id: string;
  text: string;
  done: boolean;
}

export interface GoalRelation {
  kind: RelationKind;
  goal_id: string;
}

export interface GoalRecord {
  id: string;
  user_id: string;
  objective: string;
  status: GoalStatus;
  steps: GoalStep[];
  blocked_by: string[];
  relates_to: GoalRelation[];
  evidence: string[];
  verification_hint?: string;
  template_id?: string;
  schema_version: string;
}

export const goalStatusSchema = s.enumOf(goalStatuses);
export const relationKindSchema = s.enumOf(relationKinds);

export const goalStepSchema: Schema<GoalStep> = s.object(
  {
    id: s.string(),
    text: s.string(),
    done: s.boolean()
  },
  "GoalStep"
);

export const goalRelationSchema: Schema<GoalRelation> = s.object(
  {
    kind: relationKindSchema,
    goal_id: s.string()
  },
  "GoalRelation"
);

export const goalRecordSchema: Schema<GoalRecord> = s.object(
  {
    id: s.string(),
    user_id: s.string(),
    objective: s.string(),
    status: goalStatusSchema,
    steps: s.array(goalStepSchema),
    blocked_by: s.array(s.string()),
    relates_to: s.array(goalRelationSchema),
    evidence: s.array(s.string()),
    verification_hint: s.optional(s.string()),
    template_id: s.optional(s.string()),
    schema_version: s.string()
  },
  "GoalRecord"
) as Schema<GoalRecord>;

export interface CreateGoalInput {
  id: string;
  user_id: string;
  objective: string;
  status?: GoalStatus | undefined;
  steps?: GoalStep[] | undefined;
  blocked_by?: string[] | undefined;
  relates_to?: GoalRelation[] | undefined;
  evidence?: string[] | undefined;
  verification_hint?: string | undefined;
  template_id?: string | undefined;
  schema_version?: string | undefined;
}

export const createGoalInputSchema: Schema<CreateGoalInput> = s.object(
  {
    id: s.string(),
    user_id: s.string(),
    objective: s.string(),
    status: s.optional(goalStatusSchema),
    steps: s.optional(s.array(goalStepSchema)),
    blocked_by: s.optional(s.array(s.string())),
    relates_to: s.optional(s.array(goalRelationSchema)),
    evidence: s.optional(s.array(s.string())),
    verification_hint: s.optional(s.string()),
    template_id: s.optional(s.string()),
    schema_version: s.optional(s.string())
  },
  "CreateGoalInput"
) as Schema<CreateGoalInput>;

