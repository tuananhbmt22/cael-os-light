import { describe, expect, it } from "vitest";
import { createNotifyEngine, InMemoryKernelStore, loadPack } from "../src/index.js";
import type { DomainPackRaw, NotificationEmission, NotificationPackDeclarations, NotifyContext, NotifyLogEvent } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("S5 notify runtime", () => {
  it("renders trigger-bound templates with byte-exact Vietnamese text", () => {
    const fixture = readFixture<NotifyFixture>("../fixtures/phase0/s5/notify-demo/input.json");
    const expected = readFixture<{ emissions: NotificationEmission[] }>("../fixtures/phase0/s5/notify-demo/expected.json");
    const engine = createNotifyEngine(fixture.pack);

    expect(engine.fire("renewal_notice", fixture.ctx)).toEqual(expected.emissions);
  });

  it("dedupes replayed trigger plus dedupeKey emissions and exposes restart-safe state", () => {
    const fixture = readFixture<NotifyFixture>("../fixtures/phase0/s5/notify-demo/input.json");
    const store = new InMemoryKernelStore();
    const first = createNotifyEngine(fixture.pack, { store }).fire("renewal_notice", fixture.ctx);
    const replay = createNotifyEngine(fixture.pack, { store }).fire("renewal_notice", fixture.ctx);

    expect(first).toHaveLength(2);
    expect(replay).toEqual([]);
    expect(store.snapshot().idempotency.__notify__).toMatchObject({
      "renewal_audit:notice-001": first[0],
      "renewal_due:notice-001": first[1]
    });
  });

  it("arbitrates multi-trigger events into a stable non-duplicated order and calls the timing seam synchronously", () => {
    const fixture = readFixture<NotifyFixture>("../fixtures/phase0/s5/notify-demo/input.json");
    const calls: { emission: NotificationEmission; at: string }[] = [];
    const engine = createNotifyEngine(fixture.pack);

    const emissions = engine.fire("renewal_notice", fixture.ctx, {
      at: "2026-08-01T09:00:00Z",
      schedule: (emission, at) => calls.push({ emission, at })
    });

    expect(emissions.map((emission) => emission.trigger_id)).toEqual(["renewal_audit", "renewal_due"]);
    expect(new Set(emissions.map((emission) => `${emission.trigger_id}:${emission.dedupeKey}`)).size).toBe(2);
    expect(calls).toEqual(emissions.map((emission) => ({ emission, at: "2026-08-01T09:00:00Z" })));
  });

  it("degrades and logs instead of crashing when runtime declarations drift after load", () => {
    const fixture = readFixture<NotifyFixture>("../fixtures/phase0/s5/notify-demo/input.json");
    const logs: NotifyLogEvent[] = [];
    const engine = createNotifyEngine(fixture.pack, { log: (event) => logs.push(event) });

    const emissions = engine.fire("renewal_notice", fixture.ctx);

    expect(emissions).toHaveLength(2);
    expect(logs).toContainEqual(
      expect.objectContaining({
        code: "missing-template",
        trigger_id: "runtime_missing_template",
        template_id: "missing_template"
      })
    );
  });

  it("consumes c08 loaded pack declarations without duplicating the load-time alignment check", () => {
    const c08 = readFixture<{ pack: DomainPackRaw }>("../fixtures/phase0/c08/H/valid-pack-loads/input.json");
    const loaded = loadPack(c08.pack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const engine = createNotifyEngine(loaded.pack.raw);
    expect(engine.fire("renewal_notice", { dedupeKey: "c08-notice" })).toEqual([
      {
        trigger_id: "renewal_due",
        template_id: "renewal_ready",
        renderedBody: "Nhắc khách chuẩn bị gia hạn.",
        dedupeKey: "c08-notice"
      }
    ]);
  });
});

interface NotifyFixture {
  pack: NotificationPackDeclarations;
  ctx: NotifyContext;
}

