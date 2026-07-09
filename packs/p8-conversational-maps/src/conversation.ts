export interface P8ConversationTurn {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface P8ConversationInput {
  readonly sessionId?: string;
  readonly userId?: string;
  readonly message: string;
  readonly conversation_history?: readonly P8ConversationTurn[];
}

export interface P8SlotValues {
  readonly category?: string;
  readonly location?: string;
  readonly attributes: readonly string[];
  readonly entities: readonly string[];
  readonly origin?: string;
  readonly destination?: string;
  readonly cuisine?: string;
  readonly budget?: string;
  readonly time?: string;
}

export interface P8ConversationContext {
  readonly sessionId?: string;
  readonly user_profile_id?: string;
  readonly latest_user_message: string;
  readonly turns: readonly P8ConversationTurn[];
  readonly slots: P8SlotValues;
  readonly retained_slots: Record<string, string>;
  readonly condensed_query: string;
}

interface SlotRule {
  readonly value: string;
  readonly aliases: readonly string[];
}

const CATEGORY_RULES: readonly SlotRule[] = [
  { value: "Quán cà phê", aliases: ["cafe", "cà phê", "cà phê", "coffee", "học nhóm", "làm việc"] },
  { value: "Nhà hàng", aliases: ["nhà hàng", "quán ăn", "ăn tối", "ăn khuya", "món", "phở", "bún chả", "mì quảng"] },
  { value: "Khách sạn", aliases: ["khách sạn", "hotel", "resort"] },
  { value: "Trạm xăng", aliases: ["cây xăng", "trạm xăng", "đổ xăng", "xăng"] },
  { value: "Khu vui chơi", aliases: ["trẻ em chơi", "khu vui chơi", "kidzone", "chỗ chơi"] },
  { value: "Công viên", aliases: ["công viên", "đi bộ", "ngoài trời"] },
  { value: "Địa điểm du lịch", aliases: ["đi chơi", "tham quan", "chụp hình", "check-in", "check in", "khám phá"] },
  { value: "Rạp chiếu phim", aliases: ["rạp phim", "rạp chiếu phim", "cinema", "cgv"] },
  { value: "Trung tâm thương mại", aliases: ["vincom", "big c", "go!", "trung tâm thương mại", "mua sắm", "mall"] },
  { value: "Sân bay", aliases: ["sân bay", "tân sơn nhất", "nội bài"] }
];

const LOCATION_RULES: readonly SlotRule[] = [
  { value: "Hoàn Kiếm", aliases: ["hoàn kiếm", "ho hoan kiem", "hồ hoàn kiếm", "hồ gươm", "ho guom"] },
  { value: "Quận 1", aliases: ["quận 1", "quan 1", "sài gòn", "saigon", "trung tâm sài gòn"] },
  { value: "TP.HCM", aliases: ["tp.hcm", "tphcm", "hồ chí minh", "ho chi minh", "sài gòn"] },
  { value: "Hà Nội", aliases: ["hà nội", "ha noi"] },
  { value: "Đà Nẵng", aliases: ["đà nẵng", "da nang", "sơn trà", "son tra"] },
  { value: "Đà Lạt", aliases: ["đà lạt", "da lat"] },
  { value: "Hội An", aliases: ["hội an", "hoi an"] },
  { value: "Nha Trang", aliases: ["nha trang"] },
  { value: "Tân Sơn Nhất", aliases: ["tân sơn nhất", "tan son nhat", "tsn"] },
  { value: "Nội Bài", aliases: ["nội bài", "noi bai"] },
  { value: "Hạ Long", aliases: ["hạ long", "ha long"] },
  { value: "gần tôi", aliases: ["gần tôi", "gần đây", "nearby", "gần đây"] }
];

const ATTRIBUTE_RULES: readonly SlotRule[] = [
  { value: "wifi", aliases: ["wifi", "wi-fi"] },
  { value: "yên tĩnh", aliases: ["yên tĩnh", "không quá ồn", "không đông", "không quá đông", "quiet"] },
  { value: "làm việc", aliases: ["làm việc", "work", "gặp đối tác", "họp", "công tác"] },
  { value: "học nhóm", aliases: ["học nhóm", "học bài", "study"] },
  { value: "gia đình", aliases: ["gia đình", "trẻ em", "trẻ nhỏ", "kids", "family"] },
  { value: "trẻ em", aliases: ["trẻ em", "trẻ nhỏ", "kids", "children"] },
  { value: "hẹn hò", aliases: ["hẹn hò", "bạn gái", "lãng mạn", "date"] },
  { value: "view đẹp", aliases: ["view đẹp", "view", "chụp hình", "check-in", "check in"] },
  { value: "gần biển", aliases: ["gần biển", "đi biển", "biển", "beach"] },
  { value: "hồ bơi", aliases: ["hồ bơi", "pool"] },
  { value: "mở khuya", aliases: ["mở khuya", "mở sau 10h", "sau 10h", "ăn khuya", "lái xe đêm", "đêm"] },
  { value: "toilet", aliases: ["toilet", "nhà vệ sinh"] },
  { value: "24/7", aliases: ["24/7", "24h"] },
  { value: "bãi đỗ xe", aliases: ["bãi đỗ xe", "chỗ đậu xe", "đậu xe", "parking"] },
  { value: "đặc sản", aliases: ["đặc sản", "địa phương", "local"] },
  { value: "giá hợp lý", aliases: ["giá hợp lý", "giá rẻ", "không quá cao", "rẻ", "budget", "dưới 500k"] },
  { value: "rooftop", aliases: ["rooftop"] },
  { value: "business", aliases: ["business", "công tác", "tiếp khách", "đối tác"] }
];

export function buildP8ConversationContext(previousState: unknown, input: P8ConversationInput): P8ConversationContext {
  const turns = normalizeTurns(input);
  const previousSlots = slotsFromState(previousState);
  let slots: P8SlotValues = {
    attributes: previousSlots.attributes,
    entities: previousSlots.entities,
    ...(previousSlots.category ? { category: previousSlots.category } : {}),
    ...(previousSlots.location ? { location: previousSlots.location } : {}),
    ...(previousSlots.origin ? { origin: previousSlots.origin } : {}),
    ...(previousSlots.destination ? { destination: previousSlots.destination } : {}),
    ...(previousSlots.cuisine ? { cuisine: previousSlots.cuisine } : {}),
    ...(previousSlots.budget ? { budget: previousSlots.budget } : {}),
    ...(previousSlots.time ? { time: previousSlots.time } : {})
  };

  for (const turn of turns) {
    if (turn.role !== "user") continue;
    slots = mergeSlots(slots, extractSlots(turn.content));
  }

  const retained_slots = toRetainedRecord(slots);
  return {
    ...(input.sessionId ? { sessionId: input.sessionId } : {}),
    ...(input.userId ? { user_profile_id: input.userId } : {}),
    latest_user_message: input.message,
    turns,
    slots,
    retained_slots,
    condensed_query: condenseQuery(input.message, slots)
  };
}

export function canonicalText(value: string): string {
  return value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeTurns(input: P8ConversationInput): P8ConversationTurn[] {
  const turns = [...(input.conversation_history ?? [])];
  const last = turns.at(-1);
  if (last?.role !== "user" || canonicalText(last.content) !== canonicalText(input.message)) {
    turns.push({ role: "user", content: input.message });
  }
  return turns;
}

function extractSlots(text: string): P8SlotValues {
  const folded = canonicalText(text);
  const category = firstRuleValue(folded, CATEGORY_RULES);
  const location = firstRuleValue(folded, LOCATION_RULES);
  const attributes = valuesForRules(folded, ATTRIBUTE_RULES);
  const entities = extractEntities(text);
  const route = extractRoute(text);
  const cuisine = extractCuisine(folded);
  const budget = attributes.includes("giá hợp lý") || folded.includes("ngan sach thap") ? "low" : undefined;
  const time = attributes.includes("mở khuya") ? "late" : undefined;
  return {
    attributes,
    entities,
    ...(category ? { category } : {}),
    ...(location ? { location } : {}),
    ...(route.origin ? { origin: route.origin } : {}),
    ...(route.destination ? { destination: route.destination } : {}),
    ...(cuisine ? { cuisine } : {}),
    ...(budget ? { budget } : {}),
    ...(time ? { time } : {})
  };
}

function mergeSlots(left: P8SlotValues, right: P8SlotValues): P8SlotValues {
  return {
    category: right.category ?? left.category,
    location: right.location ?? left.location,
    origin: right.origin ?? left.origin,
    destination: right.destination ?? left.destination,
    cuisine: right.cuisine ?? left.cuisine,
    budget: right.budget ?? left.budget,
    time: right.time ?? left.time,
    attributes: unique([...left.attributes, ...right.attributes]),
    entities: unique([...left.entities, ...right.entities])
  };
}

function condenseQuery(message: string, slots: P8SlotValues): string {
  const parts = [
    slots.category,
    message,
    slots.location,
    slots.cuisine,
    slots.budget === "low" ? "giá hợp lý" : undefined,
    slots.time === "late" ? "mở khuya" : undefined,
    ...slots.attributes
  ].filter((part): part is string => Boolean(part && part.trim()));
  return unique(parts).join(" ");
}

function firstRuleValue(folded: string, rules: readonly SlotRule[]): string | undefined {
  return rules.find((rule) => rule.aliases.some((alias) => folded.includes(canonicalText(alias))))?.value;
}

function valuesForRules(folded: string, rules: readonly SlotRule[]): string[] {
  return rules.filter((rule) => rule.aliases.some((alias) => folded.includes(canonicalText(alias)))).map((rule) => rule.value);
}

function extractCuisine(folded: string): string | undefined {
  if (folded.includes("mon y") || folded.includes("pizza") || folded.includes("italian")) return "Italian";
  if (folded.includes("pho")) return "phở";
  if (folded.includes("bun cha")) return "bún chả";
  if (folded.includes("mi quang")) return "mì quảng";
  if (folded.includes("dac san")) return "đặc sản";
  return undefined;
}

function extractRoute(text: string): { origin?: string; destination?: string } {
  const fromTo = text.match(/từ\s+(.+?)\s+đến\s+(.+?)(?:[.?]|$)/i);
  if (fromTo?.[1] && fromTo[2]) return { origin: fromTo[1].trim(), destination: fromTo[2].trim() };
  const toFrom = text.match(/(?:đi|đến)\s+(.+?)\s+từ\s+(.+?)(?:[.?]|$)/i);
  if (toFrom?.[1] && toFrom[2]) return { origin: toFrom[2].trim(), destination: toFrom[1].trim() };
  const leadTo = text.match(/(?:đưa tôi đến|dẫn tôi đến)\s+(.+?)(?:[.?]|$)/i);
  if (leadTo?.[1]) return { destination: leadTo[1].trim() };
  return {};
}

function extractEntities(text: string): string[] {
  const folded = canonicalText(text);
  const out: string[] = [];
  for (const entity of ["Galaxy", "Vincom", "Big C", "GO!", "Lotte Hotel", "Secret Garden", "Phở Thìn", "Hồ Gươm", "Hồ Hoàn Kiếm", "Tân Sơn Nhất", "Nội Bài"]) {
    if (folded.includes(canonicalText(entity))) out.push(entity);
  }
  return unique(out);
}

function slotsFromState(state: unknown): P8SlotValues {
  if (!state || typeof state !== "object" || !("retained_slots" in state)) {
    return { attributes: [], entities: [] };
  }
  const retained = (state as { retained_slots?: Record<string, string> }).retained_slots ?? {};
  return {
    attributes: splitRetained(retained.attributes),
    entities: splitRetained(retained.entities),
    ...(retained.category ? { category: retained.category } : {}),
    ...(retained.location ? { location: retained.location } : {}),
    ...(retained.origin ? { origin: retained.origin } : {}),
    ...(retained.destination ? { destination: retained.destination } : {}),
    ...(retained.cuisine ? { cuisine: retained.cuisine } : {}),
    ...(retained.budget ? { budget: retained.budget } : {}),
    ...(retained.time ? { time: retained.time } : {})
  };
}

function toRetainedRecord(slots: P8SlotValues): Record<string, string> {
  const record: Record<string, string> = {};
  if (slots.category) record.category = slots.category;
  if (slots.location) record.location = slots.location;
  if (slots.origin) record.origin = slots.origin;
  if (slots.destination) record.destination = slots.destination;
  if (slots.cuisine) record.cuisine = slots.cuisine;
  if (slots.budget) record.budget = slots.budget;
  if (slots.time) record.time = slots.time;
  if (slots.attributes.length > 0) record.attributes = slots.attributes.join(";");
  if (slots.entities.length > 0) record.entities = slots.entities.join(";");
  return record;
}

function splitRetained(value: string | undefined): string[] {
  return value?.split(";").map((part) => part.trim()).filter(Boolean) ?? [];
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
