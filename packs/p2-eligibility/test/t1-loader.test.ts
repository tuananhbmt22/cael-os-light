import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import type { DomainPackRaw, PackLoadErrorCode } from "@cael/os-light";
import { p2EligibilityPack } from "../src/pack.js";

type VariantId = "template-trigger-misalign" | "no-derivation" | "undeclared-state-ref";

const expectedCodes: Record<VariantId, PackLoadErrorCode> = {
  "template-trigger-misalign": "template-trigger-misalign",
  "no-derivation": "no-derivation",
  "undeclared-state-ref": "undeclared-state-ref"
};

describe("T1 pack loader", () => {
  it("loads the P2 eligibility pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p2EligibilityPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe("p2-eligibility");
    expect(loaded.pack.raw.identity.archetype).toBe("external");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual(["p2_recommend"]);
  });

  it.each<VariantId>(["template-trigger-misalign", "no-derivation", "undeclared-state-ref"])(
    "refuses %s with the expected loader code",
    (variant) => {
      const loaded = loadPack(applyVariant(variant));
      expect(loaded.ok).toBe(false);
      if (loaded.ok) return;
      expect(loaded.error.code).toBe(expectedCodes[variant]);
    }
  );
});

function clonePack(): DomainPackRaw {
  return structuredClone(p2EligibilityPack);
}

function applyVariant(variant: VariantId): unknown {
  const pack = clonePack();
  if (variant === "template-trigger-misalign") {
    pack.notification_templates.N001!.trigger_id = "missing-trigger";
    return pack;
  }
  if (variant === "no-derivation") {
    pack.threshold_derivations = pack.threshold_derivations.filter(
      (derivation) => derivation.threshold_id !== "insurance_days_left_below"
    );
    return pack;
  }
  const gate = pack.gate_rule_set as { rules: { conditions: { field: string }[] }[] };
  gate.rules[0]!.conditions[0]!.field = "undeclared_vehicle_fact";
  return pack;
}

