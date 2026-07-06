# @cael/os-light

**cael-os-light** is an installable agentic-kernel harness: the runtime
dependency our client solutions boot on. It binds each AI-agent turn to
deterministic gates, typed receipts, and verifiable delivery — so a business
gives us a concrete problem, and the agent's behavior stays explainable,
auditable, and honest by construction.

This repository is the **AABW 2026 judge-facing submission**: the harness plus
two shipped **track packs** — [`packs/p1-rbac`](./packs/p1-rbac) and
[`packs/p2-eligibility`](./packs/p2-eligibility) — each an independently
loadable, synthetically-evaluated solution built on the same kernel. Browse the
live solution gallery at **[app.nhaccael.com](https://app.nhaccael.com)**.

## Quickstart — run the pack evals (2 commands)

From this directory (`cael-os-light/`):

```bash
npm run packs:install   # install both track packs (kernel vendored offline; test runner from npm)
npm run packs:eval      # run both packs' synthetic evals (vitest)
```

Expected result — both packs green, **32 tests** total:

```
@cael/pack-p1-rbac         Test Files 4 passed (4)   Tests 16 passed (16)
@cael/pack-p2-eligibility  Test Files 5 passed (5)   Tests 16 passed (16)
```

Everything runs on **synthetic fixtures** — no client data exists in this
repository. The kernel (`@cael/os-light`) installs offline from a vendored
tarball in each pack's `vendor/`; the test runner (`vitest`) installs from the
npm registry.

## Pack-per-track architecture (in plain words)

Domain behavior is **data, not forked code**. The kernel ships one turn spine
and one gate engine; each business track is a **pack** — a declarative bundle
under `packs/<track>/` that states its corpus recipe, gate rule-set (with
threshold-derivation evidence), entity/state schemas, typed receipts, and scored
surfaces. Every pack loads through the **same** `loadPack()` seam
([`src/pack/pack-loader.ts`](./src/pack/pack-loader.ts)) and is refused with a
named error if malformed. You add a track by adding a pack; the kernel does not
change.

- **p1-rbac** — closed-world, RBAC-class access decisions (archetype A): allow /
  deny over document metadata with cited evidence and a generic user-facing
  refusal.
- **p2-eligibility** — deterministic state-rule eligibility (archetype B) with
  ranked, never-empty recommendations and aligned notification templates.

Each pack consumes the kernel as the vendored `@cael/os-light` tarball in
`packs/<track>/vendor/` and loads through the unchanged pack loader — proof that
a new solution is a data drop-in, not a rewrite.

Produced by **CAEL OS (uranus)** — see [`provenance/`](./provenance/INDEX.md)
for the actual governance records behind this build (spec hardening trail,
machine-checkable build contract, multi-agent convergence records, and the
independent judge's verification census). Explainable code, legitimate builds.

## What ships in the harness (Phase-0)

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
- **Pack loader** — domain behavior is data: a pack declares its corpus recipe,
  gate rule-set (with threshold derivation evidence), entity and state schemas,
  receipts, notification templates, and scored surfaces. Malformed packs are
  refused with named errors.
- **Eval harness** — L1 headless scored functions + an L2 two-session
  composition runner with recorded, replayable provenance.
- **Head-adapter seam** — the model is a swappable role under a conformance
  suite; this package ships the offline stub adapter and the suite itself.

Zero runtime dependencies. All kernel winning conditions (c01–c13) proven on
synthetic fixture packs — no client data exists in this repository.

## Run the harness's own suite (optional)

```bash
npm install   # dev dependencies (vitest, typescript)
npm test      # kernel acceptance suite (c01–c13, s5, unit)
```

The CLI (`npx cael-os-light init --fixture`, `npx cael-os-light status`) becomes
available after `npm run build`; see [`provenance/`](./provenance/INDEX.md) for
the full install-acceptance proof.

## License

**Proprietary — all rights reserved.** This repository is published for
**demonstration and evaluation during the AABW 2026 competition period only**;
see [`LICENSE`](./LICENSE). Production and commercial use require a separate
written agreement. Contact: via app.nhaccael.com.
