# p8-conversational-maps Provenance

This folder is the governed build record for `p8-conversational-maps`, Taco Track P8 / AI Maps Track 3 - Trợ Lý AI Hội Thoại Cho Bản Đồ. The pack code lives at `cael-os-light/packs/p8-conversational-maps/`.

## Source Inputs

- Job folder: `docs/handoff/jobs/603-604-0760-p8-pack-build/`
- Verified spec: `docs/handoff/jobs/601-bucket1-spec-validate/report/REPORT.md`
- Workbook: `C:\Users\Kajima-Lisa-Cael\Downloads\Taco\Download from P6-rest\Track 3_ Conversational AI Map Assistant\ai_maps_track3_dataset_participants.xlsx`
- Composition dependencies: `cael-os-light/packs/p6-query-understanding/src/intent-rules.ts`, `cael-os-light/packs/p7-semantic-ranking/src/rank.ts`

## Extraction

Workbook data was inspected and extracted programmatically with `openpyxl` through:

- `docs/handoff/jobs/603-604-0760-p8-pack-build/inspect_p8_workbook.py`
- `docs/handoff/jobs/603-604-0760-p8-pack-build/generate_p8_assets.py`

Generated artifacts:

| Artifact | Source sheet | Count |
| --- | --- | ---: |
| `src/corpus.ts` | `POI_Dataset` | 80 POIs |
| `src/preferences.ts` | `User_Preferences` | 8 profiles |
| `src/scenarios.ts` | `Conversation_Scenarios` | 8 scenarios |
| `fixtures/synthetic/eval.p8.json` | `Public_Evaluation`, `Conversation_Scenarios` | 30 cases, 8 scenarios |

## Contract

Source contract summary: `contract-goal-20260707-0760.json`

The implementation follows the job ruling that P8 composes sibling-source P6/P7 imports, keeps the deterministic gate on structured fields, and makes no model calls.

## Honest Caveats

- The public score is on the synthetic public fixture only: intent 21/30 (70.00%), map_action 30/30 (100.00%), recommendation 24/30 (80.00%).
- Hidden or private evaluation quality is not claimed.
- P8 adds conversation memory, personalization, clarification, and map-action DTOs; it does not modify P6/P7 and does not claim production map intelligence beyond the workbook corpus.
