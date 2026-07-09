import { describe, expect, it } from "vitest";
import { p7PoiCorpus } from "../src/poi-corpus.js";
import { evaluateP7Ranking, evaluateP7RankingWithCorpus } from "../src/rank.js";
import type { P7Poi } from "../src/rank.js";
import { readJson } from "./helpers.js";

describe("T5 deterministic ranking and anti-gaming checks", () => {
  it("is invariant when the POI corpus order is reversed or rotated", () => {
    const evalSet = readJson<{ cases: Array<{ input: { query: string; limit: number } }> }>("../fixtures/synthetic/eval.p7.json");
    const reversed = [...p7PoiCorpus].reverse();
    const rotated = [...p7PoiCorpus.slice(7), ...p7PoiCorpus.slice(0, 7)];

    for (const testCase of evalSet.cases) {
      const base = evaluateP7Ranking({}, testCase.input).ranked_results.map((result) => result.poi_id);
      expect(evaluateP7RankingWithCorpus(reversed, testCase.input).ranked_results.map((result) => result.poi_id)).toEqual(base);
      expect(evaluateP7RankingWithCorpus(rotated, testCase.input).ranked_results.map((result) => result.poi_id)).toEqual(base);
    }
  });

  it("uses the landmark resolver and taxonomy signals for Hoàn Kiếm work cafes", () => {
    const ranked = evaluateP7Ranking({}, { query: "quiet coffee shop to work near hoan kiem", limit: 5 }).ranked_results;
    expect(ranked.map((result) => result.poi_id)).toContain("C004");
    expect(ranked.map((result) => result.poi_id)).toContain("C003");
    expect(ranked[0]?.matched_attributes).toContain("phù hợp làm việc");
    expect(ranked[0]?.ranking_signals).toContain("distance_score");
  });

  it("ranks a foreign injected 3-row corpus without pack-singleton leakage", () => {
    const foreign: P7Poi[] = [
      poi("X001", "Quiet Study Cafe", "Quán cà phê", "Hoàn Kiếm", ["wifi", "yên tĩnh", "phù hợp làm việc"], ["quiet", "study"], 4.8),
      poi("X002", "Loud Tea Bar", "Quán cà phê", "Hoàn Kiếm", ["đông khách"], ["tea"], 4.9),
      poi("X003", "Family Seafood", "Nhà hàng", "Sơn Trà", ["hải sản", "phù hợp gia đình"], ["seafood"], 4.7)
    ];

    const ranked = evaluateP7RankingWithCorpus(foreign, { query: "quiet cafe with wifi to work", limit: 3 }).ranked_results;
    expect(ranked.map((result) => result.poi_id)).toEqual(["X001", "X002", "X003"]);
  });
});

function poi(
  poi_id: string,
  poi_name: string,
  category: string,
  district: string,
  attributes: string[],
  tags: string[],
  rating: number
): P7Poi {
  return {
    poi_id,
    poi_name,
    brand: poi_name,
    category,
    sub_category: category,
    city: district === "Sơn Trà" ? "Đà Nẵng" : "Hà Nội",
    district,
    address: district,
    latitude: district === "Sơn Trà" ? 16.06 : 21.03,
    longitude: district === "Sơn Trà" ? 108.24 : 105.85,
    rating,
    review_count: 10,
    popularity_score: 50,
    price_level: 2,
    opening_hours: "08:00-22:00",
    attributes,
    tags,
    description: `${poi_name} synthetic foreign row`,
    source_row: 1,
    provenance: "foreign-test-corpus"
  };
}
