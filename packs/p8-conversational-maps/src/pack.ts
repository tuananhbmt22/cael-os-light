import type { DomainPackRaw, EligibilityRuleSetData } from "@cael/os-light";
import { p8PoiCorpus } from "./corpus.js";
import { p8UserPreferences } from "./preferences.js";
import { p8ConversationScenarios } from "./scenarios.js";

export const PACK_ID = "p8-conversational-maps";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p8-conversational-maps-20260707";

export const p8ConversationalMapsRuleSet: EligibilityRuleSetData = {
  archetype: "B",
  cap: 1,
  thresholds: {},
  rules: [],
  fallback: {
    rule_id: "P8_STRUCTURED_MAP_ACTION_FALLBACK",
    recommendation: "P8 structured conversational map-action fallback",
    priority: 0
  }
};

export const p8ConversationalMapsPack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "external",
    deployment: "B",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: [
      ...p8PoiCorpus.map((poi) => ({
        id: poi.poi_id,
        source: poi.provenance,
        text: `${poi.poi_name} ${poi.category} ${poi.city} ${poi.district} ${poi.attributes.join(";")} ${poi.tags.join(";")}`
      })),
      ...p8UserPreferences.map((profile) => ({
        id: `profile:${profile.user_id}`,
        source: profile.provenance,
        text: `${profile.persona} ${profile.current_location} ${profile.preferences.join(";")} avoid=${profile.avoid.join(";")} budget=${profile.budget_level}`
      })),
      ...p8ConversationScenarios.map((scenario) => ({
        id: `scenario:${scenario.scenario_id}`,
        source: scenario.provenance,
        text: `${scenario.category} ${scenario.latest_user_message} ${scenario.required_map_action}`
      }))
    ],
    embeddingRecipe: { provider: "pack", name: "p8-deterministic-conversation-map-actions" },
    index_recipe: {
      recipe_id: "p8-conversational-maps-composed-p6-p7",
      declared_fields: [
        "message",
        "conversation_history",
        "intent",
        "assistant_response",
        "recommendations",
        "map_action",
        "clarification",
        "context_state",
        "receipt",
        "modelCalls"
      ],
      atomic_fact_rules: [
        "P8 imports P6 understandQuery for query normalization and base intent.",
        "P8 imports P7 evaluateP7RankingWithCorpus and injects the 80-row P8 POI corpus mapped to P7Poi.",
        "The deterministic gate scores structured intent, recommendation, map_action, clarification, and retained slot fields; modelCalls stays 0.",
        "P8 POI ids stay in the POI### namespace and no P7 corpus ids are reused."
      ]
    }
  },
  gate_rule_set: p8ConversationalMapsRuleSet,
  threshold_derivations: [],
  state: {
    entity_schemas: {
      p8_conversation_session: {
        fields: ["sessionId", "userId", "message", "conversation_history", "retained_slots", "userLocation"],
        closed_vocabs: {},
        privacy_tags: ["external_query_state"]
      }
    },
    ownership_edges: [{ owner: "p8_conversation_session", owns: ["conversation_history", "retained_slots"] }],
    event_schemas: {
      p8_turn: {
        fields: ["intent", "recommendations", "map_action", "clarification", "context_state", "receipt", "modelCalls"]
      }
    },
    idempotency_keys: ["turnId"],
    retention_tags: ["synthetic-fixtures"],
    privacy_tags: ["no-client-data-committed"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p8_conversational_maps_receipt: {
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
      intent: { visibility: "public" },
      recommendations: { visibility: "public" },
      map_action: { visibility: "public" },
      clarification: { visibility: "public" },
      context_state: { visibility: "public" }
    },
    eval_keys: ["intent", "recommendations", "map_action", "clarification", "context_state"],
    bindings: [
      {
        fn_name: "p8_turn",
        eval_key: "map_action",
        surface_key: "map_action",
        state_refs: ["message", "conversation_history", "userId", "userLocation"]
      }
    ]
  },
  broken_key_claims: [],
  actions: []
};

export default p8ConversationalMapsPack;
