import { describe, expect, it } from "vitest";
import type { L1EvalSet } from "@cael/os-light";
import { p9Pois } from "../src/autocomplete-corpus.js";
import { foldForMatch, normalizePrefix } from "../src/normalize.js";
import { evaluateP9Suggestions, p9_suggest } from "../src/suggest.js";
import { readJson } from "./helpers.js";

describe("T5 deterministic ranking and anti-gaming checks", () => {
  it("is invariant when the POI corpus order is reversed or rotated", () => {
    const evalSet = readJson<L1EvalSet>("../fixtures/synthetic/eval.archetype-b.json");
    const reversed = [...p9Pois].reverse();
    const rotated = [...p9Pois.slice(5), ...p9Pois.slice(0, 5)];

    for (const testCase of evalSet.cases) {
      const base = p9_suggest({}, testCase.input).suggestions;
      expect(p9_suggest({ pois: reversed }, testCase.input).suggestions).toEqual(base);
      expect(p9_suggest({ pois: rotated }, testCase.input).suggestions).toEqual(base);
    }
  });

  it("ranks the vin collision by score, not alphabetically or by corpus insertion order", () => {
    const ranked = p9_suggest({}, { prefix: "vin", limit: 3 }).suggestions;
    const collisionNames = p9Pois.filter((poi) => foldForMatch(poi.name).startsWith("vin")).map((poi) => poi.name);
    const alphabetical = [...collisionNames].sort((left, right) => foldForMatch(left).localeCompare(foldForMatch(right)));

    expect(ranked).toEqual(["Vincom Lê Lợi", "Vinpearl Cửa Hội", "VinMart Đồng Sen"]);
    expect(ranked).not.toEqual(alphabetical);
    expect(ranked).not.toEqual(collisionNames);
  });

  it("is deterministic for repeated identical calls", () => {
    const input = { prefix: "bv", recent_queries: ["Bệnh viện Bình Minh"], limit: 4 };
    expect(p9_suggest({}, input)).toEqual(p9_suggest({}, input));
  });

  it("records typo corrections and applies the recent-query bonus without a lookup table", () => {
    const normalized = normalizePrefix("vincon");
    expect(normalized.normalized).toBe("vincom");
    expect(normalized.corrections).toEqual([{ from: "vincon", to: "vincom" }]);

    const base = evaluateP9Suggestions({}, { prefix: "vin", limit: 3 }).suggestions.map((suggestion) => suggestion.text);
    const personalized = evaluateP9Suggestions({}, {
      prefix: "vin",
      recent_queries: ["Vinpearl Cửa Hội"],
      limit: 3
    }).suggestions.map((suggestion) => suggestion.text);
    expect(base[0]).toBe("Vincom Lê Lợi");
    expect(personalized[0]).toBe("Vinpearl Cửa Hội");
  });
});
