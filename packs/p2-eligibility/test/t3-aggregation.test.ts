import { describe, expect, it } from "vitest";
import {
  BANK_LINK_LABEL,
  CIVIL_LIABILITY_LABEL,
  DOCUMENT_WALLET_LABEL,
  FALLBACK_LABEL,
  MONTHLY_PASS_LABEL,
  ROAD_ASSISTANCE_LABEL
} from "../src/eligibility-rule-set.js";
import { evaluateP2Recommendations, p2_recommend } from "../src/p2-recommend.js";
import { syntheticStateForUser } from "../src/synthetic-corpus.js";

describe("T3 per-user vehicle aggregation", () => {
  it("keeps same-vehicle AND coupling for roadside", () => {
    expect(p2_recommend(syntheticStateForUser("SYN-COUPLING"), { user_id: "SYN-COUPLING", question: "x" })).toEqual({
      recommendation: [FALLBACK_LABEL]
    });
  });

  it("unions fired recommendations across vehicles, dedupes labels, ranks, and caps at three", () => {
    const decision = evaluateP2Recommendations(syntheticStateForUser("SYN-ALL-SIGNALS"), {
      user_id: "SYN-ALL-SIGNALS",
      question: "x"
    });
    expect(decision.recommendation).toEqual([ROAD_ASSISTANCE_LABEL, CIVIL_LIABILITY_LABEL, DOCUMENT_WALLET_LABEL]);
    expect(decision.recommendation).not.toContain(BANK_LINK_LABEL);
    expect(decision.recommendation).not.toContain(MONTHLY_PASS_LABEL);
    expect(decision.ranked_candidates.map((candidate) => candidate.firing_rule)).toEqual([
      "ROADSIDE",
      "INSURANCE_DAYS",
      "DOCWALLET_INSP"
    ]);
  });

  it("returns a never-empty fallback for a healthy user", () => {
    const decision = evaluateP2Recommendations(syntheticStateForUser("SYN-HEALTHY"), {
      user_id: "SYN-HEALTHY",
      question: "x"
    });
    expect(decision.fallback_used).toBe(true);
    expect(decision.recommendation).toEqual([FALLBACK_LABEL]);
  });

  it("handles registration-driven document-wallet and monthly-pass user-plus-vehicle rules", () => {
    expect(p2_recommend(syntheticStateForUser("SYN-REGISTRATION"), { user_id: "SYN-REGISTRATION" })).toEqual({
      recommendation: [DOCUMENT_WALLET_LABEL]
    });
    expect(p2_recommend(syntheticStateForUser("SYN-MONTHLY"), { user_id: "SYN-MONTHLY" })).toEqual({
      recommendation: [MONTHLY_PASS_LABEL]
    });
  });
});

