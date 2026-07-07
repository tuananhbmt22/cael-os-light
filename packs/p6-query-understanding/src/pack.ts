import type { DomainPackRaw } from "@cael/os-light";
import { p6QueryRuleSet } from "./intent-rules.js";
import { syntheticCorpus } from "./synthetic-corpus.js";

export const PACK_ID = "p6-query-understanding";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p6-query-understanding-20260707";

const declaredFields = [
  "query",
  "normalized_query",
  "intent",
  "entities",
  "category",
  "corrected_query",
  "expanded_query",
  "parsed_address",
  "ambiguity_detected",
  "ambiguity_resolution",
  "rewritten_query",
  "street",
  "ward",
  "district",
  "poi_id",
  "turn_id"
];

export const p6QueryUnderstandingPack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "external",
    deployment: "B",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: syntheticCorpus,
    embeddingRecipe: { provider: "pack", name: "p6-query-understanding-synthetic-poi-index" },
    index_recipe: {
      recipe_id: "p6-query-understanding-synthetic-vn-maps",
      declared_fields: declaredFields,
      atomic_fact_rules: [
        "Synthetic POIs model maps-search entity shape without client rows.",
        "Query understanding emits typed surfaces before any open-world ranking stage.",
        "Category and synonym vocabulary is declared in the archetype-C gate rule set."
      ]
    }
  },
  gate_rule_set: p6QueryRuleSet,
  threshold_derivations: [],
  state: {
    entity_schemas: {
      query: {
        fields: ["query", "normalized_query", "intent", "entities", "category"],
        closed_vocabs: {
          intent: ["poi_lookup", "category_search", "address_navigation", "ambiguous"],
          category: ["coffee_shop", "bank", "hospital", "shopping_mall", "restaurant", "fuel_station", "grocery", "market"]
        },
        privacy_tags: ["synthetic-query"]
      },
      poi: {
        fields: ["poi_id", "category", "street", "ward", "district"],
        closed_vocabs: {
          category: ["coffee_shop", "bank", "hospital", "shopping_mall", "restaurant", "fuel_station", "grocery", "market"]
        },
        privacy_tags: ["synthetic-poi"]
      }
    },
    ownership_edges: [{ owner: "query", owns: ["query", "normalized_query", "intent", "entities", "category"] }],
    event_schemas: {
      p6_turn: {
        fields: [
          "turn_id",
          "query",
          "normalized_query",
          "intent",
          "entities",
          "category",
          "corrected_query",
          "expanded_query",
          "parsed_address",
          "ambiguity_detected",
          "ambiguity_resolution",
          "rewritten_query",
          "street",
          "ward",
          "district",
          "poi_id"
        ]
      }
    },
    idempotency_keys: ["turn_id"],
    retention_tags: ["synthetic-fixtures"],
    privacy_tags: ["no-client-data-committed"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p6_query_receipt: {
      consumer: "showcase",
      schema_id: "phase0.s3.receipt",
      fields: ["decision", "firing_rule", "cited_ids", "confidence", "escalation_used", "pack_id", "image_sha"]
    }
  },
  notification_templates: {},
  notification_triggers: {},
  adapters: {},
  scored_surfaces: {
    surfaces: {
      normalized_query: { visibility: "public" },
      intent: { visibility: "public" },
      entities: { visibility: "public" }
    },
    eval_keys: ["normalized_query", "intent", "entities"],
    bindings: [
      {
        fn_name: "p6_answer",
        eval_key: "normalized_query",
        surface_key: "normalized_query",
        state_refs: ["query", "normalized_query", "intent", "entities", "category"]
      },
      {
        fn_name: "p6_answer",
        eval_key: "intent",
        surface_key: "intent",
        state_refs: ["query", "normalized_query", "intent", "entities", "category"]
      },
      {
        fn_name: "p6_answer",
        eval_key: "entities",
        surface_key: "entities",
        state_refs: ["query", "normalized_query", "intent", "entities", "category"]
      }
    ]
  },
  broken_key_claims: [],
  actions: []
};

export default p6QueryUnderstandingPack;

