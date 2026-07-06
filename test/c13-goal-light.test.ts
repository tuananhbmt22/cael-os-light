import { describe, expect, it } from "vitest";
import { createGoalLight, JsonSnapshotKernelStore } from "../src/index.js";
import type { GoalTemplatesDeclaration } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("c13 goal-light", () => {
  it("H goal-create-read-across-restart preserves fields, relations, and Vietnamese text", () => {
    const fixture = readFixture<{ goal: Record<string, unknown>; expected_objective: string }>(
      "../fixtures/phase0/c13/H/goal-create-read-across-restart/input.json"
    );
    const store = new JsonSnapshotKernelStore();
    const goals = createGoalLight(store);

    const created = goals.createGoal(fixture.goal);
    expect(created.ok).toBe(true);

    const restarted = createGoalLight(JsonSnapshotKernelStore.fromJson(store.toJson()));
    const read = restarted.readGoal("user-a", "goal-vn");

    expect(read?.objective).toBe(fixture.expected_objective);
    expect(read?.objective).toBe("Gia hạn giấy phép lái xe cho mẹ");
    expect(read?.blocked_by).toEqual(["goal-docs"]);
    expect(read?.relates_to).toEqual([{ kind: "parent", goal_id: "goal-family-admin" }]);
    expect(read?.schema_version).toBe("goal-light.v1");
  });

  it("R illegal-lifecycle-transition-refused returns a named typed error", () => {
    const fixture = readFixture<{ goal: Record<string, unknown>; next_status: "executing"; expected_code: string }>(
      "../fixtures/phase0/c13/R/illegal-lifecycle-transition-refused/input.json"
    );
    const goals = createGoalLight(new JsonSnapshotKernelStore());

    expect(goals.createGoal(fixture.goal).ok).toBe(true);
    const result = goals.updateStatus("user-a", "goal-done", fixture.next_status);

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.errors[0]?.code).toBe(fixture.expected_code);
  });

  it("R cross-user-goal-read-denied leaks zero records through every read surface", () => {
    const fixture = readFixture<{ goal: Record<string, unknown>; blocked: Record<string, unknown> }>(
      "../fixtures/phase0/c13/R/cross-user-goal-read-denied/input.json"
    );
    const goals = createGoalLight(new JsonSnapshotKernelStore());

    expect(goals.createGoal(fixture.goal).ok).toBe(true);
    expect(goals.createGoal(fixture.blocked).ok).toBe(true);

    expect(goals.readGoal("user-b", "goal-a-private")).toBeNull();
    expect(goals.listGoals("user-b").map((goal) => goal.id)).not.toContain("goal-a-private");
    expect(goals.unblocks("user-b", "goal-a-private")).toEqual([]);
    expect(goals.readActionable("user-b").map((goal) => goal.id)).not.toContain("goal-a-private");
  });

  it("M malformed-goal-record-rejected, including pack goal-template violations", () => {
    const fixture = readFixture<{
      malformed_goal: Record<string, unknown>;
      governed_goal: Record<string, unknown>;
      expected_invalid_code: string;
      expected_template_code: string;
      templates: GoalTemplatesDeclaration;
    }>("../fixtures/phase0/c13/M/malformed-goal-record-rejected/input.json");

    const malformed = createGoalLight(new JsonSnapshotKernelStore()).createGoal(fixture.malformed_goal);
    expect(malformed.ok).toBe(false);
    expect(malformed.ok ? null : malformed.errors[0]?.code).toBe(fixture.expected_invalid_code);

    const governed = createGoalLight(new JsonSnapshotKernelStore(), { goalTemplates: fixture.templates });
    const templateRejected = governed.createGoal(fixture.governed_goal);
    expect(templateRejected.ok).toBe(false);
    expect(templateRejected.ok ? null : templateRejected.errors[0]?.code).toBe(fixture.expected_template_code);
    expect(governed.listGoals("user-a")).toEqual([]);
  });

  it("R pack-governed undeclared transitions and relation shapes are refused", () => {
    const templates: GoalTemplatesDeclaration = {
      templates: { renewal: { fields: ["objective"] } },
      allowed_transitions: ["decoded->ready"],
      relation_shapes: ["blocked_by"]
    };
    const goals = createGoalLight(new JsonSnapshotKernelStore(), { goalTemplates: templates });

    const created = goals.createGoal({
      id: "goal-pack",
      user_id: "user-a",
      objective: "Theo dõi hồ sơ gia hạn",
      template_id: "renewal"
    });
    expect(created.ok).toBe(true);

    const transition = goals.updateStatus("user-a", "goal-pack", "blocked");
    expect(transition.ok).toBe(false);
    expect(transition.ok ? null : transition.errors[0]?.code).toBe("undeclared-goal-transition");

    const relation = goals.addRelation("user-a", "goal-pack", { kind: "parent", goal_id: "goal-parent" });
    expect(relation.ok).toBe(false);
    expect(relation.ok ? null : relation.errors[0]?.code).toBe("undeclared-goal-relation");
  });

  it("I replayed-create-single-record stores one id-keyed goal", () => {
    const fixture = readFixture<{ goal: Record<string, unknown>; expected_count: number }>(
      "../fixtures/phase0/c13/I/replayed-create-single-record/input.json"
    );
    const goals = createGoalLight(new JsonSnapshotKernelStore());

    const first = goals.createGoal(fixture.goal);
    const replay = goals.createGoal(fixture.goal);

    expect(first.ok).toBe(true);
    expect(replay.ok).toBe(true);
    expect(goals.listGoals("user-a")).toHaveLength(fixture.expected_count);
  });

  it("S blocker-completion-surfaces-dependent-after-restart derives unblocks from stored blocked_by", () => {
    const fixture = readFixture<{ blocker: Record<string, unknown>; dependent: Record<string, unknown> }>(
      "../fixtures/phase0/c13/S/blocker-completion-surfaces-dependent-after-restart/input.json"
    );
    const store = new JsonSnapshotKernelStore();
    const goals = createGoalLight(store);

    expect(goals.createGoal(fixture.blocker).ok).toBe(true);
    expect(goals.createGoal(fixture.dependent).ok).toBe(true);
    expect(goals.readActionable("user-b").map((goal) => goal.id)).not.toContain("goal-dependent");

    const completed = goals.updateStatus("user-b", "goal-blocker", "completed");
    expect(completed.ok).toBe(true);

    const restarted = createGoalLight(JsonSnapshotKernelStore.fromJson(store.toJson()));
    expect(restarted.unblocks("user-b", "goal-blocker").map((goal) => goal.id)).toEqual(["goal-dependent"]);
    expect(restarted.readActionable("user-b").map((goal) => goal.id)).toContain("goal-dependent");
  });
});

