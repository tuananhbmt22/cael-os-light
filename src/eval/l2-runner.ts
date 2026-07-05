import type { AuditRecord, TurnOutcome } from "../types/index.js";
import type { AuditSink } from "../dual-channel/dual-channel.js";
import type { LoadedPack } from "../pack/pack-loader.js";
import type { NotificationEmission } from "../notify/notify.js";
import { createNotifyEngine } from "../notify/notify.js";
import { LedgerMemory } from "../kernel/ledger-memory.js";
import type { S3Pack, TurnInput } from "../spine/run-turn.js";
import { runTurn } from "../spine/run-turn.js";
import type { KernelSnapshot, KernelStore } from "../kernel/state-kernel.js";
import { InMemoryKernelStore, JsonSnapshotKernelStore } from "../kernel/state-kernel.js";
import type { ProvenanceRecord } from "./provenance.js";
import { emitProvenanceRecord } from "./provenance.js";

export interface L2SessionSpec {
  session_id: string;
  user_id: string;
  pack: LoadedPack;
}

export interface L2Prompt {
  prompt_id: string;
  session_id: string;
  turn: Omit<TurnInput, "userId" | "sessionId" | "turnId">;
  expected_outcome: TurnOutcome;
  expected_decision?: string | undefined;
  bleed_probe?: {
    forbidden: string[];
  } | undefined;
  notify?: {
    event: string;
    ctx: Record<string, unknown>;
  } | undefined;
  simulate_crash?: boolean | undefined;
}

export interface L2PromptSet {
  version: string;
  prompts: L2Prompt[];
}

export interface L2Deps {
  run_id: string;
  os_sha: string;
  brief_ref: string;
  report_ref: string;
  replay_ref: string;
  auditStore?: KernelStore | undefined;
  notifyStore?: KernelStore | undefined;
}

export interface L2TurnRecord {
  prompt_id: string;
  session_id: string;
  status: "complete" | "crashed";
  expected_outcome: TurnOutcome;
  outcome?: TurnOutcome | undefined;
  decision?: string | undefined;
  user_message?: string | undefined;
  receipt_pack_id?: string | undefined;
  audit?: AuditRecord | undefined;
  gate_match: boolean;
  bleed_caught?: boolean | undefined;
}

export interface L2NotifyRecord {
  prompt_id: string;
  before_restart: NotificationEmission[];
  duplicate_after_restart: NotificationEmission[];
  new_after_restart: NotificationEmission[];
  snapshot_json: string;
  stable: boolean;
}

export interface L2Scores {
  gate_holds_turn_to_turn: boolean;
  no_capability_bleed: boolean;
  notification_arbitration_across_restart: boolean;
  crash_partial_preserved_marked: boolean;
  complete: boolean;
}

export interface L2Recording {
  run_id: string;
  prompt_set_version: string;
  sessions: { session_id: string; pack_id: string; complete: boolean }[];
  turns: L2TurnRecord[];
  notifications: L2NotifyRecord[];
  scores: L2Scores;
  provenance: ProvenanceRecord;
  audit_snapshot: KernelSnapshot;
  notify_snapshot: KernelSnapshot;
  schema_version: "phase0.l2-recording.v1";
}

export class KernelAuditSink implements AuditSink {
  constructor(
    private readonly store: KernelStore,
    private readonly scopeUserId = "__l2_audit__"
  ) {}

  write(record: AuditRecord, idempotencyKey?: string): boolean {
    if (idempotencyKey) {
      if (this.store.getIdempotency(this.scopeUserId, idempotencyKey) !== undefined) return true;
      this.store.putIdempotency(this.scopeUserId, idempotencyKey, record);
    }
    this.store.appendEvent(this.scopeUserId, { kind: "audit", record });
    return true;
  }
}

export function runL2(sessions: L2SessionSpec[], promptSet: L2PromptSet, deps: L2Deps): L2Recording {
  const auditStore = deps.auditStore ?? new InMemoryKernelStore();
  const notifyStore = deps.notifyStore ?? new InMemoryKernelStore();
  const auditSink = new KernelAuditSink(auditStore);
  const turns: L2TurnRecord[] = [];
  const notifications: L2NotifyRecord[] = [];
  const sessionStatus = new Map(sessions.map((session) => [session.session_id, true]));

  for (const prompt of promptSet.prompts) {
    const session = sessions.find((candidate) => candidate.session_id === prompt.session_id);
    if (!session) {
      turns.push(crashedTurn(prompt));
      continue;
    }

    if (prompt.simulate_crash === true) {
      turns.push(crashedTurn(prompt));
      sessionStatus.set(session.session_id, false);
      continue;
    }

    const ledger = new LedgerMemory(auditStore);
    const turn = runTurn(
      toS3Pack(session.pack),
      {
        ...prompt.turn,
        userId: session.user_id,
        sessionId: session.session_id,
        turnId: prompt.prompt_id
      },
      { auditSink, ledger }
    );
    const gateMatch = turn.outcome === prompt.expected_outcome && (!prompt.expected_decision || turn.receipt.decision === prompt.expected_decision);
    const record: L2TurnRecord = {
      prompt_id: prompt.prompt_id,
      session_id: prompt.session_id,
      status: "complete",
      expected_outcome: prompt.expected_outcome,
      outcome: turn.outcome,
      decision: turn.receipt.decision,
      user_message: turn.userMessage,
      receipt_pack_id: turn.receipt.pack_id,
      audit: turn.audit,
      gate_match: gateMatch
    };
    if (prompt.bleed_probe) record.bleed_caught = isBleedCaught(record, prompt.bleed_probe.forbidden);
    turns.push(record);

    if (prompt.notify) {
      notifications.push(runNotifyRestartProof(session.pack, notifyStore, prompt));
    }
  }

  const scores = computeScores(turns, notifications, sessionStatus);
  const provenance = emitProvenanceRecord({
    run_id: deps.run_id,
    brief_ref: deps.brief_ref,
    report_ref: deps.report_ref,
    replay_ref: deps.replay_ref,
    os_sha: deps.os_sha,
    pack_ids: sessions.map((session) => session.pack.packId),
    scores: scores as unknown as Record<string, unknown>
  });
  return {
    run_id: deps.run_id,
    prompt_set_version: promptSet.version,
    sessions: sessions.map((session) => ({
      session_id: session.session_id,
      pack_id: session.pack.packId,
      complete: sessionStatus.get(session.session_id) ?? false
    })),
    turns,
    notifications,
    scores,
    provenance,
    audit_snapshot: auditStore.snapshot(),
    notify_snapshot: notifyStore.snapshot(),
    schema_version: "phase0.l2-recording.v1"
  };
}

function toS3Pack(pack: LoadedPack): S3Pack {
  const s3Pack: S3Pack = {
    packId: pack.packId,
    imageSha: pack.imageSha,
    gateRuleSet: pack.gateRuleSet,
    corpus: pack.corpus
  };
  if (pack.triggerConfig !== undefined) s3Pack.triggerConfig = pack.triggerConfig;
  return s3Pack;
}

export function replayL2Recording(recording: L2Recording): L2Scores {
  return computeScores(
    recording.turns,
    recording.notifications,
    new Map(recording.sessions.map((session) => [session.session_id, session.complete]))
  );
}

function runNotifyRestartProof(pack: LoadedPack, notifyStore: KernelStore, prompt: L2Prompt): L2NotifyRecord {
  const notify = createNotifyEngine(pack, { store: notifyStore });
  const before = notify.fire(prompt.notify!.event, prompt.notify!.ctx);
  const snapshotJson = new JsonSnapshotKernelStore(notify.snapshot()).toJson();
  const restartedStore = JsonSnapshotKernelStore.fromJson(snapshotJson);
  const restarted = createNotifyEngine(pack, { store: restartedStore });
  const duplicate = restarted.fire(prompt.notify!.event, prompt.notify!.ctx);
  const nextCtx = { ...prompt.notify!.ctx, dedupeKey: `${String(prompt.notify!.ctx.dedupeKey ?? prompt.prompt_id)}-after-restart` };
  const next = restarted.fire(prompt.notify!.event, nextCtx);
  return {
    prompt_id: prompt.prompt_id,
    before_restart: before,
    duplicate_after_restart: duplicate,
    new_after_restart: next,
    snapshot_json: snapshotJson,
    stable: before.length > 0 && duplicate.length === 0 && next.length === before.length
  };
}

function crashedTurn(prompt: L2Prompt): L2TurnRecord {
  return {
    prompt_id: prompt.prompt_id,
    session_id: prompt.session_id,
    status: "crashed",
    expected_outcome: prompt.expected_outcome,
    gate_match: false
  };
}

function isBleedCaught(record: L2TurnRecord, forbidden: string[]): boolean {
  if (record.decision !== "deny" && record.decision !== "refuse") return false;
  const userMessage = record.user_message ?? "";
  return forbidden.every((token) => !userMessage.includes(token));
}

function computeScores(
  turns: L2TurnRecord[],
  notifications: L2NotifyRecord[],
  sessionStatus: Map<string, boolean>
): L2Scores {
  const completeTurns = turns.filter((turn) => turn.status === "complete");
  const bleedTurns = completeTurns.filter((turn) => turn.bleed_caught !== undefined);
  const hasCrash = turns.some((turn) => turn.status === "crashed");
  return {
    gate_holds_turn_to_turn: completeTurns.length > 0 && completeTurns.every((turn) => turn.gate_match),
    no_capability_bleed: bleedTurns.length > 0 && bleedTurns.every((turn) => turn.bleed_caught === true),
    notification_arbitration_across_restart: notifications.length > 0 && notifications.every((record) => record.stable),
    crash_partial_preserved_marked: hasCrash && [...sessionStatus.values()].some((complete) => !complete),
    complete: turns.length > 0 && completeTurns.length > 0
  };
}
