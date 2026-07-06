import { EntityStore, EventLedger, IdempotencyGuard, type KernelStore } from "../kernel/state-kernel.js";
import type { GoalTemplatesDeclaration } from "../pack/pack-schema.js";
import { s } from "../validate/structured-output.js";
import type { Validated, ValidationError } from "../validate/structured-output.js";
import {
  createGoalInputSchema,
  goalRecordSchema,
  GOAL_SCHEMA_VERSION,
  relationKinds,
  type CreateGoalInput,
  type GoalRecord,
  type GoalRelation,
  type GoalStatus,
  type GoalStep,
  type RelationKind
} from "./goal-schema.js";

export type GoalLightErrorCode =
  | "invalid-goal-record"
  | "goal-not-found"
  | "illegal-goal-transition"
  | "undeclared-goal-template"
  | "undeclared-goal-transition"
  | "undeclared-goal-relation";

export interface GoalLightError extends ValidationError {
  code: GoalLightErrorCode;
}

export type GoalLightResult<T> = { ok: true; value: T } | { ok: false; errors: GoalLightError[] };

export interface GoalLightOptions {
  goalTemplates?: GoalTemplatesDeclaration | undefined;
}

export const builtInAllowedTransitions: ReadonlyMap<GoalStatus, readonly GoalStatus[]> = new Map([
  ["decoded", ["ready", "blocked", "paused"]],
  ["ready", ["executing", "blocked", "paused"]],
  ["executing", ["awaiting_verification", "blocked", "paused"]],
  ["awaiting_verification", ["completed", "executing", "blocked", "paused"]],
  ["blocked", ["ready", "paused"]],
  ["paused", ["ready"]],
  ["completed", []]
]);

const goalEventSchema = s.object(
  {
    type: s.enumOf(["goal.created", "goal.status_updated", "goal.relation_added", "goal.step_added", "goal.step_completed"]),
    goal_id: s.string()
  },
  "GoalEvent"
);

const goalFieldNames = new Set<keyof GoalRecord>([
  "id",
  "user_id",
  "objective",
  "status",
  "steps",
  "blocked_by",
  "relates_to",
  "evidence",
  "verification_hint",
  "template_id",
  "schema_version"
]);

export class GoalLight {
  private readonly entities: EntityStore<GoalRecord>;
  private readonly events: EventLedger<{ type: string; goal_id: string }>;
  private readonly guard: IdempotencyGuard<GoalRecord>;
  private readonly goalTemplates?: GoalTemplatesDeclaration | undefined;

  constructor(
    private readonly store: KernelStore,
    options: GoalLightOptions = {}
  ) {
    this.entities = new EntityStore(goalRecordSchema, store);
    this.events = new EventLedger(goalEventSchema, store);
    this.guard = new IdempotencyGuard(store, goalRecordSchema);
    this.goalTemplates = options.goalTemplates;
  }

  createGoal(input: unknown): GoalLightResult<GoalRecord> {
    const parsed = createGoalInputSchema.validate(input);
    if (!parsed.ok) return validationFailure("invalid-goal-record", "$", parsed.errors);

    return this.guard.once(parsed.value.user_id, createKey(parsed.value.id), () => {
      const existing = this.entities.get(parsed.value.user_id, entityKey(parsed.value.id));
      if (existing) return { ok: true, value: existing };

      const record = normalizeCreateInput(parsed.value);
      const templateError = this.validateTemplate(record);
      if (templateError) return templateError;

      const result = this.entities.put(record.user_id, entityKey(record.id), record);
      if (!result.ok) return validationFailure("invalid-goal-record", "$", result.errors);
      this.events.append(record.user_id, { type: "goal.created", goal_id: record.id });
      return result;
    }) as GoalLightResult<GoalRecord>;
  }

  updateStatus(userId: string, goalId: string, nextStatus: GoalStatus): GoalLightResult<GoalRecord> {
    const goal = this.entities.get(userId, entityKey(goalId));
    if (!goal) return failure("goal-not-found", "$.id", goalId);
    if (goal.status === nextStatus) return { ok: true, value: goal };

    const transitionError = this.validateTransition(goal.status, nextStatus);
    if (transitionError) return transitionError;

    const updated: GoalRecord = { ...goal, status: nextStatus };
    const result = this.entities.put(userId, entityKey(goalId), updated);
    if (!result.ok) return validationFailure("invalid-goal-record", "$", result.errors);
    this.events.append(userId, { type: "goal.status_updated", goal_id: goalId });
    return result;
  }

  addRelation(userId: string, goalId: string, relation: GoalRelation): GoalLightResult<GoalRecord> {
    const goal = this.entities.get(userId, entityKey(goalId));
    if (!goal) return failure("goal-not-found", "$.id", goalId);

    const relationError = this.validateRelationShape(relation.kind);
    if (relationError) return relationError;

    const updated =
      relation.kind === "blocked_by"
        ? addBlockedBy(goal, relation.goal_id)
        : addRelatesTo(goal, relation);

    const result = this.entities.put(userId, entityKey(goalId), updated);
    if (!result.ok) return validationFailure("invalid-goal-record", "$", result.errors);
    this.events.append(userId, { type: "goal.relation_added", goal_id: goalId });
    return result;
  }

  addStep(userId: string, goalId: string, step: GoalStep): GoalLightResult<GoalRecord> {
    const goal = this.entities.get(userId, entityKey(goalId));
    if (!goal) return failure("goal-not-found", "$.id", goalId);
    const updated: GoalRecord = {
      ...goal,
      steps: goal.steps.some((existing) => existing.id === step.id) ? goal.steps : [...goal.steps, step]
    };
    const result = this.entities.put(userId, entityKey(goalId), updated);
    if (!result.ok) return validationFailure("invalid-goal-record", "$", result.errors);
    this.events.append(userId, { type: "goal.step_added", goal_id: goalId });
    return result;
  }

  completeStep(userId: string, goalId: string, stepId: string): GoalLightResult<GoalRecord> {
    const goal = this.entities.get(userId, entityKey(goalId));
    if (!goal) return failure("goal-not-found", "$.id", goalId);
    const updated: GoalRecord = {
      ...goal,
      steps: goal.steps.map((step) => (step.id === stepId ? { ...step, done: true } : step))
    };
    const result = this.entities.put(userId, entityKey(goalId), updated);
    if (!result.ok) return validationFailure("invalid-goal-record", "$", result.errors);
    this.events.append(userId, { type: "goal.step_completed", goal_id: goalId });
    return result;
  }

  readGoal(userId: string, goalId: string): GoalRecord | null {
    return this.entities.get(userId, entityKey(goalId));
  }

  listGoals(userId: string): GoalRecord[] {
    return this.entities.list(userId);
  }

  unblocks(userId: string, blockerGoalId: string): GoalRecord[] {
    return this.listGoals(userId).filter(
      (goal) => goal.blocked_by.includes(blockerGoalId) && this.isActionable(goal, userId)
    );
  }

  readActionable(userId: string): GoalRecord[] {
    return this.listGoals(userId).filter((goal) => this.isActionable(goal, userId));
  }

  private isActionable(goal: GoalRecord, userId: string): boolean {
    if (goal.status === "completed") return false;
    return goal.blocked_by.every((blockerId) => this.readGoal(userId, blockerId)?.status === "completed");
  }

  private validateTemplate(record: GoalRecord): GoalLightResult<never> | null {
    if (!this.goalTemplates) return null;
    if (!record.template_id) return failure("undeclared-goal-template", "$.template_id", "missing template_id");

    const template = this.goalTemplates.templates[record.template_id];
    if (!template) return failure("undeclared-goal-template", "$.template_id", record.template_id);

    const unknownField = template.fields.find((field) => !goalFieldNames.has(field as keyof GoalRecord));
    if (unknownField) return failure("undeclared-goal-template", "$.template_id", `unknown template field ${unknownField}`);

    const missingField = template.fields.find((field) => !hasDeclaredField(record, field as keyof GoalRecord));
    if (missingField) {
      return failure("undeclared-goal-template", `$.${missingField}`, `template ${record.template_id} requires ${missingField}`);
    }
    return null;
  }

  private validateTransition(from: GoalStatus, to: GoalStatus): GoalLightResult<never> | null {
    if (this.goalTemplates) {
      const allowed = new Set(this.goalTemplates.allowed_transitions);
      if (!allowed.has(`${from}->${to}`)) return failure("undeclared-goal-transition", "$.status", `${from}->${to}`);
      return null;
    }

    if (!builtInAllowedTransitions.get(from)?.includes(to)) {
      return failure("illegal-goal-transition", "$.status", `${from}->${to}`);
    }
    return null;
  }

  private validateRelationShape(kind: RelationKind): GoalLightResult<never> | null {
    if (!this.goalTemplates) return null;
    if (!this.goalTemplates.relation_shapes.includes(kind)) {
      return failure("undeclared-goal-relation", "$.relates_to.kind", kind);
    }
    return null;
  }
}

function normalizeCreateInput(input: CreateGoalInput): GoalRecord {
  const record: GoalRecord = {
    id: input.id,
    user_id: input.user_id,
    objective: input.objective,
    status: input.status ?? "decoded",
    steps: input.steps ?? [],
    blocked_by: input.blocked_by ?? [],
    relates_to: input.relates_to ?? [],
    evidence: input.evidence ?? [],
    schema_version: input.schema_version ?? GOAL_SCHEMA_VERSION
  };
  if (input.verification_hint !== undefined) record.verification_hint = input.verification_hint;
  if (input.template_id !== undefined) record.template_id = input.template_id;
  return record;
}

function addBlockedBy(goal: GoalRecord, blockerGoalId: string): GoalRecord {
  if (goal.blocked_by.includes(blockerGoalId)) return goal;
  return { ...goal, blocked_by: [...goal.blocked_by, blockerGoalId] };
}

function addRelatesTo(goal: GoalRecord, relation: GoalRelation): GoalRecord {
  const exists = goal.relates_to.some((existing) => existing.kind === relation.kind && existing.goal_id === relation.goal_id);
  if (exists) return goal;
  return { ...goal, relates_to: [...goal.relates_to, relation] };
}

function hasDeclaredField(record: GoalRecord, field: keyof GoalRecord): boolean {
  const value = record[field];
  if (Array.isArray(value)) return true;
  return value !== undefined && value !== "";
}

function entityKey(goalId: string): string {
  return `goal:${goalId}`;
}

function createKey(goalId: string): string {
  return `goal:create:${goalId}`;
}

function failure(code: GoalLightErrorCode, path: string, detail: string): GoalLightResult<never> {
  return { ok: false, errors: [{ code, path, message: detail.length > 0 ? code : code }] };
}

function validationFailure(code: GoalLightErrorCode, path: string, errors: ValidationError[]): GoalLightResult<never> {
  const detail = errors.map((error) => `${error.path}: ${error.message}`).join("; ");
  return { ok: false, errors: [{ code, path, message: detail.length > 0 ? `${code}: ${detail}` : code }] };
}

export function createGoalLight(store: KernelStore, options?: GoalLightOptions): GoalLight {
  return new GoalLight(store, options);
}

export { relationKinds };

