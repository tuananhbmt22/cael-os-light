export type EscalationTrigger =
  | "low_retrieval_confidence"
  | "permission_boundary_proximity"
  | "step_up_action"
  | "residual_metadata_intent_conflict";

export interface TurnStateForEscalation {
  retrievalConfidence?: number;
  permissionBoundaryProximity?: number;
  stepUpAction?: boolean;
  residualMetadataIntentConflict?: boolean;
}

export interface TriggerConfig {
  enabled: EscalationTrigger[];
  lowRetrievalConfidenceBelow?: number;
  permissionBoundaryProximityAtOrAbove?: number;
}

export interface EscalationDecision {
  escalate: boolean;
  trigger?: EscalationTrigger;
}

export interface SecondBrain {
  review(state: TurnStateForEscalation, trigger: EscalationTrigger): { ok: true } | { ok: false; reason: string };
}

const triggerOrder: EscalationTrigger[] = [
  "residual_metadata_intent_conflict",
  "step_up_action",
  "permission_boundary_proximity",
  "low_retrieval_confidence"
];

export function decideEscalation(
  turnState: TurnStateForEscalation,
  triggerConfig: TriggerConfig = { enabled: [] }
): EscalationDecision {
  const enabled = new Set(triggerConfig.enabled);
  for (const trigger of triggerOrder) {
    if (enabled.has(trigger) && triggerFires(trigger, turnState, triggerConfig)) {
      return { escalate: true, trigger };
    }
  }
  return { escalate: false };
}

function triggerFires(
  trigger: EscalationTrigger,
  state: TurnStateForEscalation,
  config: TriggerConfig
): boolean {
  if (trigger === "residual_metadata_intent_conflict") return state.residualMetadataIntentConflict === true;
  if (trigger === "step_up_action") return state.stepUpAction === true;
  if (trigger === "permission_boundary_proximity") {
    return (state.permissionBoundaryProximity ?? 0) >= (config.permissionBoundaryProximityAtOrAbove ?? 0.8);
  }
  return (state.retrievalConfidence ?? 1) < (config.lowRetrievalConfidenceBelow ?? 0.5);
}
