import { describe, expect, it } from "vitest";
import { readFixture } from "./helpers.js";
import { createStubHeadAdapter } from "../src/adapter/stub-adapter.js";
import { runConformance, type ConformanceTranscript } from "../src/adapter/conformance.js";
import { mapAdapterError, stableCachePrefixHash } from "../src/adapter/head-adapter.js";

describe("c12 adapter conformance", () => {
  it("H fixed-transcript-replay-green passes through the replay suite", () => {
    const transcript = goldenTranscript();
    const result = runConformance(createStubHeadAdapter(), transcript);

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.replayCount).toBe(transcript.replayCount);
  });

  it("R envelope-drift-detected catches a mutated golden envelope", () => {
    const transcript = goldenTranscript();
    const fixture = readFixture<{ value: string; expected_failure: string }>(
      "../fixtures/phase0/c12/R/envelope-drift-detected/input.json"
    );
    transcript.turns[0]!.expectedEvents[0]!.name = fixture.value;

    const result = runConformance(createStubHeadAdapter(), transcript);

    expect(result.ok).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(fixture.expected_failure);
  });

  it("M adapter-error-mapping-cases maps transient to retry and fatal to terminal", () => {
    readFixture("../fixtures/phase0/c12/M/adapter-error-mapping-cases/input.json");

    expect(mapAdapterError({ kind: "transient", code: "timeout" })).toEqual({
      outcome: "retry",
      retryable: true,
      code: "timeout"
    });
    expect(mapAdapterError({ kind: "fatal", code: "invalid_request" })).toEqual({
      outcome: "terminal",
      retryable: false,
      code: "invalid_request"
    });
  });

  it("I cache-prefix-hash-stable-across-replays is deterministic", () => {
    const fixture = readFixture<{ cachePrefix: string; expected_hash: string; replays: number }>(
      "../fixtures/phase0/c12/I/cache-prefix-hash-stable-across-replays/input.json"
    );
    const hashes = Array.from({ length: fixture.replays }, () => stableCachePrefixHash(fixture.cachePrefix));

    expect(new Set(hashes).size).toBe(1);
    expect(hashes[0]).toBe(fixture.expected_hash);
  });

  it("S adapter-version-bump-reruns-suite runs the same suite for another adapter instance", () => {
    const fixture = readFixture<{ adapters: string[] }>("../fixtures/phase0/c12/S/adapter-version-bump-reruns-suite/input.json");

    for (const adapterName of fixture.adapters) {
      const result = runConformance(createStubHeadAdapter({ name: adapterName }), goldenTranscript());
      expect(result.ok).toBe(true);
      expect(result.adapter).toBe(adapterName);
    }
  });
});

function goldenTranscript(): ConformanceTranscript {
  return structuredClone(
    readFixture<ConformanceTranscript>("../fixtures/phase0/c12/H/fixed-transcript-replay-green/input.json")
  );
}

