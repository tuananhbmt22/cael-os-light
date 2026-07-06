import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createImageBootSession, hashImageBytes, loadImage } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("c09 image", () => {
  it("H fixture-image-boots-sha-reported boots and reports computed OS-SHA", () => {
    const fixture = readFixture<{ path: string }>("../fixtures/phase0/c09/H/fixture-image-boots-sha-reported/input.json");
    const imagePath = new URL(fixture.path, import.meta.url);
    const bytes = readFileSync(imagePath);
    const loaded = loadImage(fileURLToPath(imagePath));

    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.image.os_sha).toBe(hashImageBytes(bytes));
    expect(loaded.image.format).toBe("cael.os.md.v1");
  });

  it("I cache-prefix-identical-across-turns returns byte-identical prefix and stable hash", () => {
    const fixture = readFixture<{ path: string }>("../fixtures/phase0/c09/I/cache-prefix-identical-across-turns/input.json");
    const imagePath = fileURLToPath(new URL(fixture.path, import.meta.url));
    const first = loadImage(imagePath);
    const second = loadImage(imagePath);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.image.cachedPrefix).toBe(second.image.cachedPrefix);
    expect(first.image.prefixHash).toBe(second.image.prefixHash);
  });

  it("R sha-mismatch-boot-refused refuses expected OS-SHA drift", () => {
    const fixture = readFixture<{ path: string; expected_os_sha: string }>(
      "../fixtures/phase0/c09/R/sha-mismatch-boot-refused/input.json"
    );
    const loaded = loadImage(fileURLToPath(new URL(fixture.path, import.meta.url)), { expectedOsSha: fixture.expected_os_sha });

    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error.code).toBe("sha-mismatch");
  });

  it("M truncated-image-refused refuses malformed image bytes", () => {
    const fixture = readFixture<{ path: string }>("../fixtures/phase0/c09/M/truncated-image-refused/input.json");
    const loaded = loadImage(fileURLToPath(new URL(fixture.path, import.meta.url)));

    expect(loaded.ok).toBe(false);
    if (loaded.ok) return;
    expect(loaded.error.code).toBe("malformed-image");
  });

  it("S mid-session-image-swap-refused keeps boot immutable", () => {
    const fixture = readFixture<{ first: string; second: string }>(
      "../fixtures/phase0/c09/S/mid-session-image-swap-refused/input.json"
    );
    const session = createImageBootSession();
    const first = session.boot(fileURLToPath(new URL(fixture.first, import.meta.url)));
    const second = session.boot(fileURLToPath(new URL(fixture.second, import.meta.url)));

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error.code).toBe("image-swap-refused");
  });
});
