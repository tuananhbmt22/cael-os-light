import { receiptSchema, s, validate } from "@cael/os-light";
import type { Receipt, Schema } from "@cael/os-light";
import { PACK_ID, PACK_IMAGE_SHA } from "./pack.js";
import {
  evaluateP5Rules,
  resolveContext,
  type P5DeadlineCheck,
  type P5MissingDocument,
  type P5NextAction
} from "./rules.js";

export interface P5TurnRequest {
  turnId: string;
  sessionId?: string;
  userId: string;
  vehicleId?: string;
  query: string;
  now: string;
}

export interface P5VehicleContext {
  vehicle_id: string;
  vehicle_type: string;
  license_plate_masked: string;
}

export interface P5TurnResponse {
  task_type: string;
  answer: string;
  authorized_context: boolean;
  privacy_refusal: boolean;
  vehicle_context?: P5VehicleContext;
  deadline_checks: P5DeadlineCheck[];
  missing_documents: P5MissingDocument[];
  knowledge_ids: string[];
  recommended_service_ids: string[];
  next_actions: P5NextAction[];
  receipt: Receipt;
  modelCalls: number;
}

export type P5StructuredOutput = Omit<P5TurnResponse, "receipt" | "modelCalls">;

const deadlineCheckSchema: Schema<P5DeadlineCheck> = s.object(
  {
    kind: s.enumOf(["inspection", "civil_liability", "registration"] as const),
    expiry_date: s.string(),
    days_remaining: s.number(),
    urgency: s.enumOf(["overdue", "urgent", "due_soon", "upcoming"] as const)
  },
  "P5DeadlineCheck"
) as Schema<P5DeadlineCheck>;

const missingDocumentSchema: Schema<P5MissingDocument> = s.object(
  {
    document_type: s.string(),
    document_id: s.string(),
    reason: s.string()
  },
  "P5MissingDocument"
) as Schema<P5MissingDocument>;

const vehicleContextSchema: Schema<P5VehicleContext> = s.object(
  {
    vehicle_id: s.string(),
    vehicle_type: s.string(),
    license_plate_masked: s.string()
  },
  "P5VehicleContext"
) as Schema<P5VehicleContext>;

const nextActionSchema: Schema<P5NextAction> = s.object(
  {
    action: s.string(),
    endpoint: s.optional(s.string()),
    service_id: s.optional(s.string())
  },
  "P5NextAction"
) as Schema<P5NextAction>;

export const p5StructuredOutputSchema: Schema<P5StructuredOutput> = s.object(
  {
    task_type: s.string(),
    answer: s.string(),
    authorized_context: s.boolean(),
    privacy_refusal: s.boolean(),
    vehicle_context: s.optional(vehicleContextSchema),
    deadline_checks: s.array(deadlineCheckSchema),
    missing_documents: s.array(missingDocumentSchema),
    knowledge_ids: s.array(s.string()),
    recommended_service_ids: s.array(s.string()),
    next_actions: s.array(nextActionSchema)
  },
  "P5StructuredOutput"
) as Schema<P5StructuredOutput>;

export function runP5Turn(_state: unknown, request: P5TurnRequest): P5TurnResponse {
  assertRequiredNow(request.now);
  const resolution = resolveContext(request.userId, request.vehicleId, request.query);
  const ruleResult = evaluateP5Rules({
    userId: request.userId,
    ...(request.vehicleId ? { vehicleId: request.vehicleId } : {}),
    query: request.query,
    now: request.now
  });
  const privacyRefusal = resolution.crossUserPrivateAsk;
  const authorizedContext = !privacyRefusal;
  const structured: P5StructuredOutput = {
    task_type: ruleResult.task_type,
    answer: privacyRefusal ? privacyAnswer() : answerFor(ruleResult, resolution.vehicle?.vehicle_id),
    authorized_context: authorizedContext,
    privacy_refusal: privacyRefusal,
    deadline_checks: ruleResult.deadline_checks,
    missing_documents: ruleResult.missing_documents,
    knowledge_ids: ruleResult.knowledge_ids,
    recommended_service_ids: ruleResult.recommended_service_ids,
    next_actions: ruleResult.next_actions
  };
  if (!privacyRefusal && resolution.vehicle && resolution.vehicle.user_id === request.userId) {
    structured.vehicle_context = {
      vehicle_id: resolution.vehicle.vehicle_id,
      vehicle_type: resolution.vehicle.vehicle_type,
      license_plate_masked: resolution.vehicle.license_plate_masked
    };
  }

  const validatedOutput = validate(p5StructuredOutputSchema, structured);
  if (!validatedOutput.ok) {
    throw new Error(`P5 structured output validation failed: ${validatedOutput.errors.map((error) => error.message).join("; ")}`);
  }

  const receipt: Receipt = {
    kind: privacyRefusal ? "refusal" : "answer",
    decision: privacyRefusal ? "refuse" : "score",
    firing_rule: ruleResult.firing_rule,
    cited_ids: privacyRefusal ? [] : ruleResult.cited_ids,
    evidence_refs: privacyRefusal ? [] : ruleResult.evidence_refs,
    confidence: ruleResult.confidence,
    escalation_used: false,
    pack_id: PACK_ID,
    image_sha: PACK_IMAGE_SHA,
    schema_version: "phase0.s3.receipt"
  };
  const validatedReceipt = validate(receiptSchema, receipt);
  if (!validatedReceipt.ok) {
    throw new Error(`P5 receipt validation failed: ${validatedReceipt.errors.map((error) => error.message).join("; ")}`);
  }

  return { ...validatedOutput.value, receipt: validatedReceipt.value, modelCalls: 0 };
}

function assertRequiredNow(now: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(now)) {
    throw new Error("P5TurnRequest.now is required and must be YYYY-MM-DD");
  }
}

function privacyAnswer(): string {
  return "Tôi không thể truy cập hoặc xác nhận hồ sơ riêng của người dùng khác. Vui lòng chỉ yêu cầu dữ liệu thuộc quyền của bạn hoặc đặt câu hỏi hướng dẫn chung.";
}

function answerFor(result: ReturnType<typeof evaluateP5Rules>, vehicleId: string | undefined): string {
  if (result.task_type === "security_guidance") {
    return "Trợ lý giấy tờ xe cần có đồng ý của người dùng, mã hóa dữ liệu, phân quyền truy cập, tối thiểu hóa dữ liệu và không tiết lộ tài liệu cá nhân ngoài phạm vi được phép.";
  }
  if (result.task_type === "multi_vehicle") {
    return "Nên quản lý nhiều xe bằng dashboard riêng cho từng phương tiện, mỗi xe có deadline, giấy tờ và lịch nhắc độc lập.";
  }
  if (result.task_type === "proactive") {
    return `Có ${result.deadline_checks.length} hạn giấy tờ trong 30 ngày tới; nên ưu tiên các mốc gần nhất và tạo nhắc nhở chủ động.`;
  }
  const prefix = vehicleId ? `Với xe ${vehicleId}, ` : "";
  const deadlineText = result.deadline_checks
    .filter((check) => check.kind !== "registration" || check.urgency !== "upcoming")
    .map((check) => `${check.kind} còn ${check.days_remaining} ngày (${check.urgency})`)
    .join("; ");
  const missingText = result.missing_documents.length > 0
    ? `Thiếu upload: ${result.missing_documents.map((document) => `${document.document_type} ${document.document_id}`).join(", ")}.`
    : "Không phát hiện tài liệu thiếu upload trong các hàng metadata của xe.";
  const serviceText = result.recommended_service_ids.length > 0
    ? `Dịch vụ phù hợp: ${result.recommended_service_ids.join(", ")}.`
    : "Chưa có dịch vụ VETC nào đủ điều kiện theo luật deterministic.";
  if (result.task_type === "knowledge_guidance") {
    return `${prefix}${knowledgeAnswer(result.knowledge_ids)} ${serviceText}`.trim();
  }
  return `${prefix}${deadlineText || "không có deadline gần cần ưu tiên."} ${missingText} ${serviceText}`.trim();
}

function knowledgeAnswer(knowledgeIds: string[]): string {
  if (knowledgeIds.includes("K002")) {
    return "Khi đi đăng kiểm, cần chuẩn bị đăng ký xe, giấy chứng nhận đăng kiểm cũ, bảo hiểm TNDS còn hiệu lực và giấy tờ tùy thân/chủ xe khi cần.";
  }
  if (knowledgeIds.includes("K011")) {
    return "Xe máy không quản lý giống ô tô ở phần đăng kiểm, nhưng vẫn cần theo dõi đăng ký xe, bảo hiểm TNDS nếu áp dụng và các nhắc nhở liên quan.";
  }
  return "Câu trả lời dựa trên Knowledge Dataset đóng của P5.";
}
