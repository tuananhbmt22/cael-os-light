import { describe, expect, it } from "vitest";
import { createNotifyEngine, loadPack } from "@cael/os-light";
import { notificationMisalignmentDispositions, p2EligibilityPack } from "../src/pack.js";
import { fireP2Notifications } from "../src/turn.js";
import { syntheticStateForUser } from "../src/synthetic-corpus.js";

describe("T4 notification engine", () => {
  it("fires aligned deadline and state templates from synthetic fixtures", () => {
    const emissions = fireP2Notifications(
      syntheticStateForUser("SYN-ALL-SIGNALS"),
      { user_id: "SYN-ALL-SIGNALS", question: "notify" },
      "notify-all-signals"
    );
    expect(emissions.map((emission) => emission.template_id).sort()).toEqual(["N001", "N002", "N003", "N006"]);
  });

  it("fires fallback discovery and loyalty templates for healthy users", () => {
    const emissions = fireP2Notifications(
      syntheticStateForUser("SYN-HEALTHY"),
      { user_id: "SYN-HEALTHY", question: "notify" },
      "notify-healthy"
    );
    expect(emissions.map((emission) => emission.template_id).sort()).toEqual(["N004", "N005"]);
  });

  it("validates alignment at pack load and records source-copy dispositions", () => {
    const loaded = loadPack(p2EligibilityPack);
    expect(loaded.ok).toBe(true);
    const logs: unknown[] = [];
    const engine = createNotifyEngine(p2EligibilityPack, { log: (event) => logs.push(event) });
    expect(engine.fire("insurance_expiring", { vehicle_id: "SYN-V", dedupeKey: "alignment" })).toHaveLength(1);
    expect(logs).toEqual([]);
    expect(notificationMisalignmentDispositions.map((row) => row.id).sort()).toEqual([
      "docwallet-registration-copy",
      "insurance-never-activated-copy",
      "monthlypass-no-template"
    ]);
  });
});

