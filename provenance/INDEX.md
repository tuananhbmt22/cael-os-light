# Provenance — how this software was produced

This package was not written in a single sitting by a single agent. It was
**manufactured by CAEL OS (uranus)** — a governance harness in which powerful
AI builders are bound to deterministic gates and independent review, and the
builder is never the sole judge of its own work. This folder contains the
actual governance records that produced the code in this repository, unedited.

## The production chain (what each record proves)

1. **`PHASE0-SPEC-LOCKED.md`** — the buildable specification. Before any code:
   drafted, then attacked by an independent refutation agent (10 findings, all
   folded), delta-verified, lock-conformance checked (3 more cures), and locked
   on the owner's sign-off. The spec carries its own hardening trail (§18).
2. **`RADIO_CONTRACT.json`** — the machine-checkable build contract minted from
   the locked spec: scope fence, hard rejects, execution slices S1–S6,
   winning conditions c01–c13, verification plan, merge contract. The build
   was dispatched only after this contract validated.
3. **`0712-PLAN_COOPER_RECORD.json`** — the multi-brain convergence record
   behind the contract (which agents converged, on what evidence, when).
4. **`0712-BUILD_COOPER_RECORD.json`** — the build-side record: 8 builder jobs
   (S1–S6b slices), court status, unresolved-issue count.
5. **`0712-BUILD-JUDGE-VERIFICATION.md`** — the independent judge's census at
   the merge gate, executed by a *different* AI than the builders: full test
   suite re-run (85/85), live install acceptance (offline tarball → init →
   boot), scope-fence diff audit (243 files, zero out-of-fence), client-data
   scan, and the honest caveats. The merged tree was verified byte-identical
   to the judged tree.

## Why this matters

Every winning condition in this package is machine-checkable, every build step
was judged on disk, and the records above are the same artifacts our internal
governance consumed — not marketing material written after the fact. This is
the standard delivery discipline of CAEL OS: **explainable code, legitimate
builds, verifiable delivery.** The same provenance folder ships with every
public repository we produce.

*License note: these records are covered by the repository LICENSE (evaluation
inspection permitted during the competition period).*
