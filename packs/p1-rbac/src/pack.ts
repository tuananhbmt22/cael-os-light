import type { DomainPackRaw } from "@cael/os-light";
import { p1RbacRuleSet } from "./rbac-rule-set.js";
import { syntheticCorpus } from "./synthetic-corpus.js";

export const PACK_ID = "p1-rbac";
export const PACK_VERSION = "0.1.0";
export const PACK_IMAGE_SHA = "sha256:p1-rbac-20260705";

export const p1RbacPack: DomainPackRaw = {
  identity: {
    id: PACK_ID,
    version: PACK_VERSION,
    archetype: "internal",
    deployment: "A",
    image_sha: PACK_IMAGE_SHA
  },
  corpus: {
    units: syntheticCorpus,
    embeddingRecipe: { provider: "pack", name: "p1-rbac-atomic-fact-index" },
    index_recipe: {
      recipe_id: "p1-rbac-f9-atomic-facts",
      declared_fields: [
        "query",
        "document_id",
        "document_ids",
        "user_role",
        "user_department",
        "doc_department",
        "doc_classification",
        "retrievalConfidence",
        "permissionBoundaryProximity",
        "residualMetadataIntentConflict",
        "stepUpAction"
      ],
      atomic_fact_rules: [
        "Index section-level atomic facts, not shared document boilerplate.",
        "Keep classification vocabulary separate from protected document retrieval.",
        "Resolve all supporting document ids before gating; multi-doc permission denies if any source denies."
      ]
    }
  },
  gate_rule_set: p1RbacRuleSet,
  threshold_derivations: [
    {
      track_id: "p1-rbac",
      threshold_id: "low_retrieval_confidence_below",
      source_fields: ["retrievalConfidence", "query", "document_id"],
      candidate_ranges: ["0.30-0.70"],
      selected_value: 0.5,
      validation_fixture: { id: "synthetic-low-confidence-trigger", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Derived from the P1 F2 abstention fixture and field-prep residual policy."
    },
    {
      track_id: "p1-rbac",
      threshold_id: "permission_boundary_proximity_at_or_above",
      source_fields: ["permissionBoundaryProximity", "doc_classification", "user_role"],
      candidate_ranges: ["0.70-0.95"],
      selected_value: 0.8,
      validation_fixture: { id: "synthetic-restricted-boundary-trigger", green: true },
      public_scope: "public",
      copied_from: null,
      reviewer_attestation: "Derived from the Restricted-attempt and confidential-cross-dept synthetic battery."
    }
  ],
  state: {
    entity_schemas: {
      user: {
        fields: ["user_role", "user_department"],
        closed_vocabs: {
          user_role: ["Employee", "Manager", "Director", "Executive"],
          user_department: ["COMP", "HR", "FIN", "PROD", "ENG", "OPS", "LEGAL", "EXEC"]
        },
        privacy_tags: ["internal_identity"]
      },
      document: {
        fields: ["document_id", "document_ids", "doc_department", "doc_classification"],
        closed_vocabs: {
          doc_classification: ["Public", "Internal", "Confidential", "Restricted"],
          doc_department: ["COMP", "HR", "FIN", "PROD", "ENG", "OPS", "LEGAL", "EXEC"]
        },
        privacy_tags: ["document_metadata"]
      }
    },
    ownership_edges: [{ owner: "user", owns: ["user_role", "user_department"] }],
    event_schemas: {
      p1_turn: {
        fields: [
          "query",
          "document_id",
          "document_ids",
          "retrievalConfidence",
          "permissionBoundaryProximity",
          "residualMetadataIntentConflict",
          "stepUpAction"
        ]
      }
    },
    idempotency_keys: ["turn_id"],
    retention_tags: ["internal-demo"],
    privacy_tags: ["no-client-data-committed"],
    fixture_migrations: []
  },
  receipt_schemas: {
    p1_rbac_receipt: {
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
      permission: { visibility: "public" },
      document_id: { visibility: "public" }
    },
    eval_keys: ["permission", "document_id"],
    bindings: [
      {
        fn_name: "p1_answer",
        eval_key: "permission",
        surface_key: "permission",
        state_refs: ["user_role", "user_department", "document_id", "doc_department", "doc_classification"]
      },
      {
        fn_name: "p1_answer",
        eval_key: "document_id",
        surface_key: "document_id",
        state_refs: ["user_role", "user_department", "document_id", "doc_department", "doc_classification"]
      }
    ]
  },
  broken_key_claims: [],
  actions: [],
  trigger_config: {
    enabled: [
      "residual_metadata_intent_conflict",
      "permission_boundary_proximity",
      "low_retrieval_confidence",
      "step_up_action"
    ],
    lowRetrievalConfidenceBelow: 0.5,
    permissionBoundaryProximityAtOrAbove: 0.8
  }
};

export default p1RbacPack;
