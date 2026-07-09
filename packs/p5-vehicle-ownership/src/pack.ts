import type { DomainPackRaw } from "@cael/os-light";
import { p5VehicleOwnershipRuleSet } from "./rules.js";
import { syntheticCorpus } from "./synthetic-corpus.js";

export const PACK_ID = "p5-vehicle-ownership";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p5-vehicle-ownership-20260707";

const declaredFields = [
  "turn_id",
  "user_id",
  "vehicle_id",
  "query",
  "now",
  "task_type",
  "authorized_context",
  "privacy_refusal",
  "vehicle_context",
  "deadline_checks",
  "missing_documents",
  "knowledge_ids",
  "recommended_service_ids",
  "next_actions",
  "modelCalls"
];

export const p5VehicleOwnershipPack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "external",
    deployment: "A",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: syntheticCorpus,
    embeddingRecipe: { provider: "pack", name: "p5-vehicle-ownership-workbook-corpus" },
    index_recipe: {
      recipe_id: "p5-vehicle-ownership-workbook-state",
      declared_fields: declaredFields,
      atomic_fact_rules: [
        "Workbook users, vehicles, document metadata, knowledge rows, services, and mock APIs are transcribed as typed state.",
        "Deadline math uses request.now in UTC calendar days and never reads wall-clock time.",
        "Cross-user private asks refuse without vehicle context or data-existence evidence."
      ]
    }
  },
  gate_rule_set: p5VehicleOwnershipRuleSet,
  threshold_derivations: [],
  state: {
    entity_schemas: {
      user: {
        fields: ["user_id", "primary_vehicle_id", "user_segment", "preferred_channel", "main_concerns"],
        closed_vocabs: {},
        privacy_tags: ["synthetic-user-profile"]
      },
      vehicle: {
        fields: [
          "vehicle_id",
          "user_id",
          "vehicle_type",
          "license_plate_masked",
          "inspection_expiry",
          "civil_liability_expiry",
          "registration_expiry",
          "roadside_assistance_status"
        ],
        closed_vocabs: {
          vehicle_type: ["Car", "EV", "Motorbike"],
          roadside_assistance_status: ["Active", "Inactive"]
        },
        privacy_tags: ["synthetic-vehicle-profile"]
      },
      document: {
        fields: ["document_id", "vehicle_id", "document_type", "uploaded", "notes"],
        closed_vocabs: {
          document_type: ["Inspection", "Insurance", "Registration"],
          uploaded: ["Yes", "No"]
        },
        privacy_tags: ["document-metadata-only"]
      },
      service: {
        fields: ["service_id", "service_name", "context_to_recommend", "mock_integration"],
        closed_vocabs: {
          service_id: ["SVC001", "SVC002", "SVC003", "SVC004", "SVC005", "SVC006", "SVC007", "SVC008"]
        },
        privacy_tags: ["public-service-catalog"]
      }
    },
    ownership_edges: [
      { owner: "user", owns: ["primary_vehicle_id"] },
      { owner: "vehicle", owns: ["document_id", "deadline_checks"] }
    ],
    event_schemas: {
      p5_turn: {
        fields: declaredFields
      }
    },
    idempotency_keys: ["turn_id"],
    retention_tags: ["synthetic-fixtures"],
    privacy_tags: ["no-live-vetc-data", "metadata-only-documents"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p5_vehicle_receipt: {
      consumer: "showcase",
      schema_id: "phase0.s3.receipt",
      fields: ["decision", "firing_rule", "cited_ids", "evidence_refs", "confidence", "escalation_used", "pack_id", "image_sha"]
    }
  },
  notification_templates: {},
  notification_triggers: {},
  adapters: {},
  scored_surfaces: {
    surfaces: {
      task_type: { visibility: "public" },
      authorized: { visibility: "public" },
      primary_check: { visibility: "public" }
    },
    eval_keys: ["task_type", "authorized", "primary_check"],
    bindings: [
      {
        fn_name: "p5_answer",
        eval_key: "task_type",
        surface_key: "task_type",
        state_refs: ["query", "user_id", "vehicle_id", "task_type"]
      },
      {
        fn_name: "p5_answer",
        eval_key: "authorized",
        surface_key: "authorized",
        state_refs: ["user_id", "vehicle_id", "authorized_context", "privacy_refusal"]
      },
      {
        fn_name: "p5_answer",
        eval_key: "primary_check",
        surface_key: "primary_check",
        state_refs: ["deadline_checks", "missing_documents", "knowledge_ids", "recommended_service_ids"]
      }
    ]
  },
  broken_key_claims: [],
  actions: [
    { action_id: "create_reminder", state_refs: ["deadline_checks", "next_actions"] },
    { action_id: "renew_insurance", state_refs: ["civil_liability_expiry", "next_actions"] },
    { action_id: "activate_roadside", state_refs: ["roadside_assistance_status", "recommended_service_ids"] },
    { action_id: "upload_document_metadata", state_refs: ["missing_documents"] }
  ]
};

export default p5VehicleOwnershipPack;
