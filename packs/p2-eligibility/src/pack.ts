import type { DomainPackRaw } from "@cael/os-light";
import {
  ACTIVE_STATUS,
  eligibilityThresholdIds,
  p2EligibilityRuleSet
} from "./eligibility-rule-set.js";
import { syntheticEligibilityUnits } from "./synthetic-corpus.js";

export const PACK_ID = "p2-eligibility";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p2-eligibility-20260705";

export const notificationMisalignmentDispositions = [
  {
    id: "monthlypass-no-template",
    disposition: "MONTHLYPASS has no template in v1; it remains recommendation-only."
  },
  {
    id: "docwallet-registration-copy",
    disposition: "N003 copy covers both registration and inspection document-wallet deadlines."
  },
  {
    id: "insurance-never-activated-copy",
    disposition: "N001 copy covers activation as well as renewal for civil liability insurance."
  }
] as const;

export const p2EligibilityPack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "external",
    deployment: "B",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: syntheticEligibilityUnits,
    embeddingRecipe: { provider: "pack", name: "p2-eligibility-state-rule-index" },
    index_recipe: {
      recipe_id: "p2-eligibility-fix-a-state-rules",
      declared_fields: [
        "user_id",
        "wallet_status",
        "monthly_toll_transactions",
        "vehicle_id",
        "vehicle_age_years",
        "insurance_days_left",
        "inspection_days_left",
        "registration_days_left",
        "roadside_status",
        "civil_liability_status",
        "frequent_route",
        "frequent_route_present",
        "question",
        "recommendation",
        "firing_rule",
        "fallback_used"
      ],
      atomic_fact_rules: [
        "Recommendation is a deterministic function of user and vehicle state.",
        "Per-vehicle conditions must hold on the same vehicle before unioning across vehicles.",
        "No raw client workbook rows are committed; real rows stay under the gitignored data directory."
      ]
    }
  },
  gate_rule_set: p2EligibilityRuleSet,
  threshold_derivations: [
    {
      track_id: PACK_ID,
      threshold_id: eligibilityThresholdIds.vehicleAgeYearsAtLeast,
      source_fields: ["vehicle_age_years"],
      candidate_ranges: ["3"],
      selected_value: 3,
      validation_fixture: { id: "synthetic-roadside-age-green", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Locked by agreement section 5b FIX-A roadside rule; no km or segment predicates."
    },
    {
      track_id: PACK_ID,
      threshold_id: eligibilityThresholdIds.insuranceDaysLeftBelow,
      source_fields: ["insurance_days_left"],
      candidate_ranges: ["30"],
      selected_value: 30,
      validation_fixture: { id: "synthetic-insurance-days-green", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Locked by the SVC002 civil-liability deadline signal."
    },
    {
      track_id: PACK_ID,
      threshold_id: eligibilityThresholdIds.inspectionDaysLeftBelow,
      source_fields: ["inspection_days_left"],
      candidate_ranges: ["45"],
      selected_value: 45,
      validation_fixture: { id: "synthetic-inspection-days-green", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Locked by agreement section 5b; do not widen inspection to chase hidden rows."
    },
    {
      track_id: PACK_ID,
      threshold_id: eligibilityThresholdIds.registrationDaysLeftAtMost,
      source_fields: ["registration_days_left"],
      candidate_ranges: ["60"],
      selected_value: 60,
      validation_fixture: { id: "synthetic-registration-days-green", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Locked at 60 despite the under-determined public registration window."
    },
    {
      track_id: PACK_ID,
      threshold_id: eligibilityThresholdIds.monthlyTollTransactionsAtLeast,
      source_fields: ["monthly_toll_transactions"],
      candidate_ranges: ["30"],
      selected_value: 30,
      validation_fixture: { id: "synthetic-monthly-pass-green", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Locked by the frequent-route monthly-pass rule."
    }
  ],
  state: {
    entity_schemas: {
      user: {
        fields: ["user_id", "wallet_status", "monthly_toll_transactions"],
        closed_vocabs: {
          wallet_status: [ACTIVE_STATUS, "Chưa kích hoạt", "Sắp hết hạn"]
        },
        privacy_tags: ["external_user_state"]
      },
      vehicle: {
        fields: [
          "vehicle_id",
          "user_id",
          "vehicle_age_years",
          "insurance_days_left",
          "inspection_days_left",
          "registration_days_left",
          "roadside_status",
          "civil_liability_status",
          "frequent_route",
          "frequent_route_present"
        ],
        closed_vocabs: {
          roadside_status: [ACTIVE_STATUS, "Chưa kích hoạt", "Sắp hết hạn"],
          civil_liability_status: [ACTIVE_STATUS, "Chưa kích hoạt", "Sắp hết hạn"]
        },
        privacy_tags: ["external_vehicle_state"]
      }
    },
    ownership_edges: [{ owner: "user", owns: ["user_id", "wallet_status", "monthly_toll_transactions"] }],
    event_schemas: {
      p2_turn: {
        fields: ["question", "recommendation", "firing_rule", "fallback_used"]
      }
    },
    idempotency_keys: ["turn_id"],
    retention_tags: ["synthetic-fixtures"],
    privacy_tags: ["no-client-data-committed"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p2_eligibility_receipt: {
      consumer: "showcase",
      schema_id: "phase0.s3.receipt",
      fields: ["decision", "firing_rule", "cited_ids", "confidence", "pack_id", "image_sha"]
    }
  },
  notification_templates: {
    N001: {
      trigger_id: "insurance_expiring",
      body: "Civil liability insurance for {{vehicle_id}} needs activation or renewal support."
    },
    N002: {
      trigger_id: "roadside_recommendation",
      body: "Roadside assistance is recommended for {{vehicle_id}} based on vehicle age and inactive coverage."
    },
    N003: {
      trigger_id: "inspection_due",
      body: "Review registration or inspection deadlines for {{vehicle_id}} in the vehicle document wallet."
    },
    N004: {
      trigger_id: "service_discovery",
      body: "Show relevant VETC service discovery options for {{user_id}}."
    },
    N005: {
      trigger_id: "loyalty_offer",
      body: "Show My Loyalty options for {{user_id}}."
    },
    N006: {
      trigger_id: "wallet_activation",
      body: "Prompt {{user_id}} to activate bank linking or the VETC wallet."
    }
  },
  notification_triggers: {
    insurance_expiring: { template_id: "N001", event: "insurance_expiring" },
    roadside_recommendation: { template_id: "N002", event: "roadside_recommendation" },
    inspection_due: { template_id: "N003", event: "inspection_due" },
    service_discovery: { template_id: "N004", event: "service_discovery" },
    loyalty_offer: { template_id: "N005", event: "loyalty_offer" },
    wallet_activation: { template_id: "N006", event: "wallet_activation" }
  },
  adapters: {},
  scored_surfaces: {
    surfaces: {
      recommendation: { visibility: "public" }
    },
    eval_keys: ["recommendation"],
    bindings: [
      {
        fn_name: "p2_recommend",
        eval_key: "recommendation",
        surface_key: "recommendation",
        state_refs: [
          "user_id",
          "wallet_status",
          "monthly_toll_transactions",
          "vehicle_id",
          "vehicle_age_years",
          "insurance_days_left",
          "inspection_days_left",
          "registration_days_left",
          "roadside_status",
          "civil_liability_status",
          "frequent_route",
          "frequent_route_present"
        ]
      }
    ]
  },
  broken_key_claims: [],
  actions: []
};

export default p2EligibilityPack;

