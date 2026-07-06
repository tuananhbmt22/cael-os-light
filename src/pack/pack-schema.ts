import type { CorpusScope } from "../ground/ground.js";
import type { TriggerConfig } from "../graded-cooper/graded-cooper.js";
import { s } from "../validate/structured-output.js";
import type { Schema } from "../validate/structured-output.js";

export type PackIdentityArchetype = "internal" | "external";
export type PackDeployment = "A" | "B";
export type PackVisibility = "public" | "hidden";

export interface PackIdentity {
  id: string;
  version: string;
  archetype: PackIdentityArchetype;
  deployment: PackDeployment;
  image_sha: string;
}

export interface IndexRecipe {
  recipe_id: string;
  declared_fields: string[];
  atomic_fact_rules: string[];
}

export interface PackCorpus extends CorpusScope {
  index_recipe: IndexRecipe;
}

export interface ThresholdValidationFixture {
  id: string;
  green: boolean;
}

export interface ThresholdCopiedFrom {
  track: string;
  reason?: string | undefined;
}

export interface ThresholdDerivation {
  track_id: string;
  threshold_id: string;
  source_fields: string[];
  candidate_ranges: string[];
  selected_value: number;
  validation_fixture: ThresholdValidationFixture;
  public_scope: PackVisibility;
  copied_from: ThresholdCopiedFrom | null;
  reviewer_attestation: string;
}

export interface EntitySchemaDeclaration {
  fields: string[];
  closed_vocabs: Record<string, string[]>;
  privacy_tags: string[];
}

export interface OwnershipEdge {
  owner: string;
  owns: string[];
}

export interface EventSchemaDeclaration {
  fields: string[];
}

export interface GoalTemplatesDeclaration {
  templates: Record<string, { fields: string[] }>;
  allowed_transitions: string[];
  relation_shapes: string[];
}

export interface StateDeclarations {
  entity_schemas: Record<string, EntitySchemaDeclaration>;
  ownership_edges: OwnershipEdge[];
  event_schemas: Record<string, EventSchemaDeclaration>;
  idempotency_keys: string[];
  retention_tags: string[];
  privacy_tags: string[];
  fixture_migrations: string[];
  goal_templates?: GoalTemplatesDeclaration | undefined;
}

export interface ReceiptSchemaDeclaration {
  consumer: string;
  schema_id: string;
  fields: string[];
}

export interface NotificationTemplateDeclaration {
  trigger_id: string;
  body: string;
}

export interface NotificationTriggerDeclaration {
  template_id: string;
  event: string;
}

export interface AdapterDeclaration {
  baseUrl: string;
  bearer_provider: string;
  headers: Record<string, string>;
  response_envelope: string;
  otp_hooks: string[];
  org_scope: string;
}

export interface ScoredSurfaceDeclaration {
  visibility: PackVisibility;
}

export interface ScoredSurfaceBinding {
  fn_name: string;
  eval_key: string;
  surface_key: string;
  state_refs: string[];
}

export interface ScoredSurfacesDeclaration {
  surfaces: Record<string, ScoredSurfaceDeclaration>;
  eval_keys: string[];
  bindings: ScoredSurfaceBinding[];
}

export interface BrokenKeyScoreDisposition {
  action: "quarantine" | "flag";
  visibility: PackVisibility;
}

export interface BrokenKeyClaim {
  case_id: string;
  defect_type: string;
  corpus_evidence: string[];
  competing_expected: string;
  client_flag_text: string;
  score_disposition: BrokenKeyScoreDisposition;
  reviewer: string;
}

export interface PackActionDeclaration {
  action_id: string;
  state_refs: string[];
}

export interface DomainPackRaw {
  identity: PackIdentity;
  corpus: PackCorpus;
  gate_rule_set: unknown;
  threshold_derivations: ThresholdDerivation[];
  state: StateDeclarations;
  receipt_schemas: Record<string, ReceiptSchemaDeclaration>;
  notification_templates: Record<string, NotificationTemplateDeclaration>;
  notification_triggers: Record<string, NotificationTriggerDeclaration>;
  adapters: Record<string, AdapterDeclaration>;
  scored_surfaces: ScoredSurfacesDeclaration;
  broken_key_claims: BrokenKeyClaim[];
  actions: PackActionDeclaration[];
  trigger_config?: TriggerConfig | undefined;
  rubric?: { rubric_id: string; criteria: string[] } | undefined;
  parser_plugins?: string[] | undefined;
}

const unknownSchema: Schema<unknown> = {
  name: "unknown",
  validate(input: unknown) {
    return { ok: true, value: input };
  }
};

const corpusUnitSchema = s.object(
  {
    id: s.string(),
    source: s.string(),
    text: s.optional(s.string()),
    facts: s.optional(s.array(s.string())),
    confidence: s.optional(s.number()),
    polarity: s.optional(s.enumOf(["positive", "negative"])),
    scope: s.optional(s.string()),
    numbers: s.optional(s.array(s.number())),
    keywords: s.optional(s.array(s.string())),
    corrupt: s.optional(s.boolean())
  },
  "PackCorpusUnit"
);

const embeddingRecipeSchema = s.object(
  {
    provider: s.literal("pack"),
    name: s.string()
  },
  "PackEmbeddingRecipe"
);

const thresholdCopiedFromSchema: Schema<ThresholdCopiedFrom> = s.object(
  {
    track: s.string(),
    reason: s.optional(s.string())
  },
  "ThresholdCopiedFrom"
);

const thresholdDerivationSchema: Schema<ThresholdDerivation> = s.object(
  {
    track_id: s.string(),
    threshold_id: s.string(),
    source_fields: s.array(s.string()),
    candidate_ranges: s.array(s.string()),
    selected_value: s.number(),
    validation_fixture: s.object(
      {
        id: s.string(),
        green: s.boolean()
      },
      "ThresholdValidationFixture"
    ),
    public_scope: s.enumOf(["public", "hidden"]),
    copied_from: s.union<ThresholdCopiedFrom | null>([thresholdCopiedFromSchema, s.literal(null)]),
    reviewer_attestation: s.string()
  },
  "ThresholdDerivation"
);

const entitySchemaDeclarationSchema: Schema<EntitySchemaDeclaration> = s.object(
  {
    fields: s.array(s.string()),
    closed_vocabs: s.record(s.array(s.string())),
    privacy_tags: s.array(s.string())
  },
  "EntitySchemaDeclaration"
);

const eventSchemaDeclarationSchema: Schema<EventSchemaDeclaration> = s.object(
  {
    fields: s.array(s.string())
  },
  "EventSchemaDeclaration"
);

const goalTemplatesDeclarationSchema: Schema<GoalTemplatesDeclaration> = s.object(
  {
    templates: s.record(s.object({ fields: s.array(s.string()) }, "GoalTemplateShape")),
    allowed_transitions: s.array(s.string()),
    relation_shapes: s.array(s.string())
  },
  "GoalTemplatesDeclaration"
);

const triggerConfigSchema = s.object(
  {
    enabled: s.array(
      s.enumOf([
        "low_retrieval_confidence",
        "permission_boundary_proximity",
        "step_up_action",
        "residual_metadata_intent_conflict"
      ])
    ),
    lowRetrievalConfidenceBelow: s.optional(s.number()),
    permissionBoundaryProximityAtOrAbove: s.optional(s.number())
  },
  "TriggerConfig"
) as unknown as Schema<TriggerConfig>;

export const domainPackSchema = s.object(
  {
    identity: s.object(
      {
        id: s.string(),
        version: s.string(),
        archetype: s.enumOf(["internal", "external"]),
        deployment: s.enumOf(["A", "B"]),
        image_sha: s.string()
      },
      "PackIdentity"
    ),
    corpus: s.object(
      {
        units: s.array(corpusUnitSchema),
        embeddingRecipe: s.optional(embeddingRecipeSchema),
        index_recipe: s.object(
          {
            recipe_id: s.string(),
            declared_fields: s.array(s.string()),
            atomic_fact_rules: s.array(s.string())
          },
          "IndexRecipe"
        )
      },
      "PackCorpus"
    ),
    gate_rule_set: unknownSchema,
    threshold_derivations: s.array(thresholdDerivationSchema),
    state: s.object(
      {
        entity_schemas: s.record(entitySchemaDeclarationSchema),
        ownership_edges: s.array(s.object({ owner: s.string(), owns: s.array(s.string()) }, "OwnershipEdge")),
        event_schemas: s.record(eventSchemaDeclarationSchema),
        idempotency_keys: s.array(s.string()),
        retention_tags: s.array(s.string()),
        privacy_tags: s.array(s.string()),
        fixture_migrations: s.array(s.string()),
        goal_templates: s.optional(goalTemplatesDeclarationSchema)
      },
      "StateDeclarations"
    ),
    receipt_schemas: s.record(
      s.object(
        {
          consumer: s.string(),
          schema_id: s.string(),
          fields: s.array(s.string())
        },
        "ReceiptSchemaDeclaration"
      )
    ),
    notification_templates: s.record(
      s.object(
        {
          trigger_id: s.string(),
          body: s.string()
        },
        "NotificationTemplateDeclaration"
      )
    ),
    notification_triggers: s.record(
      s.object(
        {
          template_id: s.string(),
          event: s.string()
        },
        "NotificationTriggerDeclaration"
      )
    ),
    adapters: s.record(
      s.object(
        {
          baseUrl: s.string(),
          bearer_provider: s.string(),
          headers: s.record(s.string()),
          response_envelope: s.string(),
          otp_hooks: s.array(s.string()),
          org_scope: s.string()
        },
        "AdapterDeclaration"
      )
    ),
    scored_surfaces: s.object(
      {
        surfaces: s.record(s.object({ visibility: s.enumOf(["public", "hidden"]) }, "ScoredSurfaceDeclaration")),
        eval_keys: s.array(s.string()),
        bindings: s.array(
          s.object(
            {
              fn_name: s.string(),
              eval_key: s.string(),
              surface_key: s.string(),
              state_refs: s.array(s.string())
            },
            "ScoredSurfaceBinding"
          )
        )
      },
      "ScoredSurfacesDeclaration"
    ),
    broken_key_claims: s.array(
      s.object(
        {
          case_id: s.string(),
          defect_type: s.string(),
          corpus_evidence: s.array(s.string()),
          competing_expected: s.string(),
          client_flag_text: s.string(),
          score_disposition: s.object(
            {
              action: s.enumOf(["quarantine", "flag"]),
              visibility: s.enumOf(["public", "hidden"])
            },
            "BrokenKeyScoreDisposition"
          ),
          reviewer: s.string()
        },
        "BrokenKeyClaim"
      )
    ),
    actions: s.array(s.object({ action_id: s.string(), state_refs: s.array(s.string()) }, "PackActionDeclaration")),
    trigger_config: s.optional(triggerConfigSchema),
    rubric: s.optional(s.object({ rubric_id: s.string(), criteria: s.array(s.string()) }, "RubricDeclaration")),
    parser_plugins: s.optional(s.array(s.string()))
  },
  "DomainPack"
) as unknown as Schema<DomainPackRaw>;
