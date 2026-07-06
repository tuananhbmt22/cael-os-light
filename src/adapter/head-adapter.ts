import { createHash } from "node:crypto";
import type { Schema, ValidationError } from "../validate/structured-output.js";
import { validate } from "../validate/structured-output.js";

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AdapterEvent {
  type: string;
  name: string;
  data: Record<string, unknown>;
}

export interface HeadAdapterRequest {
  messages: { role: string; content: string }[];
  tools?: ToolSpec[];
  cachePrefix: string;
}

export interface HeadAdapterResponse {
  toolCalls: ToolCall[];
  events: AdapterEvent[];
  structured?: unknown;
}

export interface HeadAdapter {
  readonly name: string;
  complete(req: HeadAdapterRequest): HeadAdapterResponse;
  cachePrefixHash(req: HeadAdapterRequest): string;
}

export type AdapterFailureKind = "structured-output-invalid";
export type AdapterErrorKind = "transient" | "fatal";

export interface AdapterStructuredFailure {
  kind: AdapterFailureKind;
  outcome: "degrade";
  errors: ValidationError[];
}

export type AdapterStructuredResult<T> =
  | { ok: true; structured: T }
  | { ok: false; failure: AdapterStructuredFailure };

export interface AdapterErrorInput {
  kind: AdapterErrorKind;
  code: string;
}

export type AdapterErrorOutcome =
  | { outcome: "retry"; retryable: true; code: string }
  | { outcome: "terminal"; retryable: false; code: string };

export function stableCachePrefixHash(cachePrefix: string): string {
  return createHash("sha256").update(cachePrefix, "utf8").digest("hex");
}

export function validateStructuredAdapterOutput<T>(
  schema: Schema<T>,
  response: HeadAdapterResponse
): AdapterStructuredResult<T> {
  const result = validate(schema, response.structured);
  if (result.ok) return { ok: true, structured: result.value };
  return {
    ok: false,
    failure: {
      kind: "structured-output-invalid",
      outcome: "degrade",
      errors: result.errors
    }
  };
}

export function mapAdapterError(input: AdapterErrorInput): AdapterErrorOutcome {
  if (input.kind === "transient") return { outcome: "retry", retryable: true, code: input.code };
  return { outcome: "terminal", retryable: false, code: input.code };
}

