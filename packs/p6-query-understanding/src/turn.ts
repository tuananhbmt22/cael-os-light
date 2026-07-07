import { receiptSchema, s, validate } from "@cael/os-light";
import type { AddressParts, Receipt, Schema } from "@cael/os-light";
import { understandQuery } from "./intent-rules.js";
import { createStubIntentModel } from "./query-model.js";
import type { IntentModel } from "./query-model.js";
import { PACK_ID, PACK_IMAGE_SHA } from "./pack.js";
import { syntheticPoiById } from "./synthetic-corpus.js";

export interface P6TurnRequest {
  userId?: string;
  sessionId?: string;
  turnId: string;
  query: string;
}

export interface P6StructuredOutput {
  normalized_query: string;
  intent: string;
  entities: string[];
  corrected_query: string;
  expanded_query: string;
  parsed_address: AddressParts;
  ambiguity: {
    detected: boolean;
    resolution: string;
  };
  rewritten_query: string;
}

export interface P6TurnResponse extends P6StructuredOutput {
  receipt: Receipt;
  modelCalls: number;
}

export interface P6TurnDeps {
  intentModel?: IntentModel;
}

const parsedAddressSchema: Schema<AddressParts> = s.object(
  {
    rawParts: s.array(s.string()),
    street: s.optional(s.string()),
    ward: s.optional(s.string()),
    district: s.optional(s.string()),
    city: s.optional(s.string())
  },
  "P6ParsedAddress"
) as Schema<AddressParts>;

export const p6StructuredOutputSchema: Schema<P6StructuredOutput> = s.object(
  {
    normalized_query: s.string(),
    intent: s.enumOf(["poi_lookup", "category_search", "address_navigation", "ambiguous"] as const),
    entities: s.array(s.string()),
    corrected_query: s.string(),
    expanded_query: s.string(),
    parsed_address: parsedAddressSchema,
    ambiguity: s.object(
      {
        detected: s.boolean(),
        resolution: s.string()
      },
      "P6Ambiguity"
    ),
    rewritten_query: s.string()
  },
  "P6StructuredOutput"
) as Schema<P6StructuredOutput>;

export function runP6Turn(_state: unknown, request: P6TurnRequest, deps: P6TurnDeps = {}): P6TurnResponse {
  const model = deps.intentModel ?? createStubIntentModel();
  let modelCalls = 0;
  const understood = understandQuery(request.query);
  let ambiguityResolution = understood.ambiguity.resolution;
  if (understood.ambiguity.detected && understood.ambiguity.candidates.length > 1) {
    const disambiguation = model.disambiguate({
      query: understood.normalized.normalized_query,
      candidates: understood.ambiguity.candidates
    });
    modelCalls += 1;
    ambiguityResolution = disambiguation.note;
  }

  const output: P6StructuredOutput = {
    normalized_query: understood.normalized.normalized_query,
    intent: understood.intent,
    entities: understood.entities,
    corrected_query: understood.normalized.corrected_query,
    expanded_query: understood.normalized.expanded_query,
    parsed_address: understood.normalized.parsed_address,
    ambiguity: {
      detected: understood.ambiguity.detected,
      resolution: ambiguityResolution
    },
    rewritten_query: understood.rewritten_query
  };
  const validatedOutput = validate(p6StructuredOutputSchema, output);
  if (!validatedOutput.ok) {
    throw new Error(`P6 structured output validation failed: ${validatedOutput.errors.map((error) => error.message).join("; ")}`);
  }

  const refused = understood.intent === "ambiguous";
  const receipt: Receipt = {
    kind: refused ? "refusal" : "answer",
    decision: refused ? "refuse" : "score",
    firing_rule: refused ? "p6_query_ambiguous" : "p6_query_understood",
    cited_ids: refused ? [] : understood.citedIds,
    evidence_refs: refused ? [] : understood.citedIds.map(evidenceForPoi),
    confidence: understood.confidence,
    escalation_used: false,
    pack_id: PACK_ID,
    image_sha: PACK_IMAGE_SHA,
    schema_version: "phase0.s3"
  };
  const validatedReceipt = validate(receiptSchema, receipt);
  if (!validatedReceipt.ok) {
    throw new Error(`P6 receipt validation failed: ${validatedReceipt.errors.map((error) => error.message).join("; ")}`);
  }

  return { ...validatedOutput.value, receipt: validatedReceipt.value, modelCalls };
}

function evidenceForPoi(id: string) {
  const poi = syntheticPoiById.get(id);
  return {
    id,
    source: "p6-synthetic-corpus",
    quote: poi ? `${poi.name} category=${poi.category}` : id
  };
}

