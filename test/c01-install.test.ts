import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertLocalTarballUsable,
  configFileName,
  expectedManagedTree,
  initFixture,
  managedTree,
  status
} from "../src/cli/runtime.js";
import { readFixture } from "./helpers.js";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));

describe("c01 install/init CLI logic", () => {
  it("H clean-project-boot creates the deterministic managed tree and boots status", () => {
    const target = tempProject();
    writeFileSync(path.join(target, "package.json"), "{\"private\":true}\n", "utf8");
    const expectedTree = readFixture<string[]>("../fixtures/phase0/c01/H/clean-project-boot/expected-tree.json");

    const initialized = initFixture({ target, packageRoot });
    expect(initialized.ok).toBe(true);
    expect(managedTree(target)).toEqual(expectedTree);

    const booted = status({ target, packageRoot });
    expect(booted.ok).toBe(true);
    if (!booted.ok) return;
    const payload = JSON.parse(booted.stdout ?? "{}") as { os_sha?: string; packs?: string[]; head_adapter?: string };
    expect(payload.os_sha).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.packs).toEqual(["synthetic-eligibility-vn"]);
    expect(payload.head_adapter).toBe("stub");
  });

  it("R init-on-dirty-project-refused refuses unmanaged existing files", () => {
    const target = tempProject();
    const fixture = readFixture<{ dirty_file: string; expected_code: string }>(
      "../fixtures/phase0/c01/R/init-on-dirty-project-refused/input.json"
    );
    writeFileSync(path.join(target, fixture.dirty_file), "dirty\n", "utf8");

    const result = initFixture({ target, packageRoot });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe(fixture.expected_code);
  });

  it("M corrupt-tarball-refused rejects a non-gzip local package tarball", () => {
    const fixture = readFixture<{ path: string; expected_code: string }>(
      "../fixtures/phase0/c01/M/corrupt-tarball-refused/input.json"
    );
    const tarballPath = fileURLToPath(new URL(`../fixtures/phase0/c01/M/corrupt-tarball-refused/${fixture.path}`, import.meta.url));
    const result = assertLocalTarballUsable(tarballPath);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe(fixture.expected_code);
  });

  it("I re-init-noop leaves an existing complete install unchanged", () => {
    const target = tempProject();
    const first = initFixture({ target, packageRoot });
    const before = managedTree(target);
    const second = initFixture({ target, packageRoot });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.noOp).toBe(true);
    expect(managedTree(target)).toEqual(before);
    expect(managedTree(target)).toEqual(expectedManagedTree());
  });

  it("S stale-config-regenerated repairs stale config before status boot", () => {
    const target = tempProject();
    initFixture({ target, packageRoot });
    const fixture = readFixture<{ stale_config: unknown; expected_head_adapter: string }>(
      "../fixtures/phase0/c01/S/stale-config-regenerated/input.json"
    );
    writeFileSync(path.join(target, configFileName), `${JSON.stringify(fixture.stale_config, null, 2)}\n`, "utf8");

    const booted = status({ target, packageRoot });
    expect(booted.ok).toBe(true);
    if (!booted.ok) return;
    const payload = JSON.parse(booted.stdout ?? "{}") as { head_adapter?: string };
    const regeneratedConfig = JSON.parse(readFileSync(path.join(target, configFileName), "utf8")) as { schema_version?: string };

    expect(payload.head_adapter).toBe(fixture.expected_head_adapter);
    expect(regeneratedConfig.schema_version).toBe("cael-os-light.config.v1");
  });
});

function tempProject(): string {
  return mkdtempSync(path.join(tmpdir(), "cael-os-light-c01-"));
}

