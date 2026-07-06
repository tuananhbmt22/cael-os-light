import { describe, expect, it } from "vitest";
import { loadPack } from "@cael/os-light";
import type { DomainPackRaw, PackLoadErrorCode } from "@cael/os-light";
import { p1RbacPack } from "../src/pack.js";
import { readJson } from "./helpers.js";

type VariantId =
  | "no-derivation"
  | "foreign-derivation"
  | "red-derivation-fixture"
  | "undeclared-state-ref"
  | "template-trigger-misalign"
  | "undeclared-scored-surface"
  | "evidence-free-broken-key-claim"
  | "invalid-pack"
  | "invalid-gate-ruleset";

describe("T1 pack loader", () => {
  it("loads the P1 pack through the installed @cael/os-light package", () => {
    const loaded = loadPack(p1RbacPack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.pack.packId).toBe("p1-rbac");
    expect(loaded.pack.raw.scored_surfaces.bindings.map((binding) => binding.fn_name)).toEqual(["p1_answer", "p1_answer"]);
  });

  it.each<VariantId>([
    "no-derivation",
    "foreign-derivation",
    "red-derivation-fixture",
    "undeclared-state-ref",
    "template-trigger-misalign",
    "undeclared-scored-surface",
    "evidence-free-broken-key-claim",
    "invalid-pack",
    "invalid-gate-ruleset"
  ])("refuses %s with the expected loader code", (variant) => {
    const expected = readJson<{ variants: Record<VariantId, PackLoadErrorCode> }>(
      "../fixtures/synthetic/packs.malformed/expected-codes.json"
    ).variants[variant];
    const loaded = loadPack(applyVariant(variant));
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error.code).toBe(expected);
  });
});

function clonePack(): DomainPackRaw {
  return structuredClone(p1RbacPack);
}

function thresholdPack(): DomainPackRaw {
  const pack = clonePack();
  pack.gate_rule_set = {
    archetype: "B",
    cap: undefined,
    thresholds: { confidence_floor: 0.5 },
    rules: [
      {
        rule_id: "confidence-floor",
        recommendation: "review",
        priority: 1,
        conditions: [{ field: "retrievalConfidence", op: "gte", value: undefined, threshold_id: "confidence_floor" }],
        threshold_refs: ["confidence_floor"]
      }
    ],
    fallback: { rule_id: "fallback", recommendation: "refuse", priority: 0 }
  };
  pack.threshold_derivations = [
    {
      track_id: "p1-rbac",
      threshold_id: "confidence_floor",
      source_fields: ["retrievalConfidence"],
      candidate_ranges: ["0.3-0.7"],
      selected_value: 0.5,
      validation_fixture: { id: "confidence-floor-green", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Synthetic loader fixture."
    }
  ];
  return pack;
}

function applyVariant(variant: VariantId): unknown {
  if (variant === "invalid-pack") {
    const pack = clonePack() as Partial<DomainPackRaw>;
    delete pack.identity;
    return pack;
  }
  if (variant === "invalid-gate-ruleset") {
    const pack = clonePack();
    pack.gate_rule_set = { archetype: "Z" };
    return pack;
  }
  if (variant === "no-derivation") {
    const pack = thresholdPack();
    pack.threshold_derivations = [];
    return pack;
  }
  if (variant === "foreign-derivation") {
    const pack = thresholdPack();
    pack.threshold_derivations[0]!.source_fields = ["foreign_field"];
    return pack;
  }
  if (variant === "red-derivation-fixture") {
    const pack = thresholdPack();
    pack.threshold_derivations[0]!.validation_fixture.green = false;
    return pack;
  }
  if (variant === "undeclared-state-ref") {
    const pack = thresholdPack();
    const gate = pack.gate_rule_set as { rules: { conditions: { field: string }[] }[] };
    gate.rules[0]!.conditions[0]!.field = "undeclared_state_field";
    return pack;
  }
  const pack = clonePack();
  if (variant === "template-trigger-misalign") {
    pack.notification_templates = { p1_notice: { trigger_id: "missing-trigger", body: "Synthetic notice." } };
    return pack;
  }
  if (variant === "undeclared-scored-surface") {
    pack.scored_surfaces.bindings[0]!.surface_key = "missing_surface";
    return pack;
  }
  pack.broken_key_claims = [
    {
      case_id: "synthetic-broken-key",
      defect_type: "ambiguous_expected",
      corpus_evidence: [],
      competing_expected: "Allow",
      client_flag_text: "Synthetic evidence-free claim.",
      score_disposition: { action: "flag", visibility: "public" },
      reviewer: "p1-rbac-test"
    }
  ];
  return pack;
}
