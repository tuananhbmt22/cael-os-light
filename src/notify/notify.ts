import type { UserId } from "../types/index.js";
import type { KernelSnapshot, KernelStore } from "../kernel/state-kernel.js";
import { InMemoryKernelStore } from "../kernel/state-kernel.js";
import type { NotificationTemplateDeclaration, NotificationTriggerDeclaration } from "../pack/pack-schema.js";

export interface NotificationEmission {
  trigger_id: string;
  template_id: string;
  renderedBody: string;
  dedupeKey: string;
}

export interface NotifyContext {
  dedupeKey?: string;
  idempotencyKey?: string;
  eventId?: string;
  turnId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface NotifyDeps {
  schedule?: (emission: NotificationEmission, at: string) => void;
  at?: string;
  log?: (event: NotifyLogEvent) => void;
}

export interface NotifyLogEvent {
  code: "missing-template" | "template-trigger-drift";
  trigger_id: string;
  template_id?: string;
  message: string;
}

export interface NotifyEngine {
  fire(event: string, ctx?: NotifyContext, deps?: NotifyDeps): NotificationEmission[];
  snapshot(): KernelSnapshot;
}

export interface NotifyEngineOptions {
  store?: KernelStore;
  scopeUserId?: UserId;
  log?: (event: NotifyLogEvent) => void;
}

export interface NotificationPackDeclarations {
  notification_templates: Record<string, NotificationTemplateDeclaration>;
  notification_triggers: Record<string, NotificationTriggerDeclaration>;
}

export type NotifyPack =
  | NotificationPackDeclarations
  | {
      raw: NotificationPackDeclarations;
    };

interface TriggerCandidate {
  triggerId: string;
  trigger: NotificationTriggerDeclaration & { priority?: number | undefined };
}

const DEFAULT_SCOPE_USER: UserId = "__notify__";
const IMMEDIATE_DELIVERY = "immediate";

export function createNotifyEngine(pack: NotifyPack, options: NotifyEngineOptions = {}): NotifyEngine {
  const raw = "raw" in pack ? pack.raw : pack;
  const store = options.store ?? new InMemoryKernelStore();
  const scopeUserId = options.scopeUserId ?? DEFAULT_SCOPE_USER;
  const log = options.log ?? (() => {});

  return {
    fire(event: string, ctx: NotifyContext = {}, deps: NotifyDeps = {}): NotificationEmission[] {
      const dedupeKey = deriveDedupeKey(event, ctx);
      const candidates = matchingTriggers(raw.notification_triggers, event);
      const emissions: NotificationEmission[] = [];
      for (const candidate of candidates) {
        const template = raw.notification_templates[candidate.trigger.template_id];
        if (!template) {
          emitLog(log, deps.log, {
            code: "missing-template",
            trigger_id: candidate.triggerId,
            template_id: candidate.trigger.template_id,
            message: `notification trigger ${candidate.triggerId} references missing template ${candidate.trigger.template_id}`
          });
          continue;
        }
        if (template.trigger_id !== candidate.triggerId) {
          emitLog(log, deps.log, {
            code: "template-trigger-drift",
            trigger_id: candidate.triggerId,
            template_id: candidate.trigger.template_id,
            message: `notification template ${candidate.trigger.template_id} references trigger ${template.trigger_id}`
          });
        }
        const emission: NotificationEmission = {
          trigger_id: candidate.triggerId,
          template_id: candidate.trigger.template_id,
          renderedBody: renderTemplate(template, ctx),
          dedupeKey
        };
        if (markFirstEmission(store, scopeUserId, emission)) emissions.push(emission);
      }

      const arbitrated = arbitrate(emissions);
      const schedule = deps.schedule ?? (() => {});
      for (const emission of arbitrated) schedule(emission, deps.at ?? IMMEDIATE_DELIVERY);
      return arbitrated;
    },
    snapshot(): KernelSnapshot {
      return store.snapshot();
    }
  };
}

export function arbitrate(emissions: NotificationEmission[]): NotificationEmission[] {
  const unique = new Map<string, NotificationEmission>();
  for (const emission of emissions) {
    const key = `${emission.trigger_id}\u0000${emission.dedupeKey}`;
    if (!unique.has(key)) unique.set(key, emission);
  }
  return [...unique.values()].sort((left, right) => {
    const triggerOrder = left.trigger_id.localeCompare(right.trigger_id);
    if (triggerOrder !== 0) return triggerOrder;
    return left.template_id.localeCompare(right.template_id);
  });
}

function matchingTriggers(
  triggers: Record<string, NotificationTriggerDeclaration>,
  event: string
): TriggerCandidate[] {
  return Object.entries(triggers)
    .filter(([, trigger]) => trigger.event === event)
    .map(([triggerId, trigger]) => ({ triggerId, trigger: trigger as NotificationTriggerDeclaration & { priority?: number | undefined } }))
    .sort((left, right) => {
      const leftPriority = left.trigger.priority ?? 0;
      const rightPriority = right.trigger.priority ?? 0;
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return left.triggerId.localeCompare(right.triggerId);
    });
}

function renderTemplate(template: NotificationTemplateDeclaration, ctx: NotifyContext): string {
  return template.body.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_match, path: string) => {
    const value = lookupPath(ctx, path);
    return value === undefined || value === null ? "" : String(value);
  });
}

function lookupPath(ctx: NotifyContext, path: string): unknown {
  let current: unknown = ctx;
  for (const part of path.split(".")) {
    if (current === null || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function deriveDedupeKey(event: string, ctx: NotifyContext): string {
  const explicit = ctx.dedupeKey ?? ctx.idempotencyKey ?? ctx.eventId ?? ctx.turnId;
  if (explicit !== undefined) return String(explicit);
  return `${event}:${stableStringify(ctx)}`;
}

function stableStringify(input: unknown): string {
  if (input === null || typeof input !== "object") return JSON.stringify(input);
  if (Array.isArray(input)) return `[${input.map((item) => stableStringify(item)).join(",")}]`;
  const record = input as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function markFirstEmission(store: KernelStore, scopeUserId: UserId, emission: NotificationEmission): boolean {
  const key = `${emission.trigger_id}:${emission.dedupeKey}`;
  if (store.getIdempotency(scopeUserId, key) !== undefined) return false;
  store.putIdempotency(scopeUserId, key, emission);
  return true;
}

function emitLog(
  engineLog: (event: NotifyLogEvent) => void,
  depsLog: ((event: NotifyLogEvent) => void) | undefined,
  event: NotifyLogEvent
): void {
  engineLog(event);
  depsLog?.(event);
}
