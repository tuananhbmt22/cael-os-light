import { P5_PINNED_NOW, normalizeText } from "./rules.js";
import { runP5Turn, type P5TurnRequest, type P5TurnResponse } from "./turn.js";

export interface P5AnswerRecord {
  task_type: string;
  authorized: boolean;
  primary_check: string;
}

export function p5_answer(state: unknown, input: unknown): P5AnswerRecord {
  const request = scoredInputToRequest(input);
  const response = runP5Turn(state, request);
  return {
    task_type: response.task_type,
    authorized: response.authorized_context,
    primary_check: primaryCheck(response, readString(input, "category") ?? readString(input, "Category") ?? "")
  };
}

function scoredInputToRequest(input: unknown): P5TurnRequest {
  const vehicleId = readString(input, "vehicleId") ?? readString(input, "Vehicle ID");
  const request: P5TurnRequest = {
    turnId: readString(input, "turnId") ?? readString(input, "case_id") ?? "p5-scored-turn",
    userId: readString(input, "userId") ?? readString(input, "User ID") ?? "-",
    query: readString(input, "query") ?? readString(input, "User Query") ?? "",
    now: readString(input, "now") ?? P5_PINNED_NOW
  };
  if (vehicleId) request.vehicleId = vehicleId;
  return request;
}

function primaryCheck(response: P5TurnResponse, category: string): string {
  if (response.privacy_refusal) return "refusal";
  if (response.task_type === "security_guidance") return "security";
  if (response.task_type === "proactive") return "proactive";
  if (response.task_type === "multi_vehicle") return "multi";
  if (response.task_type === "document_management") {
    return response.missing_documents[0] ? `missing:${response.missing_documents[0].document_id}` : "missing:none";
  }
  if (response.task_type === "knowledge_guidance") {
    return response.knowledge_ids[0] ? `knowledge:${response.knowledge_ids[0]}` : "knowledge:none";
  }
  if (response.task_type === "onboarding") return servicePrimary(response, "SVC004");
  if (response.task_type === "personalized_assistance") return servicePrimary(response, "SVC005");
  if (response.task_type === "recommendation") return servicePrimary(response, "SVC002");
  if (response.task_type === "reminder_setup") return deadlinePrimary(response, "civil_liability");
  if (response.task_type === "insurance_renewal") return deadlinePrimary(response, "civil_liability");
  if (response.task_type === "prioritization") return soonestDeadlinePrimary(response);
  if (response.task_type === "inspection_reminder") return deadlinePrimary(response, "inspection");

  const normalizedCategory = normalizeText(category);
  if (normalizedCategory.includes("new owner")) return servicePrimary(response, "SVC004");
  return response.recommended_service_ids[0] ? `service:${response.recommended_service_ids[0]}` : "none";
}

function deadlinePrimary(response: P5TurnResponse, kind: string): string {
  const found = response.deadline_checks.find((check) => check.kind === kind);
  return found ? `${found.kind}:${found.days_remaining}` : `${kind}:none`;
}

function soonestDeadlinePrimary(response: P5TurnResponse): string {
  const candidate = response.deadline_checks
    .filter((check) => check.kind === "inspection" || check.kind === "civil_liability")
    .sort((left, right) => left.days_remaining - right.days_remaining)[0];
  return candidate ? `${candidate.kind}:${candidate.days_remaining}` : "deadline:none";
}

function servicePrimary(response: P5TurnResponse, preferredServiceId: string): string {
  if (response.recommended_service_ids.includes(preferredServiceId)) return `service:${preferredServiceId}`;
  return response.recommended_service_ids[0] ? `service:${response.recommended_service_ids[0]}` : "service:none";
}

function readString(input: unknown, key: string): string | undefined {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return undefined;
  const value = (input as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}
