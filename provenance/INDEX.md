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

## Per-track build records

The `tracks/<track>/` folders hold governed build provenance for each real,
pack-backed track. Each folder points back to the pack code, the goal contract,
the builder report, the independent judge verdict, and the copied governance
records used to verify that build.

- **`tracks/p1-rbac/PROVENANCE.md`** — Taco Track 1 / P1, Enterprise Knowledge
  & Secure AI Search. The pack backs role-aware enterprise knowledge retrieval;
  its public build record passed with permission 49/50 honest, document_id
  49/50 honest, and zero client-data leaks.
- **`tracks/p2-eligibility/PROVENANCE.md`** — Taco Track 2 / P2, AI Mobility
  Growth & Engagement Platform. The pack backs eligibility logic; its public
  build record passed 40/40 honest, with anti-gaming verification by an
  independent strip-probe.

These are the first two tracks of the 12-track program. More track folders port
in as their packs become real.

## Why this matters

Every winning condition in this package is machine-checkable, every build step
was judged on disk, and the records above are the same artifacts our internal
governance consumed — not marketing material written after the fact. This is
the standard delivery discipline of CAEL OS: **explainable code, legitimate
builds, verifiable delivery.** The same provenance folder ships with every
public repository we produce.

*License note: these records are covered by the repository LICENSE (evaluation
inspection permitted during the competition period).*
