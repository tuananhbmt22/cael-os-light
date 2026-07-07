# VERDICT: PASS

P2 eligibility pack is built and honestly scores 40/40 on the real 40-row Public_Evaluation. The scored function is state-driven, question-independent, and does not read scoring-answer fields.

## Re-verify Table

| Gate | Verdict | Command | Observed |
| --- | --- | --- | --- |
| T1 pack build/loader | PASS | `npm run build`; `npm test` in `packs/p2-eligibility` | Build passed. 5 test files, 16 tests passed. Loader accepts valid pack and refuses template-trigger misalignment, missing threshold derivation, and undeclared state ref. |
| T2 honest real score | PASS | `py scripts\extract-real.py`; `node scripts\score-real.mjs` in `packs/p2-eligibility` | Extracted 50 users, 50 vehicles, 12 services, 6 templates, 40 eval rows. Recommendation 40/40, misses `[]`. Question probe: 40 rows checked, mismatches `[]`. Same-user invariance: 27 users checked, mismatches `[]`. |
| T3 aggregation | PASS | `npm test` in `packs/p2-eligibility` | Multi-vehicle same-vehicle coupling, cross-vehicle union, rank/cap-3, OR-rule dedupe, MonthlyPass, registration DocWallet, and fallback tests passed. |
| T4 notification | PASS | `npm test` in `packs/p2-eligibility` | Deadline/state notifications fire N001/N002/N003/N006; fallback fires N004/N005; pack-load alignment validation passed; dispositions recorded. |
| T5 showcase registry | PASS | `npm test`; `npm run typecheck` in `showcase` | 14 test files, 45 tests passed; typecheck passed. P2 manifest and requirements refs are registered in `showcase/src/lib/registry.ts`. |
| T6 replay | PASS | `node scripts\score-real.mjs` in `packs/p2-eligibility` | Generated `showcase/content/replays/p2-eligibility.replay.json` as `showcase.replay.v1`, archetype `B`, `public_scope:"internal"`, ranked candidates and `fallback_used` card field. The public 40-row real run had no fallback row; fallback behavior is covered in synthetic tests. |
| T7 receipts | PASS | `npm test` in `packs/p2-eligibility` | Receipts validate against `receiptSchema`; each ranked pick carries a firing rule; `pack_id`, `image_sha`, confidence, and zero second-brain calls verified. |
| T8 scans | PASS | `npm run scan` in `showcase`; `rg -n --glob '!node_modules/**' --glob '!dist/**' --glob '!.data/**' 'cael-os-light/src|@cael/os-light/' packs\p2-eligibility`; `Get-ChildItem -Path 'packs\p2-eligibility','showcase\content' -Recurse -Filter *.xlsx -File`; `rg -n 'expected' packs\p2-eligibility\src\p2-recommend.ts` | Showcase scan: `SCAN_PASS zero secrets, zero forbidden public naming, zero unpermitted client names.` Targeted scans returned no source-internal imports, no committed workbook files, and no scoring-answer string in `p2_recommend`. |

## Honest Score

- Recommendation: 40/40 public rows, misses `[]`.
- `reports/l1-score-report.json` contains aggregate numbers plus row/user ids only.
- Real extracts and row-level replay NDJSON live under gitignored `packs/p2-eligibility/.data/`.

The scored function path is narrow:

```ts
export function p2_recommend(state: unknown, input: unknown): { recommendation: string[] } {
  return { recommendation: evaluateP2Recommendations(state, input).recommendation };
}

export function evaluateP2Recommendations(state: unknown, input: unknown): P2RecommendationDecision {
  void input;
  const { user, vehicles } = selectState(state);
  // per-vehicle engine calls, dedupe, final rank/cap/fallback
}
```

`score-real.mjs` builds cases as `input={ user_id, question }`, `state={ user, vehicles }`, and scoring answers only under `expected`.

## Builder Delta

- `packs/p2-eligibility/**`: created the P2 pack, copied the P1 vendored tarball, added FIX-A eligibility rule data, state-driven `p2_recommend`, per-user vehicle aggregation, notification declarations, receipts, synthetic fixture battery, real extractor/scorer, lockfile, and aggregate real score report.
- `showcase/content/**`: added P2 manifest, judge requirements, real-run internal replay, and one P2 track entry under the existing eligibility client to preserve the hard two-client registry test.
- `showcase/src/lib/registry.ts`: registered P2 manifest and requirements refs only; no layout, logic, or component changes.
- `docs/handoff/jobs/600-0701-p2-eligibility-build/**`: added preflight and final report. The brief had one non-prefixed job-folder sentence; reports use the dispatch anchor path.

No `cael-os-light/**`, `cael.agent.os/**`, `v3/**`, boot artifact, or generated OS artifact was edited. The dirty deletes under jobs 494-496 were pre-existing and unrelated; I did not touch them.

One implementation delta from the brief: the tarball’s public index does not export `createEligibilityRuleSet`; it does export `buildRuleSet`. The pack imports only `@cael/os-light` and uses `buildRuleSet(p2EligibilityRuleSet)` to reach the same archetype-B engine through the public harness surface. The per-vehicle engine instance uses an uncapped copy so duplicate OR branches cannot consume the engine cap before P2 dedupes labels; the locked cap is applied once after user-level union.

## Notification Dispositions

- MonthlyPass has no template in v1; disposition is recommendation-only, no notification.
- N003 copy is corrected to cover registration-driven and inspection-driven document-wallet deadlines.
- N001 copy is corrected to cover never-activated civil-liability insurance as well as renewal/expiry.

## Gaps / Stop-and-Flag

No scoring gap remains. Non-blocking notes: npm install reported advisory warnings in mirrored dev dependencies; I did not change package versions. The public real run did not include a fallback-used row for the showcase replay, so the real replay shows `fallback_used:false`; fallback is still verified in the synthetic pack suite.

