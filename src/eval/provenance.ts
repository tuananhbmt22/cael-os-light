export interface ProvenanceRecord {
  run_id: string;
  brief_ref: string;
  report_ref: string;
  scores: Record<string, unknown>;
  replay_ref: string;
  pack_ids: string[];
  os_sha: string;
  schema_version: "phase0.provenance.v1";
}

export interface ProvenanceInput {
  run_id: string;
  brief_ref: string;
  report_ref: string;
  scores: Record<string, unknown>;
  replay_ref: string;
  pack_ids: string[];
  os_sha: string;
}

export function emitProvenanceRecord(input: ProvenanceInput): ProvenanceRecord {
  return {
    run_id: input.run_id,
    brief_ref: input.brief_ref,
    report_ref: input.report_ref,
    scores: input.scores,
    replay_ref: input.replay_ref,
    pack_ids: [...input.pack_ids].sort(),
    os_sha: input.os_sha,
    schema_version: "phase0.provenance.v1"
  };
}
