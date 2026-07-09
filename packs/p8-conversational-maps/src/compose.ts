import * as p6IntentRules from "../../p6-query-understanding/src/intent-rules.js";
import * as p7Rank from "../../p7-semantic-ranking/src/rank.js";
import { buildP8ConversationContext, canonicalText, type P8ConversationContext, type P8ConversationInput } from "./conversation.js";
import { p8AsP7PoiCorpus, p8PoiById, p8PoiCorpus, type P8Poi } from "./corpus.js";
import { getP8UserPreference, type P8UserPreference } from "./preferences.js";

export interface P8TurnLocation {
  readonly lat: number;
  readonly lon: number;
  readonly label?: string;
}

export interface P8ComposeRequest extends P8ConversationInput {
  readonly turnId: string;
  readonly userLocation?: P8TurnLocation;
}

export interface P8Recommendation {
  readonly poi_id?: string;
  readonly poi_name: string;
  readonly reason: string;
  readonly score?: number;
}

export interface P8MapAction {
  readonly type: "search" | "recommend" | "route" | "clarify" | "plan" | "explain";
  readonly query?: string;
  readonly category?: string;
  readonly location?: string;
  readonly attributes?: readonly string[];
  readonly origin?: string;
  readonly destination?: string;
  readonly candidates?: readonly string[];
}

export interface P8Clarification {
  readonly needed: boolean;
  readonly question?: string;
  readonly candidates?: readonly string[];
}

export interface P8CompositionDecision {
  readonly intent: string;
  readonly assistant_response: string;
  readonly recommendations: readonly P8Recommendation[];
  readonly map_action: P8MapAction;
  readonly clarification?: P8Clarification;
  readonly context: P8ConversationContext;
  readonly p6: p6IntentRules.P6Understanding;
  readonly p7?: p7Rank.P7RankingDecision;
  readonly firing_rule: string;
  readonly confidence: number;
}

interface ConstraintProfile {
  readonly actionType: P8MapAction["type"];
  readonly categories: readonly string[];
  readonly attributes: readonly string[];
  readonly location?: string;
  readonly namedEntities: readonly string[];
  readonly queryFolded: string;
  readonly cuisine?: string;
  readonly budget?: string;
  readonly time?: string;
}

interface ScoredPoi {
  readonly poi: P8Poi;
  readonly score: number;
  readonly reasons: readonly string[];
  readonly p7RankIndex: number;
}

export function composeP8Turn(state: unknown, request: P8ComposeRequest): P8CompositionDecision {
  const context = buildP8ConversationContext(state, request);
  const profile = getP8UserPreference(request.userId);
  const p6 = p6IntentRules.understandQuery(context.condensed_query);
  const clarification = resolveClarification(context, p6);
  if (clarification !== undefined) {
    return clarificationDecision(context, p6, clarification);
  }

  const constraints = deriveConstraints(context, profile);
  const p7Input = {
    query: rankingQuery(context, profile),
    limit: 12,
    ...(request.userLocation ? { userLocation: request.userLocation } : {})
  };
  const p7 = p7Rank.evaluateP7RankingWithCorpus(p8AsP7PoiCorpus, p7Input);
  const scored = scoreP8Pois(p7, constraints, profile);
  const recommendations = chooseRecommendations(scored, constraints).map(toRecommendation);
  const map_action = buildMapAction(context, constraints, recommendations);
  const intent = intentLabelFor(context, constraints, map_action);
  return {
    intent,
    assistant_response: responseFor(intent, recommendations, map_action, profile),
    recommendations,
    map_action,
    clarification: { needed: false },
    context,
    p6,
    p7,
    firing_rule: `P8_${map_action.type.toLocaleUpperCase("en-US")}`,
    confidence: recommendations.length > 0 ? 0.86 : 0.55
  };
}

function resolveClarification(context: P8ConversationContext, p6: p6IntentRules.P6Understanding): P8Clarification | undefined {
  const folded = canonicalText(context.latest_user_message);
  if (folded.includes("galaxy")) {
    return poiClarification("Galaxy", findPoisByName("galaxy"));
  }
  if (folded === "vincom" || folded.includes(" vincom")) {
    return poiClarification("Vincom", findPoisByName("vincom"));
  }
  if (folded.includes("san bay") && !folded.includes("tan son nhat") && !folded.includes("noi bai")) {
    return poiClarification("sân bay", p8PoiCorpus.filter((poi) => canonicalText(poi.category) === "san bay"));
  }
  if (folded.includes("big c") || folded.includes("go!")) {
    return {
      needed: true,
      question: "Bạn muốn tìm Big C/GO! cụ thể hay tìm trung tâm thương mại gần vị trí hiện tại?",
      candidates: ["GO!/Big C gần bạn", "Trung tâm thương mại gần bạn"]
    };
  }
  const onlyBareCategory = p6.ambiguity.detected && context.slots.category !== undefined && context.slots.location === undefined && context.slots.attributes.length === 0;
  if (onlyBareCategory) {
    return {
      needed: true,
      question: `Bạn muốn tìm ${context.slots.category} ở khu vực nào?`,
      candidates: [`category:${context.slots.category}`]
    };
  }
  return undefined;
}

function poiClarification(entity: string, pois: readonly P8Poi[]): P8Clarification {
  return {
    needed: true,
    question: `Bạn muốn ${entity} nào? ${pois.map((poi) => poi.poi_name).join(" hay ")}?`,
    candidates: pois.map((poi) => poi.poi_name)
  };
}

function clarificationDecision(
  context: P8ConversationContext,
  p6: p6IntentRules.P6Understanding,
  clarification: P8Clarification
): P8CompositionDecision {
  const recommendations = p8PoiCorpus
    .filter((poi) => clarification.candidates?.includes(poi.poi_name))
    .map((poi) => ({
      poi_id: poi.poi_id,
      poi_name: poi.poi_name,
      reason: `Ứng viên làm rõ cho "${context.latest_user_message}"`,
      score: 1
    }));
  const map_action: P8MapAction = {
    type: "clarify",
    query: context.latest_user_message,
    candidates: clarification.candidates
  };
  return {
    intent: clarificationIntent(context),
    assistant_response: clarification.question ?? "Bạn muốn làm rõ địa điểm nào?",
    recommendations,
    map_action,
    clarification,
    context,
    p6,
    firing_rule: "P8_CLARIFY_AMBIGUITY",
    confidence: 0.82
  };
}

function deriveConstraints(context: P8ConversationContext, profile: P8UserPreference | undefined): ConstraintProfile {
  const folded = canonicalText([context.condensed_query, profile?.preferences.join(" "), profile?.notes].filter(Boolean).join(" "));
  const categories = categoriesFor(context, folded);
  const profileLocation = profile?.current_location;
  const location = context.slots.location === "gần tôi" ? profileLocation : context.slots.location ?? profileLocation;
  return {
    actionType: actionTypeFor(folded),
    categories,
    attributes: unique([...context.slots.attributes, ...profileAttributes(profile, folded)]),
    ...(location ? { location } : {}),
    namedEntities: unique([...context.slots.entities, ...findNamedEntities(folded)]),
    queryFolded: folded,
    ...(context.slots.cuisine ? { cuisine: context.slots.cuisine } : {}),
    ...(context.slots.budget ? { budget: context.slots.budget } : profile?.budget_level === "low" ? { budget: "low" } : {}),
    ...(context.slots.time ? { time: context.slots.time } : {})
  };
}

function rankingQuery(context: P8ConversationContext, profile: P8UserPreference | undefined): string {
  return [
    context.condensed_query,
    profile?.preferences.join(" "),
    profile?.budget_level === "low" ? "giá hợp lý" : undefined,
    profile?.avoid.map((avoid) => `không ${avoid}`).join(" ")
  ]
    .filter(Boolean)
    .join(" ");
}

function categoriesFor(context: P8ConversationContext, folded: string): string[] {
  const categories = new Set<string>();
  if (context.slots.category) categories.add(context.slots.category);
  if (folded.includes("rooftop")) categories.add("Bar/Rooftop");
  if (folded.includes("hen ho") || folded.includes("lang man") || folded.includes("tiep khach")) categories.add("Nhà hàng");
  if (folded.includes("cafe") || folded.includes("ca phe") || folded.includes("hoc nhom") || folded.includes("gap doi tac")) categories.add("Quán cà phê");
  if (folded.includes("khach san") || folded.includes("hotel") || folded.includes("cong tac")) categories.add("Khách sạn");
  if (folded.includes("xang")) categories.add("Trạm xăng");
  if (folded.includes("tre em") || folded.includes("khu vui choi")) categories.add("Khu vui chơi");
  if (folded.includes("chup hinh") || folded.includes("check in") || folded.includes("di choi")) categories.add("Địa điểm du lịch");
  if (folded.includes("pho") || folded.includes("bun cha") || folded.includes("mi quang") || folded.includes("dac san")) categories.add("Nhà hàng");
  return [...categories];
}

function actionTypeFor(folded: string): P8MapAction["type"] {
  if (folded.includes("vi sao") || folded.includes("tom tat") || folded.includes("giai thich")) return "explain";
  if (folded.includes("chi duong") || folded.includes("dan toi") || folded.includes("dua toi") || folded.includes("mat bao lau") || /\btu\b.+\bden\b/.test(folded)) return "route";
  if (folded.includes("len lich") || folded.includes("lich trinh") || folded.includes("1 ngay") || folded.includes("2 ngay") || folded.includes("cuoi tuan")) return "plan";
  if (folded.includes("di choi") && folded.includes("ca phe")) return "plan";
  if (folded.includes("tim ") || folded.includes("kiem ") || folded.includes("co cho nao")) return "search";
  if (
    folded.includes("goi y") ||
    folded.includes("de xuat") ||
    folded.includes("nha hang nao") ||
    folded.includes("toi can") ||
    folded.includes("muon cho") ||
    folded.includes("ban gai") ||
    folded.includes("tiep khach") ||
    folded.includes("phu hop")
  ) return "recommend";
  return "search";
}

function profileAttributes(profile: P8UserPreference | undefined, folded: string): string[] {
  if (!profile) return [];
  const attrs = profile.preferences.filter((pref) => {
    const key = canonicalText(pref);
    return folded.includes(key) || folded.includes("gan toi") || folded.includes("gan day") || key.includes("wifi") || key.includes("gia");
  });
  if (profile.budget_level === "low") attrs.push("giá hợp lý");
  return attrs;
}

function scoreP8Pois(p7: p7Rank.P7RankingDecision, constraints: ConstraintProfile, profile: P8UserPreference | undefined): ScoredPoi[] {
  const p7Scores = new Map(p7.ranked_results.map((result, index) => [result.poi_id, { result, index }]));
  return p8PoiCorpus
    .map((poi) => {
      const reasons: string[] = [];
      const p7Hit = p7Scores.get(poi.poi_id);
      let score = p7Hit ? 45 - p7Hit.index * 2 + p7Hit.result.score / 10 : 0;
      if (p7Hit) reasons.push(`P7 rank ${p7Hit.index + 1}`);

      const namedScore = scoreNamedEntity(poi, constraints.namedEntities, constraints.queryFolded);
      if (namedScore > 0) {
        score += namedScore;
        reasons.push("matched named entity");
      }
      const categoryScore = scoreCategory(poi, constraints.categories);
      score += categoryScore.score;
      if (categoryScore.reason) reasons.push(categoryScore.reason);
      const locationScore = scoreLocation(poi, constraints.location);
      score += locationScore.score;
      if (locationScore.reason) reasons.push(locationScore.reason);

      const matchedAttributes = constraints.attributes.filter((attr) => poiHas(poi, attr));
      if (matchedAttributes.length > 0) {
        score += matchedAttributes.length * 20;
        reasons.push(`matched attributes: ${matchedAttributes.join(", ")}`);
      }
      if (constraints.cuisine && poiHas(poi, constraints.cuisine)) {
        score += 28;
        reasons.push(`matched cuisine ${constraints.cuisine}`);
      }
      if (constraints.time === "late" && (poiHas(poi, "mở khuya") || poiHas(poi, "24/7") || poiHas(poi, "nightlife"))) {
        score += 24;
        reasons.push("matched late/open-hours constraint");
      }
      if (constraints.budget === "low") {
        if (poiHas(poi, "giá hợp lý") || poiHas(poi, "giá vừa") || poiHas(poi, "budget")) score += 22;
        if (poiHas(poi, "cao cấp") || poiHas(poi, "luxury") || poiHas(poi, "5 sao")) score -= 26;
      }
      for (const avoid of profile?.avoid ?? []) {
        if (poiHas(poi, avoid)) {
          score -= 22;
          reasons.push(`penalized avoided trait: ${avoid}`);
        }
      }
      score += poi.rating * 2 + poi.popularity_score / 25;
      return { poi, score, reasons, p7RankIndex: p7Hit?.index ?? 99 };
    })
    .sort((left, right) => right.score - left.score || left.p7RankIndex - right.p7RankIndex || right.poi.rating - left.poi.rating);
}

function chooseRecommendations(scored: readonly ScoredPoi[], constraints: ConstraintProfile): ScoredPoi[] {
  if (constraints.actionType === "route" || constraints.actionType === "explain") return scored.slice(0, 1);
  if (constraints.actionType === "plan" || constraints.categories.length > 1) {
    const selected: ScoredPoi[] = [];
    const used = new Set<string>();
    for (const category of constraints.categories) {
      const match = scored.find((item) => !used.has(item.poi.poi_id) && categoryMatches(item.poi.category, category));
      if (match) {
        selected.push(match);
        used.add(match.poi.poi_id);
      }
    }
    for (const item of scored) {
      if (selected.length >= 3) break;
      if (used.has(item.poi.poi_id)) continue;
      selected.push(item);
      used.add(item.poi.poi_id);
    }
    return selected;
  }
  return scored.slice(0, 3);
}

function toRecommendation(item: ScoredPoi): P8Recommendation {
  return {
    poi_id: item.poi.poi_id,
    poi_name: item.poi.poi_name,
    reason: item.reasons.slice(0, 3).join("; ") || item.poi.description,
    score: round(item.score)
  };
}

function buildMapAction(context: P8ConversationContext, constraints: ConstraintProfile, recommendations: readonly P8Recommendation[]): P8MapAction {
  if (constraints.actionType === "route") {
    const destination = context.slots.destination ?? recommendations[0]?.poi_name ?? constraints.namedEntities.at(0);
    return {
      type: "route",
      query: context.latest_user_message,
      origin: context.slots.origin ?? (constraints.queryFolded.includes("quan 1") ? "trung tâm Quận 1" : undefined),
      ...(destination ? { destination } : {}),
      ...(constraints.location ? { location: constraints.location } : {})
    };
  }
  return {
    type: constraints.actionType,
    query: context.condensed_query,
    ...(constraints.categories[0] ? { category: constraints.categories[0] } : {}),
    ...(constraints.location ? { location: constraints.location } : {}),
    ...(constraints.attributes.length > 0 ? { attributes: constraints.attributes } : {})
  };
}

function intentLabelFor(context: P8ConversationContext, constraints: ConstraintProfile, action: P8MapAction): string {
  const folded = constraints.queryFolded;
  if (action.type === "explain") return folded.includes("secret garden") ? "Explain Recommendation" : "Explanation";
  if (action.type === "route") return folded.includes("mat bao lau") ? "Navigation/ETA" : "Navigation";
  if (action.type === "plan") {
    if (folded.includes("lai xe dem") || (folded.includes("xang") && folded.includes("khuya"))) return "Driver Support Planning";
    if (folded.includes("2 ngay")) return "Trip Planning";
    if (folded.includes("cho co the di bo") || (folded.includes("di choi") && folded.includes("ca phe"))) return "Discovery + Nearby Cafe";
    return "Travel Planning";
  }
  if (folded.includes("lai xe dem") || (folded.includes("xang") && folded.includes("khuya"))) return "Driver Support Planning";
  if (constraints.categories.includes("Quán cà phê")) {
    if (folded.includes("mo khuya") || folded.includes("sau 10h")) return "Late Night Cafe Search";
    if (folded.includes("hoc nhom")) return "Study Friendly Cafe";
    if (folded.includes("gap doi tac") || folded.includes("doi tac") || folded.includes("khong qua on")) return "Business Meeting Cafe";
    if (folded.includes("khong dong") || folded.includes("lam viec duoc")) return "Work Cafe Search";
    return "Coffee Shop Search";
  }
  if (constraints.categories.includes("Nhà hàng")) {
    if (folded.includes("ban gai") || folded.includes("lang man")) return "Romantic Restaurant Search";
    if (folded.includes("hen ho")) return "Date Recommendation";
    if (folded.includes("gia dinh") || folded.includes("tre em")) return folded.includes("tp hcm") || folded.includes("hcm") ? "Family Restaurant" : "Family Restaurant Search";
    if (folded.includes("pho") || folded.includes("bun cha") || folded.includes("gia hop ly")) return "Budget Local Food";
    if (folded.includes("tiep khach") || folded.includes("nuoc ngoai")) return "Business Dining Recommendation";
    return "Recommendation Request";
  }
  if (constraints.categories.includes("Khách sạn")) {
    if (folded.includes("gia dinh") && folded.includes("bien")) return "Family Beach Hotel";
    if (folded.includes("cong tac") || folded.includes("business")) return "Business Hotel Recommendation";
    return "Hotel Search";
  }
  if (constraints.categories.includes("Trạm xăng")) return "Gas Station Search";
  if (constraints.categories.includes("Khu vui chơi")) return "Kids Place Search";
  if (constraints.categories.includes("Địa điểm du lịch")) return "Discovery Search";
  return "Conversational Search";
}

function clarificationIntent(context: P8ConversationContext): string {
  const folded = canonicalText(context.latest_user_message);
  if (folded.includes("galaxy")) return "Ambiguous Navigation";
  if (folded.includes("san bay")) return "Navigation Clarification";
  if (folded.includes("vincom")) return "Brand Search Ambiguous";
  return "Ambiguous/Brand Search";
}

function responseFor(intent: string, recommendations: readonly P8Recommendation[], action: P8MapAction, profile: P8UserPreference | undefined): string {
  const names = recommendations.map((rec) => rec.poi_name).join(", ");
  if (action.type === "route") return `Mình sẽ tạo chỉ đường đến ${action.destination ?? names} từ ${action.origin ?? "vị trí xuất phát của bạn"}.`;
  if (action.type === "plan") return `Gợi ý lịch trình dựa trên ${names}, có xét vị trí và sở thích${profile ? ` của ${profile.persona}` : ""}.`;
  if (action.type === "explain") return `${names} phù hợp vì các thuộc tính trong corpus khớp yêu cầu ${intent}.`;
  return `Gợi ý ${names} vì khớp ${action.category ?? "nhu cầu"}${action.location ? ` ở ${action.location}` : ""}.`;
}

function findPoisByName(fragment: string): P8Poi[] {
  const folded = canonicalText(fragment);
  return p8PoiCorpus.filter((poi) => canonicalText([poi.poi_name, poi.brand, ...poi.tags].join(" ")).includes(folded));
}

function findNamedEntities(folded: string): string[] {
  const entities: string[] = [];
  for (const poi of p8PoiCorpus) {
    const name = canonicalText(poi.poi_name);
    const brand = canonicalText(poi.brand);
    if ((brand.length >= 4 && folded.includes(brand)) || folded.includes(name)) entities.push(poi.poi_name);
  }
  return entities;
}

function scoreNamedEntity(poi: P8Poi, entities: readonly string[], foldedQuery: string): number {
  const haystack = canonicalText([poi.poi_name, poi.brand, ...poi.tags].join(" "));
  for (const entity of entities) {
    const foldedEntity = canonicalText(entity);
    if (foldedEntity && (haystack.includes(foldedEntity) || foldedEntity.includes(canonicalText(poi.brand)))) return 90;
  }
  if (foldedQuery.includes(canonicalText(poi.brand)) && canonicalText(poi.brand).length >= 4) return 80;
  return 0;
}

function scoreCategory(poi: P8Poi, categories: readonly string[]): { score: number; reason?: string } {
  if (categories.length === 0) return { score: 0 };
  if (categories.some((category) => categoryMatches(poi.category, category))) return { score: 36, reason: `matched category ${poi.category}` };
  if (categories.some((category) => softCategoryMatches(poi.category, category))) return { score: 12, reason: `near category ${poi.category}` };
  return { score: -16 };
}

function scoreLocation(poi: P8Poi, location: string | undefined): { score: number; reason?: string } {
  if (!location) return { score: 0 };
  const foldedLocation = canonicalText(location);
  const haystack = canonicalText([poi.city, poi.district, poi.address, poi.poi_name, ...poi.tags].join(" "));
  if (haystack.includes(foldedLocation)) return { score: 30, reason: `matched location ${location}` };
  if (foldedLocation.includes("quan 1") && poi.city === "TP.HCM" && poi.district === "Quận 1") return { score: 30, reason: "matched location Quận 1" };
  if (foldedLocation.includes("hoan kiem") && poi.city === "Hà Nội" && poi.district === "Hoàn Kiếm") return { score: 30, reason: "matched location Hoàn Kiếm" };
  if (foldedLocation.includes("tan son nhat") && (poi.poi_name.includes("Tân Sơn Nhất") || poi.district === "Tân Bình")) return { score: 30, reason: "matched airport location" };
  return { score: -4 };
}

function categoryMatches(actual: string, expected: string): boolean {
  return canonicalText(actual) === canonicalText(expected) || softCategoryMatches(actual, expected);
}

function softCategoryMatches(actual: string, expected: string): boolean {
  const a = canonicalText(actual);
  const e = canonicalText(expected);
  if (e.includes("khach san") && a.includes("khach san")) return true;
  if (e.includes("nha hang") && (a.includes("nha hang") || a.includes("bar") || a.includes("rooftop"))) return true;
  if (e.includes("dia diem du lich") && (a.includes("du lich") || a.includes("van hoa") || a.includes("cho"))) return true;
  if (e.includes("khu vui choi") && (a.includes("khu vui choi") || a.includes("cong vien"))) return true;
  return false;
}

function poiHas(poi: P8Poi, token: string): boolean {
  return canonicalText([poi.poi_name, poi.brand, poi.category, poi.city, poi.district, poi.address, poi.description, ...poi.attributes, ...poi.tags].join(" ")).includes(canonicalText(token));
}

function unique(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = canonicalText(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
