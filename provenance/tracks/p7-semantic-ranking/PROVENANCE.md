# p7-semantic-ranking Provenance

This folder is the governed build record for `p7-semantic-ranking`, Taco Track P7 / AI Semantic Search & Ranking. The pack code lives at `cael-os-light/packs/p7-semantic-ranking/`.

## Source Inputs

- Job folder: `docs/handoff/jobs/602-603-0759-p7-semantic-ranking-build/`
- Verified spec: `docs/handoff/jobs/601-bucket1-spec-validate/report/REPORT.md`
- RADIO brief: `docs/handoff/jobs/_briefs/track-p7-BRIEF.md`
- Workbook: `C:\Users\Kajima-Lisa-Cael\Downloads\Taco\Download from P6-rest\Track 2_ AI Semantic Search & Ranking\ai_maps_track2_dataset_participants.xlsx`
- API PDF: `C:\Users\Kajima-Lisa-Cael\Downloads\Taco\Download from P6-rest\tasco_maps_hackathon_api_documentation.pdf`

## Extraction

Workbook data was extracted programmatically with `openpyxl` through `docs/handoff/jobs/602-603-0759-p7-semantic-ranking-build/generate_p7_assets.py`.

Generated artifacts:

| Artifact | Source sheet | Count |
| --- | --- | ---: |
| `src/poi-corpus.ts` | `POI_Dataset` | 111 POIs |
| `src/taxonomy.ts` | `Attribute_Taxonomy`, `Ranking_Signals` | 10 attributes, 7 signals |
| `fixtures/synthetic/eval.p7.json` | `Public_Evaluation` | 60 cases |

## Contract

Source contract summary: `contract-goal-20260707-0759.json`

The implementation follows the job ruling that the deterministic path uses no embeddings and no model calls, despite the raw challenge brief mentioning vector search as an optional/expected hackathon capability.

## Honest Caveats

- The public score is on the synthetic public fixture only: 58/60 (96.67%) top-k inclusion, partial score 0.9281.
- Hidden or private evaluation quality is not claimed.
- Landmark aliases are data-driven from workbook POI district/address rows and API PDF DTO examples, but they remain a finite resolver table for the supplied evaluation language.
