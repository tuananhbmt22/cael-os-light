import type { EntityKey, IdempotencyKey, UserId } from "../types/index.js";
import type { Schema, ValidationError, Validated } from "../validate/structured-output.js";

export type KernelResult<T> = Validated<T>;

export interface StoredEvent<T> {
  userId: UserId;
  seq: number;
  event: T;
}

export interface KernelSnapshot {
  entities: Record<UserId, Record<EntityKey, unknown>>;
  events: Record<UserId, StoredEvent<unknown>[]>;
  idempotency: Record<UserId, Record<IdempotencyKey, unknown>>;
}

export interface KernelStore {
  getEntity(userId: UserId, key: EntityKey): unknown;
  putEntity(userId: UserId, key: EntityKey, entity: unknown): void;
  listEntities(userId: UserId): unknown[];
  hasEntity(userId: UserId, key: EntityKey): boolean;
  appendEvent(userId: UserId, event: unknown): StoredEvent<unknown>;
  readEvents(userId: UserId): StoredEvent<unknown>[];
  getIdempotency(userId: UserId, key: IdempotencyKey): unknown;
  putIdempotency(userId: UserId, key: IdempotencyKey, outcome: unknown): void;
  snapshot(): KernelSnapshot;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function emptySnapshot(): KernelSnapshot {
  return { entities: {}, events: {}, idempotency: {} };
}

export class InMemoryKernelStore implements KernelStore {
  private readonly data: KernelSnapshot;

  constructor(snapshot: KernelSnapshot = emptySnapshot()) {
    this.data = cloneJson(snapshot);
  }

  getEntity(userId: UserId, key: EntityKey): unknown {
    return this.data.entities[userId]?.[key];
  }

  putEntity(userId: UserId, key: EntityKey, entity: unknown): void {
    this.data.entities[userId] ??= {};
    this.data.entities[userId][key] = cloneJson(entity);
  }

  listEntities(userId: UserId): unknown[] {
    return Object.values(this.data.entities[userId] ?? {}).map((entity) => cloneJson(entity));
  }

  hasEntity(userId: UserId, key: EntityKey): boolean {
    return this.data.entities[userId]?.[key] !== undefined;
  }

  appendEvent(userId: UserId, event: unknown): StoredEvent<unknown> {
    this.data.events[userId] ??= [];
    const seq = (this.data.events[userId].at(-1)?.seq ?? 0) + 1;
    const stored: StoredEvent<unknown> = { userId, seq, event: cloneJson(event) };
    this.data.events[userId].push(stored);
    return cloneJson(stored);
  }

  readEvents(userId: UserId): StoredEvent<unknown>[] {
    return cloneJson(this.data.events[userId] ?? []);
  }

  getIdempotency(userId: UserId, key: IdempotencyKey): unknown {
    return this.data.idempotency[userId]?.[key];
  }

  putIdempotency(userId: UserId, key: IdempotencyKey, outcome: unknown): void {
    this.data.idempotency[userId] ??= {};
    this.data.idempotency[userId][key] = cloneJson(outcome);
  }

  snapshot(): KernelSnapshot {
    return cloneJson(this.data);
  }
}

export class JsonSnapshotKernelStore extends InMemoryKernelStore {
  static fromJson(json: string): JsonSnapshotKernelStore {
    return new JsonSnapshotKernelStore(JSON.parse(json) as KernelSnapshot);
  }

  toJson(): string {
    return JSON.stringify(this.snapshot());
  }
}

export class EntityStore<T> {
  constructor(
    private readonly schema: Schema<T>,
    private readonly store: KernelStore = new InMemoryKernelStore()
  ) {}

  put(userId: UserId, key: EntityKey, entity: unknown): KernelResult<T> {
    const result = this.schema.validate(entity);
    if (!result.ok) return result;
    this.store.putEntity(userId, key, result.value);
    return result;
  }

  get(userId: UserId, key: EntityKey): T | null {
    const value = this.store.getEntity(userId, key);
    const result = this.schema.validate(value);
    return result.ok ? result.value : null;
  }

  list(userId: UserId): T[] {
    return this.store
      .listEntities(userId)
      .map((entity) => this.schema.validate(entity))
      .filter((result): result is { ok: true; value: T } => result.ok)
      .map((result) => result.value);
  }

  has(userId: UserId, key: EntityKey): boolean {
    return this.store.hasEntity(userId, key);
  }
}

export class EventLedger<T> {
  constructor(
    private readonly schema: Schema<T>,
    private readonly store: KernelStore = new InMemoryKernelStore(),
    private readonly log: (errors: ValidationError[]) => void = () => {}
  ) {}

  append(userId: UserId, event: unknown): KernelResult<StoredEvent<T>> {
    const result = this.schema.validate(event);
    if (!result.ok) return result;
    return { ok: true, value: this.store.appendEvent(userId, result.value) as StoredEvent<T> };
  }

  read(userId: UserId): StoredEvent<T>[] {
    return this.validRows(this.store.readEvents(userId));
  }

  readSince(userId: UserId, seq: number): StoredEvent<T>[] {
    return this.read(userId).filter((row) => row.seq > seq);
  }

  private validRows(rows: StoredEvent<unknown>[]): StoredEvent<T>[] {
    const output: StoredEvent<T>[] = [];
    for (const row of rows) {
      const result = this.schema.validate(row.event);
      if (result.ok) output.push({ userId: row.userId, seq: row.seq, event: result.value });
      else this.log(result.errors);
    }
    return output;
  }
}

export class IdempotencyGuard<T> {
  constructor(
    private readonly store: KernelStore = new InMemoryKernelStore(),
    private readonly outcomeSchema: Schema<T> | null = null
  ) {}

  once(userId: UserId, idempotencyKey: IdempotencyKey, fn: () => KernelResult<T>): KernelResult<T> {
    const recorded = this.store.getIdempotency(userId, idempotencyKey);
    if (recorded !== undefined) {
      if (this.outcomeSchema) return this.outcomeSchema.validate(recorded);
      return { ok: true, value: recorded as T };
    }

    const result = fn();
    if (!result.ok) return result;
    this.store.putIdempotency(userId, idempotencyKey, result.value);
    return result;
  }
}
