import type { DomainPackRaw, EligibilityRuleSetData } from "@cael/os-light";
import { p7PoiCorpus } from "./poi-corpus.js";
import { p7AttributeTaxonomy, p7RankingSignals } from "./taxonomy.js";

export const PACK_ID = "p7-semantic-ranking";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p7-semantic-ranking-20260707";

export const p7SemanticRankingRuleSet: EligibilityRuleSetData = {
  archetype: "B",
  cap: 1,
  thresholds: {},
  rules: [],
  fallback: {
    rule_id: "P7_STRUCTURAL_FALLBACK",
    recommendation: "P7 structural semantic-ranking fallback",
    priority: 0
  }
};

export const p7SemanticRankingPack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "external",
    deployment: "B",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: [
      ...p7PoiCorpus.map((poi) => ({
        id: poi.poi_id,
        source: "synthetic-p7-workbook:POI_Dataset",
        text: `${poi.poi_name} ${poi.category} ${poi.district} ${poi.attributes.join(";")}`
      })),
      ...p7AttributeTaxonomy.map((row) => ({
        id: `attribute:${row.attribute}`,
        source: "synthetic-p7-workbook:Attribute_Taxonomy",
        text: `${row.attribute} ${row.semantic_meaning} ${row.examples.join(";")}`
      })),
      ...p7RankingSignals.map((row) => ({
        id: `signal:${row.signal}`,
        source: "synthetic-p7-workbook:Ranking_Signals",
        text: `${row.signal} ${row.description} ${row.example_usage}`
      }))
    ],
    embeddingRecipe: { provider: "pack", name: "p7-deterministic-taxonomy-attribute-rank" },
    index_recipe: {
      recipe_id: "p7-semantic-ranking-taxonomy-signals",
      declared_fields: [
        "query",
        "normalized_query",
        "intent",
        "ranked_results",
        "poi_id",
        "poi_name",
        "score",
        "matched_attributes",
        "ranking_signals",
        "reasons",
        "place",
        "modelCalls"
      ],
      atomic_fact_rules: [
        "P7 ranking uses only synthetic workbook POIs, Attribute_Taxonomy rows, declared Ranking_Signals, and data-driven location aliases.",
        "The deterministic path performs no embedding or model call.",
        "review_signal and freshness_score are fallback/proxy signals because the workbook has no review text or freshness timestamps."
      ]
    }
  },
  gate_rule_set: p7SemanticRankingRuleSet,
  threshold_derivations: [],
  state: {
    entity_schemas: {
      semantic_rank_query: {
        fields: ["query", "userLocation", "limit"],
        closed_vocabs: {},
        privacy_tags: ["external_query_state"]
      }
    },
    ownership_edges: [{ owner: "semantic_rank_query", owns: ["query", "userLocation", "limit"] }],
    event_schemas: {
      p7_turn: {
        fields: ["normalized_query", "intent", "ranked_results", "receipt", "modelCalls"]
      }
    },
    idempotency_keys: ["turnId"],
    retention_tags: ["synthetic-fixtures"],
    privacy_tags: ["no-client-data-committed"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p7_semantic_ranking_receipt: {
      consumer: "showcase",
      schema_id: "phase0.s3.receipt",
      fields: ["decision", "firing_rule", "cited_ids", "evidence_refs", "confidence", "pack_id", "image_sha"]
    }
  },
  notification_templates: {},
  notification_triggers: {},
  adapters: {},
  scored_surfaces: {
    surfaces: {
      ranked_results: { visibility: "public" }
    },
    eval_keys: ["ranked_results"],
    bindings: [
      {
        fn_name: "p7_rank",
        eval_key: "ranked_results",
        surface_key: "ranked_results",
        state_refs: ["query", "userLocation", "limit"]
      }
    ]
  },
  broken_key_claims: [],
  actions: []
};

export default p7SemanticRankingPack;
