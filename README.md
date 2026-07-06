# @cael/os-light

**cael-os-light** is an installable agentic-kernel harness: the runtime
dependency our client solutions boot on. It binds AI-agent turns to
deterministic gates, typed receipts, and verifiable delivery — so a business
gives us a concrete problem, and the agent's behavior stays explainable,
auditable, and honest by construction.

Produced by **CAEL OS (uranus)** — see [`provenance/`](./provenance/INDEX.md)
for the actual governance records behind this build (spec hardening trail,
machine-checkable build contract, multi-agent convergence records, and the
independent judge's verification census). Explainable code, legitimate builds.

## What ships in Phase-0 (this package)

- **Turn spine** — identity → route (ambiguous → clarify) → gated identify →
  gate decision → grounded answer or evidence-cited refusal → verify →
  typed receipt → per-user ledger append. No answer path bypasses the gate.
- **Gate engine, one contract, three archetypes** — A: closed-world decision
  matrix (RBAC-class); B: deterministic state-rules with ranked, never-empty
  recommendations; C: open-world token gate with tri-state evidence
  (present / absent / unknown) and honest fallback.
- **Typed receipts + dual-channel output** — user channel stays generic on
  deny; the audit channel carries resolved ids. Validate before render;
  invalid structure degrades locally, never crashes the turn.
- **goal-light** — a persistent user-goal ledger (records, lifecycle,
  relations) surviving restarts, per-user isolated.
- **Pack loader** — domain behavior is data: a Part-2 pack declares its
  corpus recipe, gate rule-set (with threshold derivation evidence), entity
  and state schemas, receipts, notification templates, and scored surfaces.
  Malformed packs are refused with named errors.
- **Eval harness** — L1 headless scored functions + an L2 two-session
  composition runner with recorded, replayable provenance.
- **Head-adapter seam** — the model is a swappable role under a conformance
  suite; this package ships the offline stub adapter and the suite itself.

Zero runtime dependencies. All winning conditions (c01–c13) proven on
synthetic fixture packs — no client data exists in this repository.

## Install (2 commands, fully offline)

```bash
npm install <cael-os-light tarball>   # local tarball, no registry needed
npx cael-os-light init --fixture      # installs folders + fixture image + synthetic pack
npx cael-os-light status              # → {os_sha, packs, head_adapter}
```

Or run the full acceptance proof: `npm run acceptance:install`.

## License

**Proprietary — all rights reserved.** This repository is published for
**demonstration and evaluation during the AABW 2026 competition period only**;
see [`LICENSE`](./LICENSE). Production and commercial use require a separate
written agreement. Contact: via app.nhaccael.com.
