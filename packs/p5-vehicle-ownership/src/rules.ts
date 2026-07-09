import type { RbacRuleSetData } from "@cael/os-light";
import {
  p5DocumentsByVehicleId,
  p5KnowledgeById,
  p5MockApiByName,
  p5ServiceById,
  p5UserById,
  p5VehicleById,
  p5Vehicles,
  type P5Document,
  type P5Knowledge,
  type P5MockApi,
  type P5Service,
  type P5User,
  type P5Vehicle
} from "./synthetic-corpus.js";

export type P5TaskType =
  | "inspection_reminder"
  | "insurance_renewal"
  | "document_management"
  | "knowledge_guidance"
  | "recommendation"
  | "onboarding"
  | "personalized_assistance"
  | "prioritization"
  | "reminder_setup"
  | "multi_vehicle"
  | "proactive"
  | "security_guidance"
  | "general_support";

export interface P5DeadlineCheck {
  kind: "inspection" | "civil_liability" | "registration";
  expiry_date: string;
  days_remaining: number;
  urgency: "overdue" | "urgent" | "due_soon" | "upcoming";
}

export interface P5MissingDocument {
  document_type: string;
  document_id: string;
  reason: string;
}

export interface P5NextAction {
  action: string;
  endpoint?: string;
  service_id?: string;
}

export interface P5Resolution {
  user?: P5User;
  vehicle?: P5Vehicle;
  publicOnly: boolean;
  crossUserPrivateAsk: boolean;
}

export interface P5RuleResult {
  task_type: P5TaskType;
  deadline_checks: P5DeadlineCheck[];
  missing_documents: P5MissingDocument[];
  knowledge_ids: string[];
  recommended_service_ids: string[];
  next_actions: P5NextAction[];
  cited_ids: string[];
  evidence_refs: Array<{ id: string; source: string; quote: string }>;
  firing_rule: string;
  confidence: number;
}

export const P5_PINNED_NOW = "2026-07-07";

// Metadata rule set for loader conformance. The runtime action logic below is the
// scored P5 surface; this valid archetype-A declaration records the access shape.
export const p5VehicleOwnershipRuleSet: RbacRuleSetData = {
  archetype: "A",
  roles: ["public", "owner", "blocked"],
  departments: ["vehicle"],
  classifications: [
    { id: "public_knowledge", rank: 0 },
    { id: "owned_vehicle", rank: 1 },
    { id: "other_user_private", rank: 2 }
  ],
  normalization: {
    roles: { public: "public", owner: "owner", blocked: "blocked" },
    departments: { vehicle: "vehicle" }
  },
  role_hierarchy: {},
  access: [
    { role: "public", classification: "public_knowledge", allow: true, rule_id: "p5_public_knowledge_allow", same_dept: undefined },
    { role: "owner", classification: "public_knowledge", allow: true, rule_id: "p5_owner_public_knowledge_allow", same_dept: undefined },
    { role: "owner", classification: "owned_vehicle", allow: true, rule_id: "p5_owner_vehicle_allow", same_dept: undefined },
    { role: "public", classification: "owned_vehicle", allow: false, rule_id: "p5_public_vehicle_deny", same_dept: undefined },
    { role: "owner", classification: "other_user_private", allow: false, rule_id: "p5_cross_user_private_deny", same_dept: undefined },
    { role: "blocked", classification: "public_knowledge", allow: false, rule_id: "p5_blocked_deny", same_dept: undefined },
    { role: "blocked", classification: "owned_vehicle", allow: false, rule_id: "p5_blocked_vehicle_deny", same_dept: undefined },
    { role: "blocked", classification: "other_user_private", allow: false, rule_id: "p5_blocked_private_deny", same_dept: undefined }
  ]
};

export function evaluateP5Rules(request: {
  userId: string;
  vehicleId?: string;
  query: string;
  now: string;
}): P5RuleResult {
  const taskType = classifyTask(request.query, request.userId, request.vehicleId);
  const resolution = resolveContext(request.userId, request.vehicleId, request.query);

  if (resolution.crossUserPrivateAsk) {
    return {
      task_type: taskType === "general_support" ? "security_guidance" : taskType,
      deadline_checks: [],
      missing_documents: [],
      knowledge_ids: [],
      recommended_service_ids: [],
      next_actions: [],
      cited_ids: [],
      evidence_refs: [],
      firing_rule: "p5_privacy_zero_leak",
      confidence: 1
    };
  }

  if (taskType === "security_guidance") {
    return publicSecurityGuidance();
  }
  if (taskType === "multi_vehicle") {
    return multiVehicleGuidance(resolution.user);
  }
  if (taskType === "proactive") {
    return proactiveScan(request.now);
  }

  const vehicle = resolution.vehicle;
  const checks = vehicle ? deadlineChecksForVehicle(vehicle, request.now) : [];
  const missingDocuments = vehicle ? missingDocumentsForVehicle(vehicle.vehicle_id) : [];
  const knowledgeIds = knowledgeIdsForQuery(request.query, vehicle);
  const recommendedServices = vehicle ? recommendedServicesForVehicle(vehicle, checks, missingDocuments, taskType) : [];
  const actions = nextActionsForServices(recommendedServices, taskType, vehicle, missingDocuments);
  const citedIds = collectCitedIds(vehicle, checks, missingDocuments, knowledgeIds, recommendedServices);
  return {
    task_type: taskType,
    deadline_checks: checks,
    missing_documents: missingDocuments,
    knowledge_ids: knowledgeIds,
    recommended_service_ids: recommendedServices.map((service) => service.service_id),
    next_actions: actions,
    cited_ids: citedIds,
    evidence_refs: evidenceRefs(citedIds, vehicle),
    firing_rule: firingRuleFor(taskType),
    confidence: confidenceFor(taskType, citedIds)
  };
}

export function resolveContext(userId: string, vehicleId: string | undefined, query: string): P5Resolution {
  const publicOnly = userId === "-" || userId.toLocaleLowerCase("en-US") === "all";
  const mentionedUsers = [...query.matchAll(/\bU\d{3}\b/gi)].map((match) => match[0]!.toUpperCase());
  const mentionedVehicles = [...query.matchAll(/\bVEH\d{3}\b/gi)].map((match) => match[0]!.toUpperCase());
  const user = publicOnly ? undefined : p5UserById.get(userId);
  const normalizedVehicleId = normalizeVehicleId(vehicleId);
  const requestedVehicle = normalizedVehicleId ? p5VehicleById.get(normalizedVehicleId) : undefined;
  const ownPrimary = user ? p5VehicleById.get(user.primary_vehicle_id) : undefined;
  const vehicle = requestedVehicle ?? ownPrimary;
  const crossUserByMention = mentionedUsers.some((mentioned) => mentioned !== userId);
  const crossVehicleByMention = mentionedVehicles.some((mentioned) => {
    const mentionedVehicle = p5VehicleById.get(mentioned);
    return mentionedVehicle !== undefined && mentionedVehicle.user_id !== userId;
  });
  const crossVehicleByRequest = requestedVehicle !== undefined && !publicOnly && requestedVehicle.user_id !== userId;
  return {
    ...(user ? { user } : {}),
    ...(vehicle ? { vehicle } : {}),
    publicOnly,
    crossUserPrivateAsk: !publicOnly && (crossUserByMention || crossVehicleByMention || crossVehicleByRequest)
  };
}

export function classifyTask(query: string, userId?: string, vehicleId?: string): P5TaskType {
  const normalized = normalizeText(query);
  if (normalized.includes("bao mat") || normalized.includes("consent") || normalized.includes("ma hoa") || normalized.includes("phan quyen")) {
    return "security_guidance";
  }
  if (normalized.includes("chu dong") || normalized.includes("30 ngay toi") || userId?.toLocaleLowerCase("en-US") === "all") {
    return "proactive";
  }
  if (normalizeVehicleId(vehicleId) === undefined && vehicleId?.toLocaleLowerCase("en-US").includes("multiple")) {
    return "multi_vehicle";
  }
  if (normalized.includes("3 chiec xe") || normalized.includes("nhieu xe")) return "multi_vehicle";
  if (normalized.includes("xe may")) return "knowledge_guidance";
  if (normalized.includes("can chuan bi giay to") || normalized.includes("di dang kiem")) return "knowledge_guidance";
  if (normalized.includes("nhac toi") || normalized.includes("reminder")) return "reminder_setup";
  if (normalized.includes("xu ly viec nao truoc") || normalized.includes("deu sap het han")) return "prioritization";
  if (normalized.includes("cuu ho") || normalized.includes("kich hoat") || normalized.includes("dich vu vetc")) return "recommendation";
  if (normalized.includes("thieu giay to") || normalized.includes("chua tai") || normalized.includes("ho so xe")) return "document_management";
  if (normalized.includes("moi mua xe") || normalized.includes("giay to nao")) return "onboarding";
  if (normalized.includes("vinfast") || normalized.includes("xe dien") || normalized.includes("vf8")) return "personalized_assistance";
  if (normalized.includes("bao hiem")) return "insurance_renewal";
  if (normalized.includes("dang kiem")) return "inspection_reminder";
  return "general_support";
}

export function deadlineChecksForVehicle(vehicle: P5Vehicle, now: string): P5DeadlineCheck[] {
  const checks: P5DeadlineCheck[] = [];
  if (vehicle.inspection_expiry !== "N/A") {
    checks.push(deadlineCheck("inspection", vehicle.inspection_expiry, now));
  }
  checks.push(deadlineCheck("civil_liability", vehicle.civil_liability_expiry, now));
  checks.push(deadlineCheck("registration", vehicle.registration_expiry, now));
  return checks;
}

export function missingDocumentsForVehicle(vehicleId: string): P5MissingDocument[] {
  return (p5DocumentsByVehicleId.get(vehicleId) ?? [])
    .filter((document) => document.uploaded === "No")
    .map((document) => ({
      document_type: document.document_type,
      document_id: document.document_id,
      reason: document.notes
    }));
}

export function recommendedServicesForVehicle(
  vehicle: P5Vehicle,
  checks: P5DeadlineCheck[],
  missingDocuments: P5MissingDocument[],
  taskType: P5TaskType
): P5Service[] {
  const services: P5Service[] = [];
  const missingInsurance = missingDocuments.some((document) => document.document_type === "Insurance");
  const civilDueSoon = checks.some((check) => check.kind === "civil_liability" && check.days_remaining <= 30);
  const inspectionDueSoon = checks.some((check) => check.kind === "inspection" && check.days_remaining <= 30);
  if (civilDueSoon || missingInsurance) pushService(services, "SVC001");
  if (vehicle.vehicle_age_years >= 7 && vehicle.roadside_assistance_status === "Inactive") pushService(services, "SVC002");
  if (inspectionDueSoon) pushService(services, "SVC003");
  if (missingDocuments.length > 0 || taskType === "onboarding") pushService(services, "SVC004");
  if (vehicle.vehicle_type === "EV" || vehicle.fuel_type === "Electric") pushService(services, "SVC005");
  if (vehicle.vehicle_age_years >= 7) pushService(services, "SVC006");
  if (checks.some((check) => check.urgency === "urgent" || check.urgency === "due_soon")) pushService(services, "SVC007");
  return prioritizeServices(services, taskType);
}

export function knowledgeIdsForQuery(query: string, vehicle?: P5Vehicle): string[] {
  const normalized = normalizeText(query);
  if (normalized.includes("bao mat") || normalized.includes("consent") || normalized.includes("ma hoa")) return [];
  if (normalized.includes("xe may") || vehicle?.vehicle_type === "Motorbike") return ["K011"];
  if (normalized.includes("chuan bi") && normalized.includes("dang kiem")) return ["K002"];
  if (normalized.includes("moi mua xe") || normalized.includes("giay to nao")) return ["K005", "K009"];
  if (normalized.includes("chua tai") || normalized.includes("thieu giay to") || normalized.includes("ho so xe")) return ["K009"];
  if (normalized.includes("cuu ho")) return ["K006"];
  if (normalized.includes("xe dien") || normalized.includes("vinfast") || normalized.includes("vf8")) return ["K007"];
  if (normalized.includes("nhac") || normalized.includes("30 ngay")) return ["K008"];
  if (normalized.includes("dich vu vetc")) return ["K010"];
  if (normalized.includes("chu dong")) return ["K012"];
  if (normalized.includes("bao hiem")) return ["K003", "K004"];
  if (normalized.includes("dang kiem")) return ["K001"];
  return [];
}

export function daysRemaining(expiryDate: string, now: string): number {
  const expiry = parseIsoDate(expiryDate);
  const base = parseIsoDate(now);
  return Math.floor((expiry - base) / 86_400_000);
}

export function urgencyFor(days: number): P5DeadlineCheck["urgency"] {
  if (days < 0) return "overdue";
  if (days <= 7) return "urgent";
  if (days <= 30) return "due_soon";
  return "upcoming";
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("vi-VN")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeVehicleId(vehicleId: string | undefined): string | undefined {
  if (!vehicleId) return undefined;
  const trimmed = vehicleId.trim();
  if (trimmed === "-" || trimmed.toLocaleLowerCase("en-US") === "all") return undefined;
  if (trimmed.toLocaleLowerCase("en-US").includes("multiple")) return undefined;
  return trimmed.toUpperCase();
}

export function serviceById(serviceId: string): P5Service | undefined {
  return p5ServiceById.get(serviceId);
}

export function mockApiByName(apiName: string): P5MockApi | undefined {
  return p5MockApiByName.get(apiName);
}

function publicSecurityGuidance(): P5RuleResult {
  return {
    task_type: "security_guidance",
    deadline_checks: [],
    missing_documents: [],
    knowledge_ids: [],
    recommended_service_ids: [],
    next_actions: [{ action: "Apply consent, encryption, role-based access, data minimization, and document privacy controls." }],
    cited_ids: [],
    evidence_refs: [],
    firing_rule: "p5_security_guidance",
    confidence: 0.86
  };
}

function multiVehicleGuidance(user?: P5User): P5RuleResult {
  const citedIds = user ? [user.user_id, user.primary_vehicle_id] : [];
  return {
    task_type: "multi_vehicle",
    deadline_checks: [],
    missing_documents: [],
    knowledge_ids: ["K012"],
    recommended_service_ids: ["SVC007"],
    next_actions: [
      { action: "Group vehicles into a dashboard with independent deadline and reminder lanes.", service_id: "SVC007", endpoint: "/mock/reminders" }
    ],
    cited_ids: [...citedIds, "K012", "SVC007"],
    evidence_refs: evidenceRefs([...citedIds, "K012", "SVC007"]),
    firing_rule: "p5_multi_vehicle_dashboard",
    confidence: 0.88
  };
}

function proactiveScan(now: string): P5RuleResult {
  const dueChecks = p5Vehicles.flatMap((vehicle) =>
    deadlineChecksForVehicle(vehicle, now)
      .filter((check) => check.days_remaining <= 30)
      .map((check) => ({ vehicle, check }))
  );
  const citedIds = Array.from(new Set([...dueChecks.map((item) => item.vehicle.vehicle_id), "K012", "SVC007"]));
  return {
    task_type: "proactive",
    deadline_checks: dueChecks.map((item) => item.check),
    missing_documents: [],
    knowledge_ids: ["K012"],
    recommended_service_ids: ["SVC007"],
    next_actions: [{ action: "Create proactive reminders for vehicles with deadlines within 30 days.", service_id: "SVC007", endpoint: "/mock/reminders" }],
    cited_ids: citedIds,
    evidence_refs: evidenceRefs(citedIds),
    firing_rule: "p5_proactive_30_day_scan",
    confidence: 0.9
  };
}

function deadlineCheck(kind: P5DeadlineCheck["kind"], expiryDate: string, now: string): P5DeadlineCheck {
  const days = daysRemaining(expiryDate, now);
  return {
    kind,
    expiry_date: expiryDate,
    days_remaining: days,
    urgency: urgencyFor(days)
  };
}

function nextActionsForServices(
  services: P5Service[],
  taskType: P5TaskType,
  vehicle: P5Vehicle | undefined,
  missingDocuments: P5MissingDocument[]
): P5NextAction[] {
  const actions: P5NextAction[] = [];
  const serviceIds = new Set(services.map((service) => service.service_id));
  if (serviceIds.has("SVC003") || taskType === "inspection_reminder" || taskType === "prioritization") {
    actions.push({ action: "Create inspection reminder", endpoint: "/mock/reminders", service_id: "SVC003" });
  }
  if (serviceIds.has("SVC001") || taskType === "insurance_renewal" || taskType === "reminder_setup") {
    actions.push({ action: "Start civil liability insurance renewal", endpoint: "/mock/insurance/renew", service_id: "SVC001" });
    actions.push({ action: "Prepare VETC Wallet payment", endpoint: "/mock/wallet/pay", service_id: "SVC008" });
  }
  if (serviceIds.has("SVC002")) {
    actions.push({ action: "Activate roadside assistance", endpoint: "/mock/roadside/activate", service_id: "SVC002" });
    actions.push({ action: "Prepare VETC Wallet payment", endpoint: "/mock/wallet/pay", service_id: "SVC008" });
  }
  if (missingDocuments.length > 0 || serviceIds.has("SVC004")) {
    actions.push({ action: "Upload missing document metadata", endpoint: "/mock/documents/upload", service_id: "SVC004" });
  }
  if (vehicle && serviceIds.has("SVC005")) {
    actions.push({ action: "Open EV charging partner recommendations", service_id: "SVC005" });
  }
  if (serviceIds.has("SVC007")) {
    actions.push({ action: "Schedule notification reminders", endpoint: "/mock/notifications/send", service_id: "SVC007" });
  }
  return dedupeActions(actions);
}

function collectCitedIds(
  vehicle: P5Vehicle | undefined,
  checks: P5DeadlineCheck[],
  missingDocuments: P5MissingDocument[],
  knowledgeIds: string[],
  services: P5Service[]
): string[] {
  const ids = new Set<string>();
  if (vehicle) ids.add(vehicle.vehicle_id);
  for (const check of checks) ids.add(`${vehicle?.vehicle_id ?? "vehicle"}:${check.kind}`);
  for (const document of missingDocuments) ids.add(document.document_id);
  for (const knowledgeId of knowledgeIds) ids.add(knowledgeId);
  for (const service of services) ids.add(service.service_id);
  return [...ids];
}

function evidenceRefs(ids: string[], vehicle?: P5Vehicle): Array<{ id: string; source: string; quote: string }> {
  return ids.map((id) => {
    const document = findDocument(id);
    const service = p5ServiceById.get(id);
    const knowledge = p5KnowledgeById.get(id);
    const citedVehicle = p5VehicleById.get(id) ?? vehicle;
    if (document) return { id, source: "P5_XLSM:Vehicle Documents", quote: `${document.document_type} uploaded=${document.uploaded}; notes=${document.notes}` };
    if (service) return { id, source: "P5_XLSM:VETC Services", quote: service.context_to_recommend };
    if (knowledge) return { id, source: "P5_XLSM:Knowledge Dataset", quote: knowledge.answer };
    if (p5VehicleById.has(id)) {
      const resolved = p5VehicleById.get(id)!;
      return { id, source: "P5_XLSM:Vehicle Dataset", quote: `${resolved.vehicle_id} inspection=${resolved.inspection_expiry}; civil=${resolved.civil_liability_expiry}` };
    }
    if (id.includes(":") && citedVehicle) {
      return { id, source: "P5_XLSM:Vehicle Dataset", quote: `${citedVehicle.vehicle_id} deadline field ${id.split(":")[1]}` };
    }
    return { id, source: "P5_XLSM", quote: id };
  });
}

function findDocument(id: string): P5Document | undefined {
  for (const documents of p5DocumentsByVehicleId.values()) {
    const found = documents.find((document) => document.document_id === id);
    if (found) return found;
  }
  return undefined;
}

function pushService(services: P5Service[], serviceId: string) {
  const service = p5ServiceById.get(serviceId);
  if (service && !services.some((candidate) => candidate.service_id === service.service_id)) services.push(service);
}

function prioritizeServices(services: P5Service[], taskType: P5TaskType): P5Service[] {
  const preferred: Record<P5TaskType, string[]> = {
    inspection_reminder: ["SVC003", "SVC007", "SVC004", "SVC001", "SVC002", "SVC006", "SVC005"],
    insurance_renewal: ["SVC001", "SVC007", "SVC004", "SVC002", "SVC006", "SVC003", "SVC005"],
    document_management: ["SVC004", "SVC001", "SVC007", "SVC003", "SVC002", "SVC006", "SVC005"],
    knowledge_guidance: ["SVC004", "SVC007", "SVC003", "SVC001", "SVC002", "SVC006", "SVC005"],
    recommendation: ["SVC002", "SVC006", "SVC001", "SVC004", "SVC007", "SVC003", "SVC005"],
    onboarding: ["SVC004", "SVC007", "SVC001", "SVC003", "SVC002", "SVC006", "SVC005"],
    personalized_assistance: ["SVC005", "SVC004", "SVC006", "SVC007", "SVC001", "SVC002", "SVC003"],
    prioritization: ["SVC003", "SVC001", "SVC007", "SVC004", "SVC002", "SVC006", "SVC005"],
    reminder_setup: ["SVC007", "SVC001", "SVC003", "SVC004", "SVC002", "SVC006", "SVC005"],
    multi_vehicle: ["SVC007", "SVC004", "SVC001", "SVC003", "SVC002", "SVC006", "SVC005"],
    proactive: ["SVC007", "SVC003", "SVC001", "SVC004", "SVC002", "SVC006", "SVC005"],
    security_guidance: [],
    general_support: ["SVC004", "SVC007", "SVC001", "SVC003", "SVC002", "SVC006", "SVC005"]
  };
  const order = preferred[taskType];
  return [...services].sort((left, right) => order.indexOf(left.service_id) - order.indexOf(right.service_id));
}

function firingRuleFor(taskType: P5TaskType): string {
  return `p5_${taskType}`;
}

function confidenceFor(taskType: P5TaskType, citedIds: string[]): number {
  if (taskType === "general_support") return 0;
  if (citedIds.length === 0 && taskType !== "security_guidance") return 0.5;
  return 0.92;
}

function dedupeActions(actions: P5NextAction[]): P5NextAction[] {
  const seen = new Set<string>();
  const result: P5NextAction[] = [];
  for (const action of actions) {
    const key = `${action.action}:${action.endpoint ?? ""}:${action.service_id ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(action);
  }
  return result;
}

function parseIsoDate(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid ISO date: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Date.UTC(year, month - 1, day);
}
