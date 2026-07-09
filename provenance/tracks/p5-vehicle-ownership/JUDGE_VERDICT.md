# P5 Vehicle Ownership — Lane Judge Verdict

**Verdict:** CLEAN — build meets all 5 winning conditions; delivered awaiting_verification (Sonnet-5 drive + Kajima live per the contract ladder).

**Judge:** lane-Claude (goal-20260707-0758), independent of the codex builder (job #602). Verified on disk, not from the builder report.

## Independently re-run
- **Pack vitest** (`node node_modules/vitest/vitest.mjs run`): 5 files / 9 tests PASS — loader, deterministic rules, zero-leak, 15/15 synthetic scoring, receipts.
- **Showcase typecheck** (`tsc --noEmit`): exit 0, clean.
- **Showcase vitest**: 30 files pass / 1 skipped (171 pass, 172 total).

## Anti-eval-gaming probes (temporary judge test, removed after run)
- **Strip the `category` label from every eval input → still 15/15.** The label is NOT load-bearing; `classifyTask` runs on the query text only (`scoredInputToRequest` never passes `category` to `runP5Turn`). Not gamed.
- **Off-fixture deadline math:** VEH008 inspection 2026-10-22 with pinned now 2026-07-07 → 107 days, computed by real UTC date math (not a lookup table).
- **Cross-user refusal generalizes:** off-fixture probes (U005→U008 by mention; U001→VEH002 by ownership) both refuse with no leak.

## Winning conditions
1. Pack suite green incl. 15/15 eval with pinned `now=2026-07-07` — independently re-run. ✓
2. Showcase tsc clean + vitest green; `listPublicClients()` includes p5 (curated-listing test); fused fan-out consults p5 with a receipt (fusion test: receipts=5); question bank 8 entries 100% gate-validated (gate-validation 42 entries). ✓
3. Cross-user privacy ask refuses with no data-existence leak (t3-zero-leak + judge probes). ✓
4. Provenance records present under `provenance/tracks/p5-vehicle-ownership/`. ✓
5. Fence respected: only `packs/p5-*`, `provenance/tracks/p5-*`, `showcase/**` (wiring seams + expected test count-bumps), and builder-job evidence. ✓

## Eval-table check (re-derived from corpus + pinned now)
All 15 emitted `primary_check` match the operator reference table; deadline day-counts independently confirmed (VEH001 inspection=13, VEH012 civil=11, VEH020 inspection=18, VEH001 civil=39). Cases 6/9/10 defensible primary choices verified against the deterministic rules, not hand-tuned to the runner.

## Showcase test edits reviewed
All 7 modified test files are legitimate count-bumps (4→5 real packs; 34→42 bank entries = +8 for p5) plus NEW positive assertions for p5 (public listing, fan-out receipt, bank ≥8 + VN). No test weakened.

## Residual (deferred to RADIO ladder, not lane scope)
- Sonnet-5 sub-agent drive (novel probes) and Kajima live are the post-merge verification ladder — goal stays awaiting_verification.
- No deploy, no PR push, no live VMA integration (all out of scope).
