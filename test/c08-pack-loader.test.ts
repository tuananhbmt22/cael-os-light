import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  createPackRegistry,
  loadPack,
  MemoryAuditSink,
  registerPack,
  routePack,
  runTurn,
  TurnOutcome
} from "../src/index.js";
import type { DomainPackRaw, PackLoadErrorCode, TurnInput } from "../src/index.js";
import { readFixture } from "./helpers.js";

type VariantId =
  | "no-derivation"
  | "foreign-derivation"
  | "red-derivation-fixture"
  | "template-trigger-misalign"
  | "undeclared-scored-surface"
  | "undeclared-state-ref"
  | "evidence-free-broken-key-claim";

describe("c08 pack loader", () => {
  it("H valid-pack-loads loads and produces an S3Pack superset consumed by runTurn", () => {
    const fixture = readFixture<{ pack: DomainPackRaw; turn: TurnInput }>(
      "../fixtures/phase0/c08/H/valid-pack-loads/input.json"
    );
    const loaded = loadPack(fixture.pack);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    expect(loaded.pack.packId).toBe("synthetic-eligibility-vn");
    expect(loaded.pack.imageSha).toBe("fixture-image-sha");
    expect(loaded.pack.gateRuleSet).toBe(fixture.pack.gate_rule_set);
    expect(loaded.pack.corpus.units.length).toBeGreaterThan(0);

    const result = runTurn(loaded.pack, fixture.turn, { auditSink: new MemoryAuditSink() });
    expect(result.outcome).toBe(TurnOutcome.Answer);
    expect(result.receipt.pack_id).toBe(loaded.pack.packId);
    expect(result.receipt.image_sha).toBe(loaded.pack.imageSha);
  });

  it.each<VariantId>([
    "no-derivation",
    "foreign-derivation",
    "red-derivation-fixture",
    "template-trigger-misalign",
    "undeclared-scored-surface",
    "undeclared-state-ref",
    "evidence-free-broken-key-claim"
  ])("R %s is refused with its named error", (variant) => {
    const fixture = readFixture<{ expected_code: PackLoadErrorCode }>(`../fixtures/phase0/c08/R/${variant}/input.json`);
    const pack = applyVariant(validPack(), variant);
    const loaded = loadPack(pack);
    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error.code).toBe(fixture.expected_code);
  });

  it("M unparseable-pack is refused instead of throw-crashing", () => {
    const raw = readFileSync(new URL("../fixtures/phase0/c08/M/unparseable-pack/input.json", import.meta.url), "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
    const loaded = loadPack(parsed);
    expect(loaded.ok).toBe(false);
  });

  it("I re-register-no-duplicate is idempotent for the same pack id and version", () => {
    const fixture = readFixture<{ expected_size: number }>(
      "../fixtures/phase0/c08/I/re-register-no-duplicate/input.json"
    );
    const loaded = loadPack(validPack());
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const registry = createPackRegistry();
    registerPack(registry, loaded.pack);
    registerPack(registry, loaded.pack);

    expect(registry.packsById.size).toBe(fixture.expected_size);
    expect(routePack(registry, loaded.pack.packId)?.version).toBe("1.0.0");
  });

  it("S pack-update-evicts-old-version replaces the routed pack", () => {
    const fixture = readFixture<{ old_version: string; new_version: string; expected_size: number }>(
      "../fixtures/phase0/c08/S/pack-update-evicts-old-version/input.json"
    );
    const first = loadPack(validPack());
    const secondPack = validPack();
    secondPack.identity.version = fixture.new_version;
    secondPack.corpus.units[0]!.facts = ["Bạn đủ điều kiện nhận ưu đãi vàng phiên bản 2."];
    const second = loadPack(secondPack);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    const registry = createPackRegistry();
    registerPack(registry, first.pack);
    expect(routePack(registry, first.pack.packId)?.version).toBe(fixture.old_version);
    registerPack(registry, second.pack);

    expect(registry.packsById.size).toBe(fixture.expected_size);
    expect(routePack(registry, first.pack.packId)?.version).toBe(fixture.new_version);
  });
});

function validPack(): DomainPackRaw {
  return structuredClone(readFixture<{ pack: DomainPackRaw }>("../fixtures/phase0/c08/H/valid-pack-loads/input.json").pack);
}

function applyVariant(pack: DomainPackRaw, variant: VariantId): DomainPackRaw {
  if (variant === "no-derivation") pack.threshold_derivations = [];
  if (variant === "foreign-derivation") pack.threshold_derivations[0]!.source_fields = ["foreign_public_score"];
  if (variant === "red-derivation-fixture") pack.threshold_derivations[0]!.validation_fixture.green = false;
  if (variant === "template-trigger-misalign") pack.notification_templates.renewal_ready!.trigger_id = "missing-trigger";
  if (variant === "undeclared-scored-surface") pack.scored_surfaces.bindings[0]!.eval_key = "missing-eval-key";
  if (variant === "undeclared-state-ref") {
    const ruleSet = pack.gate_rule_set as { rules: { conditions: { field: string }[] }[] };
    ruleSet.rules[0]!.conditions[0]!.field = "undeclared_state";
  }
  if (variant === "evidence-free-broken-key-claim") pack.broken_key_claims[0]!.corpus_evidence = [];
  return pack;
}
