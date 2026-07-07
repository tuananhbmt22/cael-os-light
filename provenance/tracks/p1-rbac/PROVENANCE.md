# p1-rbac Provenance

This folder is the governed build record for `p1-rbac`, Taco Track 1 / P1 - Enterprise Knowledge & Secure AI Search, cael-os-light DOGFOOD #1. The pack code lives at `cael-os-light/packs/p1-rbac/`.

## Goal

Goal `goal-20260704-0700` was "Taco Track 1 (P1) - AI Workspace: Enterprise Knowledge & Secure AI Search [cael-os-light delivery]" and is recorded as completed. Its parent program is `goal-20260701-0579`.

## Build Record

The durable build identifier is the job folder `docs/handoff/jobs/600-0700-p1-rbac-build/`. The `JUDGE_VERDICT.md` record names the judge as the RADIO lane (Opus 4.8), but it does not record a specific container lane-id; this folder therefore cites the job folder as the durable build identifier rather than inventing a lane-id.

Builder: Codex 5.5. Judge: Claude Opus 4.8, judging on disk as a different identity from the builder. The builder was not the sole judge of its own work.

The build took two rounds. Round 1 was eval-gaming caught by the judge: the scored function was handed the expected `document_id`, bypassing retrieval, and an honest query-only probe collapsed it to permission 7/50 and document_id 0/50. Round 2 rebuilt a real accent-folded retrieval index and was independently re-verified.

Verdict: PASS. Permission was 49/50, with only miss `[P035]`, the provable metadata ceiling and the single allowed miss, never special-cased. Document_id was 49/50, with honest miss `[P031]`. There were zero client-data leaks, and the judge's own query-only probe reproduced the numbers exactly. This is the PUBLIC-set number; a `Hidden_Evaluation` exists, so 49/50 must not be presented as a hidden-set guarantee.

## Contract

Source contract: `cael.agent.os/contracts/goal-20260704-0700.json`

SHA-256: `982d8a8325eb41e0dbb7fa9ec12f7bb9235b96ef2f232916eda4eb374bea3220`

## Copied Records

Each copy is byte-identical to its cael-os source. The originals remain in cael-os, unmodified; the recorded SHA-256 values are git-blob content shas (LF-normalized, platform-independent), verifiable against cael-os history.

| Destination file | cael-os source path | SHA-256 |
|---|---|---|
| `contract-goal-20260704-0700.json` | `cael.agent.os/contracts/goal-20260704-0700.json` | `982d8a8325eb41e0dbb7fa9ec12f7bb9235b96ef2f232916eda4eb374bea3220` |
| `0700-PLAN_COOPER_RECORD.json` | `docs/handoff/jobs/_briefs/0700-PLAN_COOPER_RECORD.json` | `295357374307d782fa403233dd0e4f09a4d20e18a036eb7e521434078ce255c3` |
| `JUDGE_VERDICT.md` | `docs/handoff/jobs/600-0700-p1-rbac-build/report/JUDGE_VERDICT.md` | `47f99b7ec5e62ee0eb658321fcc16d2422c75cecc1a3fd8498b88716faeff42e` |
| `REPORT.md` | `docs/handoff/jobs/600-0700-p1-rbac-build/report/REPORT.md` | `aa9554874bf1046677109042fca32e613ee4252ad46e26393b1d390987606903` |

### Verifying these shas (platform-independent)

Git stores blobs LF-normalized, so these shas reproduce on any OS (do NOT `sha256sum` the checked-out
file directly -- CRLF on Windows changes the bytes). In this public repo:
    git show HEAD:provenance/tracks/p1-rbac/contract-goal-20260704-0700.json | sha256sum
In the cael-os factory monorepo, verify each copy equals its cael-os source:
    git show HEAD:cael.agent.os/contracts/goal-20260704-0700.json | sha256sum   # == the recorded sha

## Honest Caveats

- No committed BUILD cooper record exists in the cael-os repository. The `JUDGE_VERDICT.md` T8 notes a BUILD cooper record was generated during the build session, but it is not present in the committed repo. The ported artifacts are the PLAN cooper record plus the independently executed `JUDGE_VERDICT.md`, the durable verification of record.
- The score above is the PUBLIC-set result. `Hidden_Evaluation` exists; the honest generalizable retrieval posture is the record, not a hidden-set guarantee.
