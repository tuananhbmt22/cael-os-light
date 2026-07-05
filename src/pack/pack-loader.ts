import { buildRuleSet, GateRuleSetValidationError } from "../gate/gate-engine.js";
import type { EligibilityRuleSetData, OpenWorldRuleSetData } from "../gate/rule-set-schema.js";
import type { CorpusScope } from "../ground/ground.js";
import type { TriggerConfig } from "../graded-cooper/graded-cooper.js";
import { validate } from "../validate/structured-output.js";
import { domainPackSchema } from "./pack-schema.js";
import type { DomainPackRaw, ThresholdDerivation } from "./pack-schema.js";

export type PackLoadErrorCode =
  | "invalid-pack"
  | "invalid-gate-ruleset"
  | "no-derivation"
  | "foreign-derivation"
  | "red-derivation-fixture"
  | "undeclared-state-ref"
  | "template-trigger-misalign"
  | "undeclared-scored-surface"
  | "evidence-free-broken-key-claim";

export interface PackLoadError {
  code: PackLoadErrorCode;
  path: string;
  message: string;
}

export interface LoadedPack {
  packId: string;
  version: string;
  imageSha: string;
  gateRuleSet: unknown;
  corpus: CorpusScope;
  triggerConfig?: TriggerConfig | undefined;
  raw: DomainPackRaw;
}

export type PackLoadResult = { ok: true; pack: LoadedPack } | { ok: false; error: PackLoadError };

export interface PackRegistry {
  packsById: Map<string, LoadedPack>;
}

export function createPackRegistry(): PackRegistry {
  return { packsById: new Map() };
}

export function loadPack(raw: unknown): PackLoadResult {
  const parsed = validate(domainPackSchema, raw);
  if (!parsed.ok) {
    const first = parsed.errors[0];
    return failure("invalid-pack", first?.path ?? "$", first?.message ?? "pack schema validation failed");
  }

  const pack = parsed.value;
  const gateError = validateGateRuleSet(pack.gate_rule_set);
  if (gateError) return gateError;

  const derivationError = validateThresholdDerivations(pack);
  if (derivationError) return derivationError;

  const stateRefError = validateDeclaredStateRefs(pack);
  if (stateRefError) return stateRefError;

  const notifyError = validateTemplateTriggerAlignment(pack);
  if (notifyError) return notifyError;

  const scoredError = validateScoredSurfaces(pack);
  if (scoredError) return scoredError;

  const brokenKeyError = validateBrokenKeyClaims(pack);
  if (brokenKeyError) return brokenKeyError;

  const loaded: LoadedPack = {
    packId: pack.identity.id,
    version: pack.identity.version,
    imageSha: pack.identity.image_sha,
    gateRuleSet: pack.gate_rule_set,
    corpus: pack.corpus,
    raw: pack
  };
  if (pack.trigger_config !== undefined) loaded.triggerConfig = pack.trigger_config;
  return { ok: true, pack: loaded };
}

export function registerPack(registry: PackRegistry, pack: LoadedPack): PackRegistry {
  const existing = registry.packsById.get(pack.packId);
  if (existing?.version === pack.version) return registry;
  registry.packsById.set(pack.packId, pack);
  return registry;
}

export function routePack(registry: PackRegistry, id: string): LoadedPack | null {
  return registry.packsById.get(id) ?? null;
}

function validateGateRuleSet(ruleSet: unknown): PackLoadResult | null {
  try {
    buildRuleSet(ruleSet);
    return null;
  } catch (error) {
    if (error instanceof GateRuleSetValidationError) {
      return failure("invalid-gate-ruleset", "$.gate_rule_set", error.message);
    }
    const message = error instanceof Error ? error.message : "unknown gate validation failure";
    return failure("invalid-gate-ruleset", "$.gate_rule_set", message);
  }
}

function validateThresholdDerivations(pack: DomainPackRaw): PackLoadResult | null {
  const usedThresholds = collectUsedThresholds(pack.gate_rule_set);
  const derivations = new Map(pack.threshold_derivations.map((derivation) => [derivation.threshold_id, derivation]));
  for (const thresholdId of usedThresholds) {
    if (!derivations.has(thresholdId)) {
      return failure("no-derivation", "$.threshold_derivations", `missing derivation for threshold ${thresholdId}`);
    }
  }

  const declaredData = collectDeclaredDataFields(pack);
  for (let index = 0; index < pack.threshold_derivations.length; index += 1) {
    const derivation = pack.threshold_derivations[index];
    if (!derivation) continue;
    const path = `$.threshold_derivations[${index}]`;
    const foreign = derivation.source_fields.find((field) => !declaredData.has(field));
    if (foreign) {
      return failure("foreign-derivation", `${path}.source_fields`, `source field ${foreign} is not declared by this pack`);
    }
    if (derivation.copied_from !== null && (!nonEmpty(derivation.copied_from.reason) || !nonEmpty(derivation.reviewer_attestation))) {
      return failure("foreign-derivation", `${path}.copied_from`, "copied derivation requires reason and reviewer attestation");
    }
    if (!derivation.validation_fixture.green) {
      return failure("red-derivation-fixture", `${path}.validation_fixture`, derivation.validation_fixture.id);
    }
  }
  return null;
}

function validateDeclaredStateRefs(pack: DomainPackRaw): PackLoadResult | null {
  const declared = collectDeclaredStateFields(pack);
  const gateRefs = collectGateStateRefs(pack.gate_rule_set);
  for (const field of gateRefs) {
    if (!declared.has(field)) return failure("undeclared-state-ref", "$.gate_rule_set", `gate references undeclared state ${field}`);
  }
  for (let index = 0; index < pack.actions.length; index += 1) {
    const action = pack.actions[index];
    if (!action) continue;
    const missing = action.state_refs.find((field) => !declared.has(field));
    if (missing) return failure("undeclared-state-ref", `$.actions[${index}].state_refs`, `action references undeclared state ${missing}`);
  }
  for (let index = 0; index < pack.scored_surfaces.bindings.length; index += 1) {
    const binding = pack.scored_surfaces.bindings[index];
    if (!binding) continue;
    const missing = binding.state_refs.find((field) => !declared.has(field));
    if (missing) {
      return failure(
        "undeclared-state-ref",
        `$.scored_surfaces.bindings[${index}].state_refs`,
        `scored surface references undeclared state ${missing}`
      );
    }
  }
  return null;
}

function validateTemplateTriggerAlignment(pack: DomainPackRaw): PackLoadResult | null {
  for (const [templateId, template] of Object.entries(pack.notification_templates)) {
    const trigger = pack.notification_triggers[template.trigger_id];
    if (!trigger || trigger.template_id !== templateId) {
      return failure("template-trigger-misalign", `$.notification_templates.${templateId}`, template.trigger_id);
    }
  }
  for (const [triggerId, trigger] of Object.entries(pack.notification_triggers)) {
    const template = pack.notification_templates[trigger.template_id];
    if (!template || template.trigger_id !== triggerId) {
      return failure("template-trigger-misalign", `$.notification_triggers.${triggerId}`, trigger.template_id);
    }
  }
  return null;
}

function validateScoredSurfaces(pack: DomainPackRaw): PackLoadResult | null {
  const evalKeys = new Set(pack.scored_surfaces.eval_keys);
  for (let index = 0; index < pack.scored_surfaces.bindings.length; index += 1) {
    const binding = pack.scored_surfaces.bindings[index];
    if (!binding) continue;
    const path = `$.scored_surfaces.bindings[${index}]`;
    if (!pack.scored_surfaces.surfaces[binding.surface_key]) {
      return failure("undeclared-scored-surface", `${path}.surface_key`, binding.surface_key);
    }
    if (!evalKeys.has(binding.eval_key)) {
      return failure("undeclared-scored-surface", `${path}.eval_key`, binding.eval_key);
    }
  }
  return null;
}

function validateBrokenKeyClaims(pack: DomainPackRaw): PackLoadResult | null {
  for (let index = 0; index < pack.broken_key_claims.length; index += 1) {
    const claim = pack.broken_key_claims[index];
    if (!claim) continue;
    const path = `$.broken_key_claims[${index}]`;
    if (claim.corpus_evidence.length === 0) {
      return failure("evidence-free-broken-key-claim", `${path}.corpus_evidence`, "broken-key claim has no corpus evidence");
    }
    if (claim.score_disposition.action === "quarantine" && claim.score_disposition.visibility === "hidden") {
      return failure("evidence-free-broken-key-claim", `${path}.score_disposition`, "hidden rows cannot be quarantined");
    }
  }
  return null;
}

function collectUsedThresholds(ruleSet: unknown): Set<string> {
  const thresholds = new Set<string>();
  if (isRecord(ruleSet) && ruleSet.archetype === "B") {
    const typed = ruleSet as unknown as EligibilityRuleSetData;
    for (const thresholdId of Object.keys(typed.thresholds ?? {})) thresholds.add(thresholdId);
    for (const rule of typed.rules ?? []) {
      for (const thresholdId of rule.threshold_refs ?? []) thresholds.add(thresholdId);
      for (const condition of rule.conditions ?? []) {
        if (condition.threshold_id) thresholds.add(condition.threshold_id);
      }
    }
  }
  return thresholds;
}

function collectGateStateRefs(ruleSet: unknown): Set<string> {
  const fields = new Set<string>();
  if (!isRecord(ruleSet)) return fields;
  if (ruleSet.archetype === "B") {
    const typed = ruleSet as unknown as EligibilityRuleSetData;
    for (const rule of typed.rules ?? []) {
      for (const condition of rule.conditions ?? []) fields.add(condition.field);
    }
  }
  if (ruleSet.archetype === "C") {
    const typed = ruleSet as unknown as OpenWorldRuleSetData;
    for (const field of Object.keys(typed.fields ?? {})) fields.add(field);
    if (typed.category_axis?.field) fields.add(typed.category_axis.field);
  }
  return fields;
}

function collectDeclaredDataFields(pack: DomainPackRaw): Set<string> {
  const fields = new Set(pack.corpus.index_recipe.declared_fields);
  for (const field of collectDeclaredStateFields(pack)) fields.add(field);
  return fields;
}

function collectDeclaredStateFields(pack: DomainPackRaw): Set<string> {
  const fields = new Set<string>();
  for (const entity of Object.values(pack.state.entity_schemas)) {
    for (const field of entity.fields) fields.add(field);
  }
  for (const event of Object.values(pack.state.event_schemas)) {
    for (const field of event.fields) fields.add(field);
  }
  return fields;
}

function failure(code: PackLoadErrorCode, path: string, message: string): { ok: false; error: PackLoadError } {
  return { ok: false, error: { code, path, message } };
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
