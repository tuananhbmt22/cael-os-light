import { accentFold } from "@cael/os-light";
import { canonicalKey, normalizeQueryText } from "./normalize-recipe.js";
import type { NormalizedQuery } from "./normalize-recipe.js";
import { syntheticPois } from "./synthetic-corpus.js";

export const P6_INTENTS = ["poi_lookup", "category_search", "address_navigation", "ambiguous"] as const;
export type P6Intent = (typeof P6_INTENTS)[number];

export interface P6Understanding {
  normalized: NormalizedQuery;
  intent: P6Intent;
  entities: string[];
  citedIds: string[];
  confidence: number;
  ambiguity: {
    detected: boolean;
    resolution: string;
    candidates: string[];
  };
  rewritten_query: string;
}

interface CategoryEntry {
  phrase: string;
  category: string;
}

export const tokenSynonyms: Record<string, string> = {
  coffee: "cafe",
  "ca phe": "cafe",
  "quan cafe": "cafe",
  "ngan hang": "atm",
  bank: "atm",
  mall: "tttm",
  shopping: "tttm",
  "quan an": "nha hang",
  restaurant: "nha hang",
  "tram xang": "cay xang",
  fuel: "cay xang",
  clinic: "benh vien"
};

export const tokenCategories: Record<string, string> = {
  cafe: "coffee_shop",
  atm: "bank",
  "benh vien": "hospital",
  "benh vien da khoa": "hospital",
  tttm: "shopping_mall",
  "trung tam thuong mai": "shopping_mall",
  "nha hang": "restaurant",
  "quan an": "restaurant",
  "cay xang": "fuel_station",
  "tram xang": "fuel_station",
  "sieu thi": "grocery"
};

const categoryEntries: CategoryEntry[] = Object.entries(tokenCategories)
  .map(([phrase, category]) => ({ phrase: canonicalKey(phrase), category }))
  .sort((left, right) => right.phrase.length - left.phrase.length || left.phrase.localeCompare(right.phrase));

export const p6QueryRuleSet = {
  archetype: "C",
  fields: {},
  token_synonyms: tokenSynonyms,
  category_axis: {
    field: "category",
    token_categories: tokenCategories
  },
  soft_rank: {
    top_n: 3,
    token_present_score: 1,
    token_absent_penalty: -1,
    token_negated_present_penalty: -2,
    token_unknown_score: 0,
    category_match_score: 1
  }
};

export function understandQuery(query: string): P6Understanding {
  const normalized = normalizeQueryText(query);
  const folded = canonicalKey(normalized.normalized_query);
  const entities = new Set<string>();
  const citedIds = new Set<string>();
  const categories = resolveCategories(folded);
  if (categories.includes("bank") && hasPhrase(folded, "gan benh vien")) {
    const hospitalIndex = categories.indexOf("hospital");
    if (hospitalIndex >= 0) categories.splice(hospitalIndex, 1);
  }
  const addressEntities = resolveAddressEntities(normalized);
  for (const entity of addressEntities) entities.add(entity);
  for (const entity of resolveDistrictEntities(folded)) entities.add(entity);
  for (const category of categories) entities.add(`category:${category}`);
  if (hasNearby(folded)) entities.add("proximity:nearby");
  if (hasPhrase(folded, "benh vien cho ray")) entities.add("landmark:benh vien cho ray");

  const exactPoiMatches = resolveExactPoiMatches(folded);
  const broadPoiMatches = exactPoiMatches.length > 0 ? exactPoiMatches : resolveBroadPoiMatches(folded);
  const addressLike = isAddressNavigation(normalized);
  const bareRestaurant = folded === "nha hang";

  if (broadPoiMatches.length > 1 && !addressLike) {
    for (const poi of broadPoiMatches) entities.add(`poi_candidate:${poi.id}`);
    return finalize({
      normalized,
      intent: "ambiguous",
      entities,
      citedIds,
      confidence: 0.25,
      ambiguity: {
        detected: true,
        resolution: "Multiple synthetic POIs match; needs a more specific place or category.",
        candidates: broadPoiMatches.map((poi) => poi.id).sort()
      }
    });
  }

  if (bareRestaurant) {
    return finalize({
      normalized,
      intent: "ambiguous",
      entities,
      citedIds,
      confidence: 0.3,
      ambiguity: {
        detected: true,
        resolution: "Restaurant category is under-specified without a location or named POI.",
        candidates: ["category:restaurant"]
      }
    });
  }

  const exactPoi = exactPoiMatches[0];
  if (exactPoi !== undefined) {
    entities.add(`poi:${exactPoi.id}`);
    entities.add(`category:${exactPoi.category}`);
    citedIds.add(exactPoi.id);
    return finalize({
      normalized,
      intent: "poi_lookup",
      entities,
      citedIds,
      confidence: 0.95,
      ambiguity: { detected: false, resolution: "", candidates: [] }
    });
  }

  if (addressLike) {
    const underSpecified = normalized.parsed_address.street !== undefined && !/^\d+\s+/.test(canonicalKey(normalized.parsed_address.street));
    return finalize({
      normalized,
      intent: "address_navigation",
      entities,
      citedIds,
      confidence: underSpecified ? 0.78 : 0.9,
      ambiguity: {
        detected: underSpecified,
        resolution: underSpecified ? "Street-level address lacks a house number; search can continue at street scope." : "",
        candidates: []
      }
    });
  }

  if (categories.length > 0) {
    return finalize({
      normalized,
      intent: "category_search",
      entities,
      citedIds,
      confidence: hasLocationEntity(entities) ? 0.88 : 0.76,
      ambiguity: { detected: false, resolution: "", candidates: [] }
    });
  }

  return finalize({
    normalized,
    intent: "ambiguous",
    entities,
    citedIds,
    confidence: 0.2,
    ambiguity: {
      detected: true,
      resolution: "No category, address, or synthetic POI could be resolved.",
      candidates: []
    }
  });
}

function finalize(input: Omit<P6Understanding, "entities" | "citedIds" | "rewritten_query"> & {
  entities: Set<string>;
  citedIds: Set<string>;
}): P6Understanding {
  const entities = [...input.entities].sort();
  const citedIds = [...input.citedIds].sort();
  return {
    normalized: input.normalized,
    intent: input.intent,
    entities,
    citedIds,
    confidence: input.confidence,
    ambiguity: input.ambiguity,
    rewritten_query: rewriteQuery(input.normalized.normalized_query, entities)
  };
}

function resolveCategories(folded: string): string[] {
  const out = new Set<string>();
  for (const entry of categoryEntries) {
    if (hasPhrase(folded, entry.phrase)) out.add(entry.category);
  }
  return [...out].sort();
}

function resolveAddressEntities(normalized: NormalizedQuery): string[] {
  const out: string[] = [];
  const { street, ward, district } = normalized.parsed_address;
  if (street !== undefined) out.push(`street:${streetEntity(street)}`);
  if (ward !== undefined) out.push(`ward:${stripAdministrativePrefix(ward, "phuong")}`);
  if (district !== undefined) out.push(`district:${districtEntity(district)}`);
  return out.sort();
}

function resolveDistrictEntities(folded: string): string[] {
  const out = new Set<string>();
  for (const match of folded.matchAll(/\bquan\s+\d+\b/g)) out.add(`district:${match[0]}`);
  if (hasPhrase(folded, "hai chau")) out.add("district:hai chau");
  return [...out].sort();
}

function resolveExactPoiMatches(folded: string): typeof syntheticPois {
  return syntheticPois.filter((poi) => poiKeys(poi).some((key) => key === folded));
}

function resolveBroadPoiMatches(folded: string): typeof syntheticPois {
  if (folded.length < 4) return [];
  return syntheticPois.filter((poi) => poiKeys(poi).some((key) => hasPhrase(key, folded) || hasPhrase(folded, key)));
}

function poiKeys(poi: (typeof syntheticPois)[number]): string[] {
  return [poi.id, poi.name, ...poi.aliases].map((value) => canonicalKey(value));
}

function isAddressNavigation(normalized: NormalizedQuery): boolean {
  const folded = canonicalKey(normalized.normalized_query);
  if (normalized.normalized_query.includes(",")) return normalized.parsed_address.street !== undefined;
  return /^\d+\s+/.test(folded) && normalized.parsed_address.street !== undefined;
}

function hasNearby(folded: string): boolean {
  return hasPhrase(folded, "gan") || hasPhrase(folded, "gan day");
}

function hasLocationEntity(entities: Set<string>): boolean {
  return [...entities].some((entity) => entity.startsWith("district:") || entity.startsWith("ward:") || entity === "proximity:nearby");
}

function streetEntity(street: string): string {
  return canonicalKey(street).replace(/^\d+\s+/, "");
}

function stripAdministrativePrefix(value: string, prefix: "phuong" | "quan"): string {
  const folded = canonicalKey(value);
  if (folded.startsWith(`${prefix} `)) return folded.slice(prefix.length + 1);
  return folded;
}

function districtEntity(value: string): string {
  return canonicalKey(value);
}

function rewriteQuery(normalizedQuery: string, entities: string[]): string {
  if (entities.length === 0) return normalizedQuery;
  return `${normalizedQuery} :: ${entities.join(" ")}`;
}

function hasPhrase(folded: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s|-)${escaped}(?=\\s|$|,|-)`).test(accentFold(folded).toLowerCase());
}
