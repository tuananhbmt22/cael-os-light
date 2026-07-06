import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createImageBootSession } from "../image/image-loader.js";
import { createPackRegistry, loadPack, registerPack } from "../pack/pack-loader.js";
import { MemoryAuditSink } from "../dual-channel/dual-channel.js";
import { runTurn, type S3Pack } from "../spine/run-turn.js";
import type { DomainPackRaw } from "../pack/pack-schema.js";

export interface CliSuccess {
  ok: true;
  stdout?: string;
  tree?: string[];
  noOp?: boolean;
}

export interface CliFailure {
  ok: false;
  code: string;
  message: string;
}

export type CliResult = CliSuccess | CliFailure;

export interface RuntimeOptions {
  target?: string | undefined;
  packageRoot?: string | undefined;
}

export interface StatusPayload {
  os_sha: string;
  packs: string[];
  head_adapter: string;
}

export const configFileName = "cael-os-light.config";
export const installDirName = "cael-os-light";
export const managedFiles = [
  configFileName,
  "cael-os-light/.install.json",
  "cael-os-light/hooks/.keep",
  "cael-os-light/image/cael.os.md",
  "cael-os-light/packs/synthetic-pack.json",
  "cael-os-light/rails/.keep",
  "cael-os-light/state/.keep"
] as const;

const schemaVersion = "cael-os-light.config.v1";
const markerVersion = "cael-os-light.install.v1";
const packageRoot = findPackageRoot(path.dirname(fileURLToPath(import.meta.url)));

interface ConfigShape {
  schema_version: typeof schemaVersion;
  model: {
    provider: "stub";
    client_key: string;
  };
  head_adapter: "stub";
  image: "cael-os-light/image/cael.os.md";
  packs: ["cael-os-light/packs/synthetic-pack.json"];
}

export function initFixture(options: RuntimeOptions = {}): CliResult {
  const target = resolveTarget(options.target);
  mkdirSync(target, { recursive: true });

  if (isCompleteInstall(target)) {
    return { ok: true, stdout: JSON.stringify({ status: "re-init-noop" }), tree: managedTree(target), noOp: true };
  }
  const conflict = findInitConflict(target);
  if (conflict) return { ok: false, code: "init-on-dirty-project-refused", message: conflict };

  writeInstall(target, options.packageRoot ?? packageRoot);
  return { ok: true, stdout: JSON.stringify({ status: "initialized" }), tree: managedTree(target) };
}

export function status(options: RuntimeOptions = {}): CliResult {
  const target = resolveTarget(options.target);
  mkdirSync(target, { recursive: true });
  if (!isCompleteInstall(target) || !readValidConfig(target)) {
    writeInstall(target, options.packageRoot ?? packageRoot);
  }

  const config = readValidConfig(target);
  if (!config) return { ok: false, code: "stale-config-regenerated", message: "config regeneration failed" };

  const imagePath = path.join(target, config.image);
  const imageSession = createImageBootSession();
  const image = imageSession.boot(imagePath);
  if (!image.ok) return { ok: false, code: image.error.code, message: image.error.message };

  const registry = createPackRegistry();
  const loadedPackIds: string[] = [];
  for (const packRelPath of config.packs) {
    const packRaw = readJson(path.join(target, packRelPath)) as DomainPackRaw;
    const loaded = loadPack(packRaw);
    if (!loaded.ok) return { ok: false, code: loaded.error.code, message: loaded.error.message };
    const s3Pack: S3Pack =
      loaded.pack.triggerConfig === undefined
        ? {
            packId: loaded.pack.packId,
            imageSha: image.image.os_sha,
            gateRuleSet: loaded.pack.gateRuleSet,
            corpus: loaded.pack.corpus
          }
        : {
            packId: loaded.pack.packId,
            imageSha: image.image.os_sha,
            gateRuleSet: loaded.pack.gateRuleSet,
            corpus: loaded.pack.corpus,
            triggerConfig: loaded.pack.triggerConfig
          };
    registerPack(registry, loaded.pack);
    loadedPackIds.push(s3Pack.packId);
    const turn = runTurn(s3Pack, syntheticBootTurn(), { auditSink: new MemoryAuditSink() });
    if (turn.receipt.pack_id !== s3Pack.packId) {
      return { ok: false, code: "turn-spine-boot-failed", message: "boot turn receipt did not bind the loaded pack" };
    }
  }

  const payload: StatusPayload = {
    os_sha: image.image.os_sha,
    packs: loadedPackIds,
    head_adapter: config.head_adapter
  };
  return { ok: true, stdout: JSON.stringify(payload) };
}

export function assertLocalTarballUsable(tarballPath: string): CliResult {
  if (!existsSync(tarballPath)) return { ok: false, code: "tarball-missing", message: tarballPath };
  const bytes = readFileSync(tarballPath);
  if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
    return { ok: false, code: "corrupt-tarball-refused", message: "local package tarball is not gzip encoded" };
  }
  return { ok: true };
}

export function managedTree(target: string): string[] {
  return managedFiles.filter((relPath) => existsSync(path.join(target, relPath))).sort();
}

export function expectedManagedTree(): string[] {
  return [...managedFiles].sort();
}

function writeInstall(target: string, sourcePackageRoot: string): void {
  for (const relPath of managedFiles) {
    const fullPath = path.join(target, relPath);
    mkdirSync(path.dirname(fullPath), { recursive: true });
  }

  writeJson(path.join(target, configFileName), makeConfig());
  writeJson(path.join(target, installDirName, ".install.json"), {
    schema_version: markerVersion,
    managed_tree_hash: treeHash(expectedManagedTree())
  });
  writeFileSync(path.join(target, installDirName, "hooks", ".keep"), "", "utf8");
  writeFileSync(path.join(target, installDirName, "rails", ".keep"), "", "utf8");
  writeFileSync(path.join(target, installDirName, "state", ".keep"), "", "utf8");

  const pack = readJson(path.join(sourcePackageRoot, "fixtures", "phase0", "c08", "H", "valid-pack-loads", "input.json")) as {
    pack: DomainPackRaw;
  };
  writeJson(path.join(target, installDirName, "packs", "synthetic-pack.json"), pack.pack);

  copyFileSync(
    path.join(sourcePackageRoot, "fixtures", "phase0", "c09", "H", "fixture-image-boots-sha-reported", "cael.os.md"),
    path.join(target, installDirName, "image", "cael.os.md")
  );
}

function readValidConfig(target: string): ConfigShape | null {
  try {
    const raw = readJson(path.join(target, configFileName)) as Partial<ConfigShape>;
    if (raw.schema_version !== schemaVersion) return null;
    if (raw.head_adapter !== "stub") return null;
    if (raw.image !== "cael-os-light/image/cael.os.md") return null;
    if (!Array.isArray(raw.packs) || raw.packs.length !== 1 || raw.packs[0] !== "cael-os-light/packs/synthetic-pack.json") {
      return null;
    }
    if (!raw.model || raw.model.provider !== "stub" || typeof raw.model.client_key !== "string") return null;
    return raw as ConfigShape;
  } catch {
    return null;
  }
}

function isCompleteInstall(target: string): boolean {
  if (!readValidConfig(target)) return false;
  return expectedManagedTree().every((relPath) => existsSync(path.join(target, relPath)));
}

function findInitConflict(target: string): string | null {
  const entries = existsSync(target) ? readdirSync(target) : [];
  const allowed = new Set(["package.json", "package-lock.json", "npm-shrinkwrap.json", "node_modules", ".npmrc"]);
  for (const entry of entries) {
    if (!allowed.has(entry)) return `target contains unmanaged entry ${entry}`;
  }
  return null;
}

function makeConfig(): ConfigShape {
  return {
    schema_version: schemaVersion,
    model: {
      provider: "stub",
      client_key: "REPLACE_WITH_CLIENT_KEY_FOR_REAL_HEAD"
    },
    head_adapter: "stub",
    image: "cael-os-light/image/cael.os.md",
    packs: ["cael-os-light/packs/synthetic-pack.json"]
  };
}

function syntheticBootTurn() {
  return {
    userId: "install-user",
    sessionId: "install-session",
    turnId: "install-status-turn",
    subject: {
      loyalty_points: 80,
      vehicle_count: 1,
      tier: "gold"
    },
    object: {},
    query: "ưu đãi vàng",
    answerClaim: {
      text: "Bạn đủ điều kiện nhận ưu đãi vàng.",
      requiredEvidenceId: "ev-gold-offer",
      requiredTerms: ["đủ", "điều", "kiện", "ưu", "đãi", "vàng"]
    }
  };
}

function resolveTarget(target: string | undefined): string {
  return path.resolve(target ?? process.cwd());
}

function findPackageRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    if (existsSync(path.join(current, "package.json")) && existsSync(path.join(current, "fixtures"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return startDir;
    current = parent;
  }
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function treeHash(tree: string[]): string {
  return createHash("sha256").update(tree.join("\n")).digest("hex");
}

export function resetInstallForTest(target: string): void {
  rmSync(path.join(target, installDirName), { recursive: true, force: true });
  rmSync(path.join(target, configFileName), { force: true });
}

export function pathIsFile(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}
