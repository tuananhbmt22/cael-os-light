export interface IntentModel {
  disambiguate(req: { query: string; candidates: string[] }): { intent: string; note: string };
}

export function createStubIntentModel(): IntentModel {
  return {
    disambiguate(req) {
      const candidates = [...req.candidates].sort();
      return {
        intent: "ambiguous",
        note: candidates.length > 0 ? `deterministic tie among ${candidates.join(", ")}` : "deterministic ambiguity"
      };
    }
  };
}

