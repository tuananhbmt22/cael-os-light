import { describe, expect, it } from "vitest";
import { EntityStore, EventLedger, IdempotencyGuard, InMemoryKernelStore, s } from "../../src/index.js";

describe("state-kernel", () => {
  it("EntityStore.put rejects schema-violating entities without storing them", () => {
    const store = new EntityStore(s.object({ status: s.enumOf(["open", "closed"] as const) }, "Ticket"));

    const result = store.put("user-a", "ticket-1", { status: "bad" });

    expect(result.ok).toBe(false);
    expect(store.get("user-a", "ticket-1")).toBeNull();
  });

  it("IdempotencyGuard.once runs a replayed append once and returns the first outcome", () => {
    const kernelStore = new InMemoryKernelStore();
    const eventLedger = new EventLedger(s.object({ type: s.string() }, "Event"), kernelStore);
    const guard = new IdempotencyGuard(kernelStore);
    let runs = 0;

    const first = guard.once("user-a", "event-1", () => {
      runs += 1;
      return eventLedger.append("user-a", { type: "created" });
    });
    const second = guard.once("user-a", "event-1", () => {
      runs += 1;
      return eventLedger.append("user-a", { type: "created-again" });
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(runs).toBe(1);
    expect(eventLedger.read("user-a")).toHaveLength(1);
    expect(first.ok && second.ok ? second.value.seq : 0).toBe(first.ok ? first.value.seq : -1);
  });
});
