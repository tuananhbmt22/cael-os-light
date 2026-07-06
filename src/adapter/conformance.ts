import { s } from "../validate/structured-output.js";
import {
  mapAdapterError,
  validateStructuredAdapterOutput,
  type AdapterErrorInput,
  type AdapterErrorOutcome,
  type AdapterEvent,
  type HeadAdapter,
  type HeadAdapterRequest,
  type HeadAdapterResponse,
  type ToolCall
} from "./head-adapter.js";

export interface ConformanceTurn {
  id: string;
  request: HeadAdapterRequest;
  expectedToolCalls: ToolCall[];
  expectedEvents: AdapterEvent[];
  expectedStructured: unknown;
}

export interface ConformanceErrorCase {
  input: AdapterErrorInput;
  expected: AdapterErrorOutcome;
}

export interface ConformanceTranscript {
  id: string;
  replayCount: number;
  turns: ConformanceTurn[];
  structuredFailureCase: HeadAdapterResponse;
  errorCases: ConformanceErrorCase[];
}

export type ConformanceFailureCode =
  | "envelope-drift"
  | "cache-prefix-hash-drift"
  | "structured-output-failure-missing"
  | "error-mapping-drift"
  | "receipt-equivalence-drift";

export interface ConformanceFailure {
  code: ConformanceFailureCode;
  path: string;
  message: string;
}

export interface ConformanceResult {
  ok: boolean;
  adapter: string;
  transcript: string;
  replayCount: number;
  failures: ConformanceFailure[];
}

const structuredReceiptSchema = s.object(
  {
    receipt: s.object(
      {
        kind: s.string(),
        decision: s.string(),
        firing_rule: s.string(),
        cited_ids: s.array(s.string()),
        pack_id: s.string()
      },
      "adapterReceipt"
    )
  },
  "adapterStructured"
);

export function runConformance(adapter: HeadAdapter, transcript: ConformanceTranscript): ConformanceResult {
  const failures: ConformanceFailure[] = [];
  const receiptsByTurn = new Map<string, string>();
  const replayCount = Math.max(1, transcript.replayCount);

  for (let replay = 0; replay < replayCount; replay += 1) {
    for (let turnIndex = 0; turnIndex < transcript.turns.length; turnIndex += 1) {
      const turn = transcript.turns[turnIndex];
      if (!turn) continue;
      const response = adapter.complete(turn.request);
      const path = `$.turns[${turnIndex}]`;

      if (!sameJson(response.toolCalls, turn.expectedToolCalls) || !sameJson(response.events, turn.expectedEvents)) {
        failures.push({
          code: "envelope-drift",
          path,
          message: `tool-call/event envelope drift on turn ${turn.id}`
        });
      }
      if (!sameJson(response.structured, turn.expectedStructured)) {
        failures.push({
          code: "receipt-equivalence-drift",
          path: `${path}.structured`,
          message: `structured receipt drift on turn ${turn.id}`
        });
      }

      const firstHash = adapter.cachePrefixHash(turn.request);
      const secondHash = adapter.cachePrefixHash(turn.request);
      if (firstHash !== secondHash) {
        failures.push({
          code: "cache-prefix-hash-drift",
          path: `${path}.cachePrefix`,
          message: `cache-prefix hash changed within replay for turn ${turn.id}`
        });
      }

      const receiptKey = `${turn.id}:${stableRequestKey(turn.request)}`;
      const receiptJson = stableJson(response.structured);
      const previous = receiptsByTurn.get(receiptKey);
      if (previous !== undefined && previous !== receiptJson) {
        failures.push({
          code: "receipt-equivalence-drift",
          path: `${path}.structured`,
          message: `same turn produced a non-equivalent receipt on replay ${replay}`
        });
      }
      receiptsByTurn.set(receiptKey, receiptJson);
    }
  }

  const structuredFailure = validateStructuredAdapterOutput(structuredReceiptSchema, transcript.structuredFailureCase);
  if (structuredFailure.ok || structuredFailure.failure.outcome !== "degrade") {
    failures.push({
      code: "structured-output-failure-missing",
      path: "$.structuredFailureCase",
      message: "invalid structured output did not degrade with a typed failure"
    });
  }

  for (let index = 0; index < transcript.errorCases.length; index += 1) {
    const errorCase = transcript.errorCases[index];
    if (!errorCase) continue;
    const mapped = mapAdapterError(errorCase.input);
    if (!sameJson(mapped, errorCase.expected)) {
      failures.push({
        code: "error-mapping-drift",
        path: `$.errorCases[${index}]`,
        message: `${errorCase.input.kind} did not map to ${errorCase.expected.outcome}`
      });
    }
  }

  return {
    ok: failures.length === 0,
    adapter: adapter.name,
    transcript: transcript.id,
    replayCount,
    failures
  };
}

function sameJson(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}

function stableRequestKey(request: HeadAdapterRequest): string {
  return stableJson({ messages: request.messages, tools: request.tools ?? [], cachePrefix: request.cachePrefix });
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sortValue(item));
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) sorted[key] = sortValue(record[key]);
    return sorted;
  }
  return value;
}

