import { p7PoiCorpus } from "./poi-corpus.js";
import { p7AttributeTaxonomy, p7RankingSignals } from "./taxonomy.js";
import { p7LandmarkAliases, type P7LandmarkAlias } from "./landmarks.js";

export interface P7Poi {
  readonly poi_id: string;
  readonly poi_name: string;
  readonly brand: string;
  readonly category: string;
  readonly sub_category: string;
  readonly city: string;
  readonly district: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly rating: number;
  readonly review_count: number;
  readonly popularity_score: number;
  readonly price_level: number;
  readonly opening_hours: string;
  readonly attributes: readonly string[];
  readonly tags: readonly string[];
  readonly description: string;
  readonly source_row: number;
  readonly provenance: string;
}

export interface P7TurnLocation {
  readonly lat: number;
  readonly lon: number;
  readonly label?: string;
}

export interface P7RankInput {
  readonly query?: string;
  readonly limit?: number;
  readonly userLocation?: P7TurnLocation;
}

export interface P7PlaceResultDto {
  readonly id: string;
  readonly type: "poi";
  readonly name: string;
  readonly label: string;
  readonly address: string;
  readonly category: string;
  readonly coordinates: { readonly lat: number; readonly lon: number };
  readonly distanceMeters?: number;
  readonly score: number;
  readonly source: "synthetic-p7-workbook";
  readonly tags: readonly string[];
}

export interface P7RankedResult {
  readonly poi_id: string;
  readonly poi_name: string;
  readonly score: number;
  readonly matched_attributes: readonly string[];
  readonly ranking_signals: readonly string[];
  readonly reasons: readonly string[];
  readonly place: P7PlaceResultDto;
}

export interface P7RankingDecision {
  readonly normalized_query: string;
  readonly intent: string;
  readonly ranked_results: readonly P7RankedResult[];
  readonly firing_rule: string;
  readonly fallback_used: boolean;
  readonly profile: P7QueryProfile;
}

export interface P7QueryProfile {
  readonly raw: string;
  readonly folded: string;
  readonly categories: readonly string[];
  readonly attributeGroups: readonly AttributeGroup[];
  readonly landmarks: readonly P7LandmarkAlias[];
  readonly explicitSignals: readonly string[];
  readonly terms: readonly string[];
}

interface AttributeGroup {
  readonly canonical: string;
  readonly aliases: readonly string[];
  readonly poiAliases: readonly string[];
  readonly weight?: number;
}

interface CategoryGroup {
  readonly category: string;
  readonly aliases: readonly string[];
  readonly poiAliases?: readonly string[];
}

interface Candidate {
  readonly result: P7RankedResult;
  readonly score: number;
  readonly relevanceScore: number;
  readonly locationScore: number;
  readonly ratingScore: number;
  readonly popularityScore: number;
  readonly reviewSignal: number;
  readonly freshnessScore: number;
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "best", "co", "có", "cho", "de", "để", "di", "đi", "for", "gan", "gần", "in", "la",
  "là", "near", "noi", "nơi", "o", "ở", "of", "the", "to", "tim", "tìm", "trong", "va", "và", "voi", "với", "with"
]);

const CATEGORY_GROUPS: readonly CategoryGroup[] = [
  { category: "Quán cà phê", aliases: ["cafe", "coffee", "coffee shop", "quán cà phê", "quán cafe", "uống cafe"], poiAliases: ["cafe", "coffee", "quán cà phê"] },
  { category: "Nhà hàng", aliases: ["nhà hàng", "quán ăn", "ăn tối", "ăn uống", "restaurant", "food"], poiAliases: ["nhà hàng", "restaurant", "food"] },
  { category: "Khách sạn", aliases: ["khách sạn", "hotel", "resort", "homestay"], poiAliases: ["khách sạn", "hotel", "resort", "homestay"] },
  { category: "Trung tâm thương mại", aliases: ["trung tâm thương mại", "mall", "shopping", "mua sắm"], poiAliases: ["trung tâm thương mại", "mall", "shopping", "mua sắm"] },
  { category: "ATM", aliases: ["atm", "rút tiền", "rut tien"], poiAliases: ["atm", "rút tiền"] },
  { category: "Trạm xăng", aliases: ["cây xăng", "trạm xăng", "fuel", "petrol"], poiAliases: ["trạm xăng", "fuel", "xăng dầu"] },
  { category: "Trạm sạc điện", aliases: ["trạm sạc", "sạc xe điện", "ev charging", "charging"], poiAliases: ["trạm sạc", "ev", "charging", "sạc nhanh"] },
  { category: "Bệnh viện", aliases: ["bệnh viện", "hospital", "cấp cứu"], poiAliases: ["bệnh viện", "hospital", "cấp cứu"] },
  { category: "Nhà thuốc", aliases: ["nhà thuốc", "pharmacy", "thuốc"], poiAliases: ["nhà thuốc", "pharmacy", "thuốc"] },
  { category: "Rạp phim", aliases: ["rạp phim", "cinema", "movie", "cgv", "galaxy"], poiAliases: ["rạp phim", "cinema", "cgv", "galaxy"] },
  { category: "Điểm tham quan", aliases: ["địa điểm", "điểm tham quan", "đi chơi", "tham quan", "check-in", "checkin"], poiAliases: ["điểm tham quan", "du lịch", "check-in", "tourist"] },
  { category: "Công viên", aliases: ["công viên", "park", "ngoài trời"], poiAliases: ["công viên", "park", "ngoài trời"] }
];

const ATTRIBUTE_GROUPS: readonly AttributeGroup[] = [
  group("wifi", ["wifi", "wi-fi", "internet"], ["wifi", "wifi mạnh"], 20),
  group("yên tĩnh", ["yên tĩnh", "quiet", "không quá đông", "ít ồn", "tập trung"], ["yên tĩnh", "quiet"], 24),
  group("phù hợp làm việc", ["làm việc", "work", "work-friendly", "học bài", "học tập", "ngoài văn phòng", "ổ cắm"], ["phù hợp làm việc", "work-friendly", "phù hợp học tập", "ổ cắm", "phòng họp", "business"], 24),
  group("phù hợp gia đình", ["gia đình", "trẻ em", "children", "kids", "family", "trẻ nhỏ"], ["phù hợp gia đình", "phù hợp trẻ em", "trẻ em", "kids", "family", "gia đình", "ghế trẻ em"], 22),
  group("lãng mạn", ["lãng mạn", "hẹn hò", "date", "romantic", "cặp đôi"], ["lãng mạn", "hẹn hò", "romantic", "phù hợp cặp đôi", "phù hợp gặp bạn"], 24),
  group("mở khuya", ["mở khuya", "mở muộn", "sau 11", "sau 23", "tối nay", "late", "late-night"], ["mở khuya", "mở muộn", "late-night", "24/7"], 24),
  group("gần biển", ["gần biển", "beach", "biển", "near beach"], ["gần biển", "beach"], 22),
  group("bãi đỗ xe", ["bãi đỗ xe", "bãi đậu xe", "chỗ đậu xe", "parking", "đỗ xe"], ["bãi đỗ xe", "parking"], 22),
  group("check-in", ["check-in", "checkin", "chụp ảnh", "view đẹp", "view", "nổi tiếng"], ["check-in", "view đẹp", "view", "tourist"], 20),
  group("24/7", ["24/7", "24h", "24 giờ"], ["24/7", "24h"], 22),
  group("hồ bơi", ["hồ bơi", "pool"], ["hồ bơi", "pool"], 20),
  group("hải sản", ["hải sản", "seafood"], ["hải sản", "seafood"], 24),
  group("món chay", ["chay", "vegetarian", "healthy", "không thịt", "tốt cho sức khỏe"], ["món chay", "vegetarian", "healthy", "tốt cho sức khỏe"], 26),
  group("sân vườn", ["sân vườn", "garden"], ["sân vườn", "garden"], 22),
  group("giá rẻ", ["giá rẻ", "giá hợp lý", "budget", "miễn phí", "free"], ["giá rẻ", "giá hợp lý", "budget", "miễn phí", "free"], 18),
  group("phòng họp", ["phòng họp", "meeting", "họp nhóm", "văn phòng", "công tác"], ["phòng họp", "meeting", "gần văn phòng", "phù hợp công tác", "business"], 22),
  group("phù hợp nhóm", ["nhóm", "đoàn", "group", "bạn"], ["phù hợp nhóm", "group", "không gian rộng", "ấm cúng"], 18),
  group("món địa phương", ["món địa phương", "local", "du lịch", "tourist", "nổi tiếng"], ["món địa phương", "local-food", "du lịch", "tourist"], 18),
  group("mua sắm", ["mua sắm", "shopping", "mall"], ["mua sắm", "shopping", "mall"], 22),
  group("ăn uống", ["ăn uống", "food", "nhà hàng", "ăn tối"], ["ăn uống", "food"], 18),
  group("rạp phim", ["rạp phim", "cinema", "cgv", "galaxy"], ["rạp phim", "cinema", "cgv", "galaxy"], 24),
  group("toilet", ["toilet", "nhà vệ sinh"], ["toilet"], 18),
  group("cấp cứu", ["cấp cứu", "emergency"], ["cấp cứu", "emergency"], 22),
  group("quốc tế", ["quốc tế", "international"], ["quốc tế", "premium"], 18),
  group("trung tâm", ["trung tâm", "central"], ["trung tâm", "central"], 12),
  group("gần chợ", ["chợ", "market"], ["gần chợ", "market"], 18),
  group("đi bộ", ["đi bộ", "walking"], ["đi bộ", "walking"], 14),
  group("gần sông", ["sông", "river"], ["gần sông", "river"], 20),
  group("view thành phố", ["view thành phố", "city view"], ["rooftop", "night-view", "đài quan sát", "view"], 26),
  group("rooftop", ["rooftop"], ["rooftop"], 26),
  group("sách", ["sách", "book", "đọc sách"], ["sách", "book-cafe"], 24),
  group("specialty", ["specialty"], ["specialty"], 20),
  group("phở", ["phở", "pho"], ["phở", "pho"], 28),
  group("bún chả", ["bún chả", "bun cha"], ["bún chả", "bun-cha"], 28),
  group("lẩu", ["lẩu", "hotpot", "trời lạnh", "ấm cúng"], ["hotpot", "ấm cúng"], 28),
  group("resort", ["resort"], ["resort"], 22),
  group("homestay", ["homestay"], ["homestay"], 22),
  group("sạc nhanh", ["sạc nhanh", "sạc"], ["sạc nhanh", "charging"], 22)
];

const DECLARED_SIGNALS = new Set(p7RankingSignals.map((signal) => signal.signal));

export function p7_rank(_state: unknown, input: unknown): { ranked_results: string[] } {
  return {
    ranked_results: evaluateP7Ranking(_state, input).ranked_results.map((result) => result.poi_id)
  };
}

export function evaluateP7Ranking(state: unknown, input: unknown): P7RankingDecision {
  return evaluateP7RankingWithCorpus(selectCorpus(state), input);
}

export function evaluateP7RankingWithCorpus(pois: readonly P7Poi[], input: unknown): P7RankingDecision {
  const request = selectInput(input);
  const profile = profileQuery(request.query);
  const limit = normalizeLimit(request.limit);
  const candidates = pois.map((poi) => scorePoi(poi, profile, request.userLocation)).sort(compareCandidates);
  const ranked = candidates.slice(0, limit).map((candidate) => candidate.result);
  const fallback = ranked.every((result) => result.score <= 0);

  return {
    normalized_query: profile.folded,
    intent: inferIntent(profile),
    ranked_results: ranked,
    firing_rule: fallback ? "P7_RANK_FALLBACK" : "P7_SEMANTIC_RANK",
    fallback_used: fallback,
    profile
  };
}

export function scoreP7EvalCase(expected: readonly string[], actual: readonly string[]): number {
  if (expected.length === 0) return 1;
  const actualWindow = actual.slice(0, Math.max(expected.length, 5));
  const included = expected.filter((id) => actualWindow.includes(id)).length / expected.length;
  let orderCredit = 0;
  for (let index = 0; index < expected.length; index += 1) {
    const actualIndex = actualWindow.indexOf(expected[index]!);
    if (actualIndex === index) orderCredit += 1;
    else if (actualIndex >= 0) orderCredit += 0.5;
  }
  return roundScore(0.75 * included + 0.25 * (orderCredit / expected.length));
}

export function topKIncluded(expected: readonly string[], actual: readonly string[]): boolean {
  const actualWindow = new Set(actual.slice(0, Math.max(expected.length, 5)));
  return expected.some((id) => actualWindow.has(id));
}

function scorePoi(poi: P7Poi, profile: P7QueryProfile, userLocation: P7TurnLocation | undefined): Candidate {
  const haystack = foldForMatch([
    poi.poi_name,
    poi.brand,
    poi.category,
    poi.sub_category,
    poi.city,
    poi.district,
    poi.address,
    poi.description,
    ...poi.attributes,
    ...poi.tags
  ].join(" "));
  const reasons: string[] = [];
  const matchedAttributes: string[] = [];
  const rankingSignals = new Set<string>(["relevance_score", "business_attributes", "rating_score", "popularity_score", "review_signal", "freshness_score"]);

  let categoryScore = 0;
  for (const category of profile.categories) {
    if (foldForMatch(poi.category) === foldForMatch(category)) {
      categoryScore += 42;
      reasons.push(`category matches ${category}`);
    } else if (matchesAny(haystack, CATEGORY_GROUPS.find((grouped) => grouped.category === category)?.poiAliases ?? [])) {
      categoryScore += 24;
      reasons.push(`category-adjacent field matches ${category}`);
    } else {
      categoryScore -= 8;
    }
  }

  let attrScore = 0;
  for (const attr of profile.attributeGroups) {
    if (!matchesAny(haystack, attr.poiAliases)) continue;
    attrScore += attr.weight ?? 18;
    matchedAttributes.push(attr.canonical);
  }
  if (matchedAttributes.length > 0) reasons.push(`matched attributes: ${matchedAttributes.join(", ")}`);

  let locationScore = 0;
  for (const landmark of profile.landmarks) {
    const sameCity = landmark.city !== undefined && sameFold(poi.city, landmark.city);
    const sameDistrict = landmark.district !== undefined && sameFold(poi.district, landmark.district);
    const namesLandmark = matchesAny(haystack, landmark.aliases);
    if (namesLandmark) {
      locationScore += 30;
      reasons.push(`POI text names ${landmark.name}`);
    }
    if (sameDistrict) {
      locationScore += 40;
      reasons.push(`same district as ${landmark.name}`);
    } else if (sameCity) {
      locationScore += 16;
      reasons.push(`same city as ${landmark.name}`);
    }
    if (landmark.lat !== undefined && landmark.lon !== undefined) {
      const meters = distanceMeters(poi.latitude, poi.longitude, landmark.lat, landmark.lon);
      if (meters <= 1200) {
        locationScore += 42;
        reasons.push(`within ${Math.round(meters)}m of ${landmark.name}`);
      } else if (meters <= 3500) {
        locationScore += 24;
      } else if (sameCity) {
        locationScore += 4;
      }
    }
  }
  if (userLocation !== undefined) {
    rankingSignals.add("distance_score");
    const meters = distanceMeters(poi.latitude, poi.longitude, userLocation.lat, userLocation.lon);
    locationScore += Math.max(0, 18 - meters / 500);
  } else if (profile.landmarks.length > 0) {
    rankingSignals.add("distance_score");
  }

  const nameScore = nameTokenScore(profile.terms, haystack, poi);
  if (nameScore > 0) reasons.push("name/subcategory terms match query");

  const ratingScore = normalized(poi.rating, 3.5, 5) * 8;
  const popularityScore = normalized(poi.popularity_score, 0, 100) * 9;
  const reviewSignal = Math.min(1, Math.log10(Math.max(1, poi.review_count)) / 4) * 5;
  const freshnessScore = 1;
  const priceScore = pricePreferenceScore(profile, poi);
  if (priceScore !== 0) reasons.push("price-level proxy matched budget language");

  const relevanceScore = categoryScore + attrScore + nameScore + priceScore;
  const score = roundScore(relevanceScore + locationScore + ratingScore + popularityScore + reviewSignal + freshnessScore);
  if (reasons.length === 0) reasons.push("deterministic fallback ranking by declared rating/popularity proxies");
  reasons.push("review_signal fallback uses review_count/rating proxy; no review text in corpus");
  reasons.push("freshness_score fallback is neutral because no timestamps exist in corpus");

  const distance = nearestDistance(poi, profile.landmarks, userLocation);
  const result: P7RankedResult = {
    poi_id: poi.poi_id,
    poi_name: poi.poi_name,
    score,
    matched_attributes: dedupe(matchedAttributes),
    ranking_signals: [...rankingSignals].filter((signal) => DECLARED_SIGNALS.has(signal as (typeof p7RankingSignals)[number]["signal"])),
    reasons,
    place: {
      id: `poi:${poi.poi_id}`,
      type: "poi",
      name: poi.poi_name,
      label: poi.poi_name,
      address: poi.address,
      category: poi.category,
      coordinates: { lat: poi.latitude, lon: poi.longitude },
      ...(distance !== undefined ? { distanceMeters: Math.round(distance) } : {}),
      score,
      source: "synthetic-p7-workbook",
      tags: poi.tags
    }
  };
  return { result, score, relevanceScore, locationScore, ratingScore, popularityScore, reviewSignal, freshnessScore };
}

function profileQuery(query: string): P7QueryProfile {
  const folded = foldForMatch(query);
  const categories = CATEGORY_GROUPS.filter((grouped) => matchesAny(folded, grouped.aliases)).map((grouped) => grouped.category);
  const attributeGroups = ATTRIBUTE_GROUPS.filter((attr) => matchesAny(folded, attr.aliases));
  const landmarks = p7LandmarkAliases.filter((landmark) => matchesAny(folded, landmark.aliases));
  const explicitSignals = p7RankingSignals
    .map((signal) => signal.signal)
    .filter((signal) => matchesAny(folded, signalWords(signal)));
  return {
    raw: query,
    folded,
    categories: dedupe(categories),
    attributeGroups,
    landmarks,
    explicitSignals,
    terms: tokenize(folded)
  };
}

function inferIntent(profile: P7QueryProfile): string {
  if (profile.folded.includes("gan ") || profile.landmarks.length > 0) return "Nearby Search";
  if (profile.folded.includes("noi ") || profile.folded.includes("dia diem") || profile.folded.includes("di dau")) return "Discovery Search";
  return "Category Search";
}

function nameTokenScore(terms: readonly string[], haystack: string, poi: P7Poi): number {
  let score = 0;
  const nameHaystack = foldForMatch(`${poi.poi_name} ${poi.brand} ${poi.sub_category}`);
  for (const term of terms) {
    if (term.length < 3 || STOP_WORDS.has(term)) continue;
    if (nameHaystack.includes(term)) score += 8;
    else if (haystack.includes(term)) score += 2.5;
  }
  if (foldForMatch(poi.poi_name).split(/\s+/).some((token) => terms.includes(token))) score += 8;
  return score;
}

function pricePreferenceScore(profile: P7QueryProfile, poi: P7Poi): number {
  if (!matchesAny(profile.folded, ["gia re", "gia hop ly", "mien phi", "budget", "free"])) return 0;
  if (matchesAny(profile.folded, ["mien phi", "free"])) return poi.price_level <= 1 ? 14 : -4;
  return poi.price_level <= 2 ? 10 : -3;
}

function selectCorpus(state: unknown): readonly P7Poi[] {
  if (isRecord(state) && Array.isArray(state.pois)) {
    const pois = state.pois.filter(isPoi);
    if (pois.length > 0) return pois;
  }
  return p7PoiCorpus;
}

function selectInput(input: unknown): { query: string; limit?: number; userLocation?: P7TurnLocation } {
  if (!isRecord(input)) return { query: "" };
  const selected: { query: string; limit?: number; userLocation?: P7TurnLocation } = {
    query: typeof input.query === "string" ? input.query : ""
  };
  if (typeof input.limit === "number") selected.limit = input.limit;
  if (isLocation(input.userLocation)) selected.userLocation = input.userLocation;
  return selected;
}

function normalizeLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) return 5;
  return Math.max(1, Math.min(20, Math.trunc(limit)));
}

function group(canonical: string, aliases: readonly string[], poiAliases: readonly string[], weight?: number): AttributeGroup {
  return { canonical, aliases, poiAliases, weight };
}

export function foldForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(folded: string): string[] {
  return folded.split(/\s+/).filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

function matchesAny(foldedHaystack: string, rawNeedles: readonly string[]): boolean {
  return rawNeedles.some((needle) => {
    const foldedNeedle = foldForMatch(needle);
    return foldedNeedle.length > 0 && foldedHaystack.includes(foldedNeedle);
  });
}

function signalWords(signal: string): string[] {
  if (signal === "distance_score") return ["location", "gần", "near", "distance"];
  if (signal === "rating_score") return ["rating", "đánh giá", "best"];
  if (signal === "popularity_score") return ["popular", "nổi tiếng", "phổ biến"];
  if (signal === "business_attributes") return ["wifi", "parking", "mở khuya", "24/7"];
  return [signal.replace(/_/g, " ")];
}

function compareCandidates(left: Candidate, right: Candidate): number {
  const score = right.score - left.score;
  if (score !== 0) return score;
  const relevance = right.relevanceScore - left.relevanceScore;
  if (relevance !== 0) return relevance;
  const location = right.locationScore - left.locationScore;
  if (location !== 0) return location;
  const rating = right.ratingScore - left.ratingScore;
  if (rating !== 0) return rating;
  return left.result.poi_id.localeCompare(right.result.poi_id);
}

function nearestDistance(poi: P7Poi, landmarks: readonly P7LandmarkAlias[], userLocation: P7TurnLocation | undefined): number | undefined {
  const distances: number[] = [];
  if (userLocation !== undefined) distances.push(distanceMeters(poi.latitude, poi.longitude, userLocation.lat, userLocation.lon));
  for (const landmark of landmarks) {
    if (landmark.lat !== undefined && landmark.lon !== undefined) {
      distances.push(distanceMeters(poi.latitude, poi.longitude, landmark.lat, landmark.lon));
    }
  }
  if (distances.length === 0) return undefined;
  return Math.min(...distances);
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radius = 6_371_000;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function radians(value: number): number {
  return (value * Math.PI) / 180;
}

function normalized(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function dedupe<T>(values: readonly T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function roundScore(value: number): number {
  return Number(value.toFixed(6));
}

function sameFold(left: string, right: string): boolean {
  return foldForMatch(left) === foldForMatch(right);
}

function isLocation(value: unknown): value is P7TurnLocation {
  return isRecord(value) && typeof value.lat === "number" && typeof value.lon === "number";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPoi(value: unknown): value is P7Poi {
  return (
    isRecord(value) &&
    typeof value.poi_id === "string" &&
    typeof value.poi_name === "string" &&
    typeof value.category === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number"
  );
}
