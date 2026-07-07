import type { DomainPackRaw, EligibilityRuleSetData } from "@cael/os-light";
import { syntheticCorpus } from "./autocomplete-corpus.js";

export const PACK_ID = "p9-autocomplete";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p9-autocomplete-20260707";

export const p9AutocompleteRuleSet: EligibilityRuleSetData = {
  archetype: "B",
  cap: 1,
  thresholds: {},
  rules: [],
  fallback: {
    rule_id: "P9_STRUCTURAL_FALLBACK",
    recommendation: "P9 structural autocomplete fallback",
    priority: 0
  }
};

export const p9AutocompletePack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "external",
    deployment: "B",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: syntheticCorpus,
    embeddingRecipe: { provider: "pack", name: "p9-autocomplete-synthetic-prefix-index" },
    index_recipe: {
      recipe_id: "p9-autocomplete-synthetic-prefix-rank",
      declared_fields: [
        "prefix",
        "recent_queries",
        "limit",
        "normalized_prefix",
        "corrections",
        "suggestions",
        "predicted_intent",
        "score",
        "reason",
        "firing_rule",
        "fallback_used",
        "secondBrainCalls",
        "id",
        "name",
        "aliases",
        "category",
        "popularity",
        "query_frequency"
      ],
      atomic_fact_rules: [
        "Autocomplete suggestions are computed from synthetic POI, category, abbreviation, and popular-query fields.",
        "Ranking is deterministic by match strength, synthetic popularity, synthetic query frequency, recent-query bonus, and explicit tie-breaks.",
        "No client search rows, live model calls, or live API keys are committed."
      ]
    }
  },
  gate_rule_set: p9AutocompleteRuleSet,
  threshold_derivations: [],
  state: {
    entity_schemas: {
      autocomplete_query: {
        fields: ["prefix", "recent_queries", "limit"],
        closed_vocabs: {},
        privacy_tags: ["external_query_state"]
      }
    },
    ownership_edges: [{ owner: "autocomplete_query", owns: ["prefix", "recent_queries", "limit"] }],
    event_schemas: {
      p9_turn: {
        fields: [
          "prefix",
          "normalized_prefix",
          "corrections",
          "suggestions",
          "predicted_intent",
          "score",
          "reason",
          "firing_rule",
          "fallback_used",
          "secondBrainCalls"
        ]
      }
    },
    idempotency_keys: ["turnId"],
    retention_tags: ["synthetic-fixtures"],
    privacy_tags: ["no-client-data-committed"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p9_autocomplete_receipt: {
      consumer: "showcase",
      schema_id: "phase0.s3.receipt",
      fields: ["decision", "firing_rule", "cited_ids", "confidence", "pack_id", "image_sha"]
    }
  },
  notification_templates: {},
  notification_triggers: {},
  adapters: {},
  scored_surfaces: {
    surfaces: {
      suggestions: { visibility: "public" }
    },
    eval_keys: ["suggestions"],
    bindings: [
      {
        fn_name: "p9_suggest",
        eval_key: "suggestions",
        surface_key: "suggestions",
        state_refs: ["prefix", "recent_queries", "limit"]
      }
    ]
  },
  broken_key_claims: [],
  actions: []
};

export default p9AutocompletePack;
