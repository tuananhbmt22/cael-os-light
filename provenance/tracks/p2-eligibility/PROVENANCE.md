# p2-eligibility Provenance

This folder is the governed build record for `p2-eligibility`, Taco Track 2 / P2 - AI Mobility Growth & Engagement Platform, cael-os-light DOGFOOD #2. The pack code lives at `cael-os-light/packs/p2-eligibility/`.

## Goal

Goal `goal-20260704-0701` was "Taco Track 2 (P2) - AI Mobility Growth & Engagement Platform [cael-os-light delivery]" and is recorded as completed. Its parent program is `goal-20260701-0579`.

## Build Record

The durable build identifier is the job folder `docs/handoff/jobs/600-0701-p2-eligibility-build/`. The `JUDGE_VERDICT.md` record names the judge as the RADIO lane (Opus 4.8), but it does not record a specific container lane-id; this folder therefore cites the job folder as the durable build identifier rather than inventing a lane-id.

Builder: Codex 5.5. Judge: Claude Opus 4.8, judging on disk as a different identity from the builder. The builder was not the sole judge of its own work.

The build took one round. The judge built an independent reference implementation of the FIX-A rules and confirmed 40/40 before the build. After the build, the judge ran an independent strip-probe with the expected answer stripped and the question shuffled; it held at 40/40. Two independent implementations therefore agreed under adversarial inputs, carrying forward the P1 round-1 anti-gaming lesson as a standing gate.

Verdict: PASS. The result was 40/40 honest on the 40-row Public_Evaluation, question-independent, with per-user vehicle aggregation and zero leaks. The dogfood `@cael/os-light` tarball is byte-identical to P1's. This is the PUBLIC-set number; a `Hidden_Evaluation` exists and the registration window `[61,179]` is under-determined, so 40/40 must not be reported as the hidden expectation.

## Contract

Source contract: `cael.agent.os/contracts/goal-20260704-0701.json`

SHA-256: `9dc80a6dbecf16296f4a6a1d6cda00696ac7d300fc3b3747e60908fab5b144ea`

## Copied Records

Each copy is byte-identical to its cael-os source. The originals remain in cael-os, unmodified; the recorded SHA-256 values are git-blob content shas (LF-normalized, platform-independent), verifiable against cael-os history.

| Destination file | cael-os source path | SHA-256 |
|---|---|---|
| `contract-goal-20260704-0701.json` | `cael.agent.os/contracts/goal-20260704-0701.json` | `9dc80a6dbecf16296f4a6a1d6cda00696ac7d300fc3b3747e60908fab5b144ea` |
| `0701-PLAN_COOPER_RECORD.json` | `docs/handoff/jobs/_briefs/0701-PLAN_COOPER_RECORD.json` | `d59198c0e305140763d1351624bc1986d300f02ce150fa8dbcb15434f0f33207` |
| `JUDGE_VERDICT.md` | `docs/handoff/jobs/600-0701-p2-eligibility-build/report/JUDGE_VERDICT.md` | `cf8a200766ac4a8d8425cf35a79b94143d626ec1a5e1b1169b2bfac3eb5b0865` |
| `REPORT.md` | `docs/handoff/jobs/600-0701-p2-eligibility-build/report/REPORT.md` | `8236eb5bd35715a4818a015a291cffc84d42b231fb5d489882434f01ceb495c8` |

### Verifying these shas (platform-independent)

Git stores blobs LF-normalized, so these shas reproduce on any OS (do NOT `sha256sum` the checked-out
file directly -- CRLF on Windows changes the bytes). In this public repo:
    git show HEAD:provenance/tracks/p2-eligibility/contract-goal-20260704-0701.json | sha256sum
In the cael-os factory monorepo, verify each copy equals its cael-os source:
    git show HEAD:cael.agent.os/contracts/goal-20260704-0701.json | sha256sum   # == the recorded sha

## Honest Caveats

- The build ran with `cooper_required=false` because the PLAN cooper was already closed, so there is no separate BUILD cooper record for this track. The in-lane `JUDGE_VERDICT.md` is the independent verification of record.
- No `BRIEF.md` is committed in the `600-0701` job folder. The `600-0700` job folder has one; the P2 build reused the P1 brief pattern. This folder does not invent or port a brief that is not present.
- The score above is the PUBLIC-set result. `Hidden_Evaluation` exists and the registration window `[61,179]` is under-determined; 40/40 is not a hidden-set expectation.
