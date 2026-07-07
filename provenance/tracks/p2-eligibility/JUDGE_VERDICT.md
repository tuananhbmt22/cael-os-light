# JUDGE VERDICT — 0701 Taco Track-2 (P2) `packs/p2-eligibility` (cael-os-light DOGFOOD #2)

**Judge:** RADIO lane (Opus 4.8), on disk · **Builder:** Codex 5.5 (job 600-0701-p2-eligibility-build) · **Rounds:** 1
**Verdict:** **PASS** — 40/40 honest + independently re-verified; anti-gaming strip-probe holds; dogfood + fence clean. cooper_required=false (PLAN cooper already closed); this is the build judged in-lane.

## The anti-gaming story (builder ≠ judge working as designed — the P1 lesson applied as a standing gate)

Before dispatch, the judge built an **independent reference implementation** of the FIX-A rules (Python, straight from the raw `vetc_track1_dataset_participants.xlsx`) and confirmed **40/40 exact set-match** (mean Jaccard 1.0) on the 40-row public eval — verifying the contract's load-bearing "40/40 via verify_p2_fixA.py" claim, whose proof script was **absent** from the lane worktree.

After the build, the judge did NOT trust the builder's report. Independent checks on disk:
1. **Rebuilt `dist/` from source** (`tsc`) and **re-extracted** the real data via `CAEL_P2_DATA_ROOT` → the builder's `score-real.mjs` reproduces **40/40, misses []** (not a stale/tampered dist or `.data`).
2. **Code-read** the scored path: `p2_recommend(state, input)` does `void input;` (question structurally discarded) and reads only `state.user`/`state.vehicles`; `score-real.mjs` places `expected_recommendation` ONLY in `evalCase.expected`, never in `input`/`state`. No handed-in-answer path exists (contrast P1 round-1's tautology).
3. **Independent strip-probe** (`judge_strip_probe.mjs`): imported the builder's COMPILED `p2_recommend`, built state myself from raw `.data` (expected stripped), fed each row a **shuffled** question, and diffed the output against the judge's **own oracle** → **40/40 match**. Two independent implementations agree under adversarial inputs.

Where P1 round-1 collapsed to permission 7/50 under this exact probe, P2 holds at 40/40. The recommendation is a genuine deterministic function of user+vehicle state, question-independent (probe: 40 rows, 0 mismatches; same-user invariance: 27 users, 0 mismatches).

## Acceptance (T1–T8), re-run on disk by the judge

- **T1** loader accept + refuse: PASS — pack vitest 16/16; loader refuses `template-trigger-misalign`, `no-derivation`, `undeclared-state-ref` with the harness's expected error codes (real assertions, not vacuous).
- **T2** honest real score + anti-gaming: PASS — 40/40 reproduced on fresh rebuild+re-extract; independent strip-probe (query-only + shuffled question) = 40/40 vs judge oracle; `.data/` gitignored; report is numbers+ids only.
- **T3** per-user vehicle aggregation: PASS — the `SYN-COUPLING` test exercises the same-vehicle AND-coupling counterexample (age≥3+roadside-active vehicle A, age<3+roadside-inactive vehicle B → ROADSIDE does NOT fire → fallback); union/dedupe/rank/cap-3 and never-empty fallback all covered.
- **T4** notification engine: PASS — triggers fire N001/N002/N003/N006, fallback N004/N005; pack-load template↔trigger alignment validated; documented dispositions (no MonthlyPass template; N003 corrected for registration-driven DocWallet; N001 corrected for never-activated insurance).
- **T5** port manifest + showcase: PASS — P2 `track_port_manifest.v1` + requirements registered in `registry.ts` (registration-only, no layout/logic); showcase vitest 45/45; typecheck implicit in suite green.
- **T6** replay: PASS — `showcase.replay.v1` archetype **B**, `public_scope:"internal"`, ranked candidates + `fallback_used` card. Public 40 had no fallback row (healthy users are hidden-set); fallback is covered in the synthetic suite (disclosed, correct).
- **T7** receipts + graded-cooper: PASS (pack tests; firing_rule per pick, pack_id, image_sha, zero second-brain on ordinary rows).
- **T8** scans + offline: PASS — client-data leak scan (real VI names/routes) clean over the committed surface; zero secrets; both suites green offline; vendored `@cael/os-light` tarball **byte-identical** to P1's (`b35bd57f…`, dogfood integrity).

## Fence / invariants

All writes in-fence: `packs/p2-eligibility/**` (new), `showcase/content/**` (manifest/requirements/replay + clients.json P2 track under the existing eligibility client to preserve the hard 2-client test), `showcase/src/lib/registry.ts` (registration lines only), and the job folder. Imports = `@cael/os-light` only (8×, zero `cael-os-light/src` imports). ZERO `cael-os-light/**`, `cael.agent.os/**`, `v3/**`, or generated-OS-artifact edits. Index clean (nothing staged). No per-row/user_id special-casing; thresholds are the LOCKED FIX-A values (reg `<=60` NOT widened — hidden-eval discipline held).

## Disclosed residual (surfaced to RADIO — not a blocker)

- The `494/495/496-cockpit-*` job-dir deletions in the worktree are **session-boot auto-archive** (7-day expiry moved them to `data/_archive/jobs/`), NOT builder writes (builder confirmed; judge confirmed via `_archive` presence). These are stripped/restored before delivery so they do not ride the lane diff.
- 40/40 is the **PUBLIC** number; a `Hidden_Evaluation` exists and the registration window `[61,179]` is under-determined — 40/40 must NOT be reported as the hidden expectation.
