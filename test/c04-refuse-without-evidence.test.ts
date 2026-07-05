import { describe, expect, it } from "vitest";
import { ground, runTurn, verify, TurnOutcome, MemoryAuditSink } from "../src/index.js";
import type { CorpusScope, S3Pack, TurnInput } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("c04 refuse-without-evidence", () => {
  it("H grounded-cited-answer cites grounded Vietnamese evidence byte-exact", () => {
    const fixture = readFixture<{ pack: S3Pack; input: TurnInput; expectedQuote: string }>(
      "../fixtures/phase0/c04/H/grounded-cited-answer/input.json"
    );
    const result = runTurn(fixture.pack, fixture.input, { auditSink: new MemoryAuditSink() });

    expect(result.outcome).toBe(TurnOutcome.Answer);
    expect(result.receipt.evidence_refs[0]?.quote).toBe(fixture.expectedQuote);
  });

  it("R ungrounded-refusal refuses and cites missing evidence", () => {
    const fixture = readFixture<{ corpus: CorpusScope; claim: string }>(
      "../fixtures/phase0/c04/R/ungrounded-refusal/input.json"
    );
    const result = verify(fixture.claim, ground("missing claim", fixture.corpus).units);

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe(TurnOutcome.RefuseEvidence);
    expect(result.cited[0]?.id).toBe("missing:evidence");
  });

  it("R decoy-abstention-floor refuses when true target is absent instead of using visible neighbor", () => {
    const fixture = readFixture<{ corpus: CorpusScope; claim: { text: string; requiredEvidenceId: string; requiredTerms: string[] } }>(
      "../fixtures/phase0/c04/R/decoy-abstention-floor/input.json"
    );
    const result = verify(fixture.claim, ground("renewal covered", fixture.corpus).units);

    expect(result.ok).toBe(false);
    expect(result.refusal_reason).toBe("required_evidence_absent");
    expect(result.cited[0]?.id).toBe("missing:ev-renewal-window");
  });

  it("M corrupt-corpus-unit degrades by ignoring corrupt units and refusing", () => {
    const fixture = readFixture<{ corpus: CorpusScope; claim: { text: string; requiredTerms: string[] } }>(
      "../fixtures/phase0/c04/M/corrupt-corpus-unit/input.json"
    );
    const result = verify(fixture.claim, ground("renewal covered", fixture.corpus).units);

    expect(result.ok).toBe(false);
    expect(result.refusal_reason).toBe("missing_evidence");
  });

  it("I same-refusal-on-replay returns identical refusal", () => {
    const fixture = readFixture<{ corpus: CorpusScope; claim: string }>(
      "../fixtures/phase0/c04/I/same-refusal-on-replay/input.json"
    );
    const first = verify(fixture.claim, ground("absent", fixture.corpus).units);
    const second = verify(fixture.claim, ground("absent", fixture.corpus).units);

    expect(first).toEqual(second);
  });

  it("S corpus-update-invalidates-old-citation refuses stale citation ids", () => {
    const fixture = readFixture<{
      corpus: CorpusScope;
      claim: { text: string; requiredEvidenceId: string; requiredTerms: string[] };
    }>("../fixtures/phase0/c04/S/corpus-update-invalidates-old-citation/input.json");
    const result = verify(fixture.claim, ground("renewal covered", fixture.corpus).units);

    expect(result.ok).toBe(false);
    expect(result.cited[0]?.id).toBe("missing:ev-renewal-window-old");
  });
});
