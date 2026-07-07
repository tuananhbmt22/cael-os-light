# VERDICT: PASS WITH HONEST DOC-ID GAP

Round 2 removes the handed-id route and scores from query-only inputs. Honest real run: permission 49/50, miss `[P035]`; document id 49/50, miss `[P031]`.

## Re-verify Table

| Gate | Verdict | Command | Observed |
| --- | --- | --- | --- |
| T1/T3/T4/T7 pack suite | PASS | `npm run build`; `npm test` in `packs/p1-rbac` | Build passed; 4 test files, 16 tests passed. Synthetic eval inputs are query/role/department only. |
| T2 honest real score | PASS | `py scripts\extract-real.py`; `node scripts\score-real.mjs` | Extracted 40 docs, 40 metadata rows, 50 eval rows. Permission 49/50 `[P035]`; document id 49/50 `[P031]`. |
| T5 showcase registry | PASS | `npm test`; `npm run typecheck` in `showcase` | 14 test files, 45 tests passed; typecheck passed. P1 refs are registered in `showcase/src/lib/registry.ts`. |
| T6 replay | PASS | `node scripts\score-real.mjs` | Regenerated `showcase/content/replays/p1-rbac.replay.json` with `public_scope:"internal"`. |
| T8 scans | PASS/PARTIAL | `npm run scan`; variable-built leak and credential scans | Showcase scan passed. Leak and credential scans returned no matches after replacing stale report text. `deploy:check` still refuses without manual preview-protection confirmation. |

## Honest Scores

- Permission: 49/50, miss `[P035]` only.
- Document id: 49/50, miss `[P031]`.
- The scored input in `scripts/score-real.mjs` now contains only `query`, `user_role`, and `user_department`.
- `src/identify.ts` has no handed-id or expected-id branch; it resolves from query text against runtime corpus/documents.

## Builder Delta

- `packs/p1-rbac/**`: replaced explicit-id retrieval with accent-folded lexical scoring over atomic document facts; added query-only synthetic fixtures and turn tests; real scorer now builds state from extracted docs plus metadata and keeps expected ids only under `expected`.
- `showcase/src/lib/registry.ts`: registered the P1 manifest and requirements refs.
- `showcase/content/clients.json`: kept P1 in the existing two-client registry because `showcase/test/content-registry.test.ts` hard-asserts two clients; renamed the track as My Tasco P1 RBAC and updated the score label to honest 49/50 document id.
- No `cael-os-light/**` edits. The pack imports only `@cael/os-light`.

## Gaps / Stop-and-Flag

- P031 remains a document-id miss under honest retrieval. It resolves the reimbursement document plus a related probation/leave document rather than the expected employee-handbook document. Permission remains correct.
- `showcase npm run deploy:check` was not forced because it requires manual preview-protection confirmation outside this build.
