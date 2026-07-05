import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const npm = "npm";
const npx = "npx";
const tempRoot = mkdtempSync(path.join(tmpdir(), "cael-os-light-install-acceptance-"));
const packDir = path.join(tempRoot, "pack");
const projectDir = path.join(tempRoot, "project");
const expectedTree = JSON.parse(
  readFileSync(path.join(repoRoot, "fixtures", "phase0", "c01", "H", "clean-project-boot", "expected-tree.json"), "utf8")
);

const transcript = [];
mkdirSync(packDir, { recursive: true });
mkdirSync(projectDir, { recursive: true });

try {
  run(npm, ["run", "build"], repoRoot, "build package");
  run(npm, ["pack", "--pack-destination", packDir, "--silent"], repoRoot, "pack local tarball");
  const tarball = findTarball(packDir);

  transcript.push(`COMMAND 1: npm install ${tarball} --offline --no-audit --no-fund`);
  run(npm, ["install", tarball, "--offline", "--no-audit", "--no-fund"], projectDir, "install local tarball offline", {
    npm_config_offline: "true"
  });

  transcript.push("COMMAND 2: npx cael-os-light init --fixture");
  run(npx, ["cael-os-light", "init", "--fixture"], projectDir, "init fixture", { npm_config_offline: "true" });

  const statusRun = run(npx, ["cael-os-light", "status"], projectDir, "status", { npm_config_offline: "true" });
  const statusJson = parseStatus(statusRun.stdout);
  assertStatus(statusJson);
  const tree = managedTree(projectDir);
  assertEqual(tree, expectedTree, "post-init managed tree");

  console.log("INSTALL ACCEPTANCE PASS");
  for (const line of transcript) console.log(line);
  console.log(`STATUS JSON: ${JSON.stringify(statusJson)}`);
  console.log(`POST-INIT TREE: ${JSON.stringify(tree)}`);
} catch (error) {
  console.error("INSTALL ACCEPTANCE FAIL");
  for (const line of transcript) console.error(line);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (process.env.CAEL_KEEP_ACCEPTANCE_TEMP !== "1") rmSync(tempRoot, { recursive: true, force: true });
}

function run(command, args, cwd, label, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    shell: true
  });
  if (result.status !== 0) {
    throw new Error(
      `${label} failed with exit ${result.status}\n${result.error ? `error:\n${result.error.message}\n` : ""}stdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

function findTarball(dir) {
  const files = readdirSync(dir).filter((file) => file.endsWith(".tgz"));
  if (files.length !== 1) throw new Error(`expected one tarball in ${dir}, found ${files.length}`);
  return path.join(dir, files[0]);
}

function parseStatus(stdout) {
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  const last = lines[lines.length - 1];
  if (!last) throw new Error("status emitted no JSON");
  return JSON.parse(last);
}

function assertStatus(statusJson) {
  if (!/^[a-f0-9]{64}$/.test(statusJson.os_sha)) throw new Error(`invalid os_sha: ${statusJson.os_sha}`);
  assertEqual(statusJson.packs, ["synthetic-eligibility-vn"], "status packs");
  if (statusJson.head_adapter !== "stub") throw new Error(`expected head_adapter stub, got ${statusJson.head_adapter}`);
}

function managedTree(projectDir) {
  const candidates = [
    "cael-os-light.config",
    "cael-os-light/.install.json",
    "cael-os-light/hooks/.keep",
    "cael-os-light/image/cael.os.md",
    "cael-os-light/packs/synthetic-pack.json",
    "cael-os-light/rails/.keep",
    "cael-os-light/state/.keep"
  ];
  return candidates.filter((relPath) => existsSync(path.join(projectDir, relPath))).sort();
}

function assertEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) throw new Error(`${label} mismatch\nexpected ${expectedJson}\nactual   ${actualJson}`);
}
