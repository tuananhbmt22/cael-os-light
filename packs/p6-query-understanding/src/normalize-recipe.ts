import { accentFold, expandAbbreviations, parseSimpleAddress } from "@cael/os-light";
import type { AddressParts, NormalizeRecipe } from "@cael/os-light";

export const abbreviationEntries = [
  ["q1", "quận 1"],
  ["q.1", "quận 1"],
  ["q2", "quận 2"],
  ["q.2", "quận 2"],
  ["q3", "quận 3"],
  ["q.3", "quận 3"],
  ["q4", "quận 4"],
  ["q.4", "quận 4"],
  ["q5", "quận 5"],
  ["q.5", "quận 5"],
  ["q6", "quận 6"],
  ["q7", "quận 7"],
  ["q8", "quận 8"],
  ["q9", "quận 9"],
  ["q10", "quận 10"],
  ["q11", "quận 11"],
  ["q12", "quận 12"],
  ["q.", "quận"],
  ["q", "quận"],
  ["p.", "phường"],
  ["p", "phường"],
  ["tp.", "thành phố"],
  ["tp", "thành phố"],
  ["hcm", "hồ chí minh"],
  ["tphcm", "thành phố hồ chí minh"],
  ["hn", "hà nội"],
  ["dn", "đà nẵng"],
  ["ct", "cần thơ"],
  ["hp", "hải phòng"],
  ["td", "thủ đức"],
  ["bt", "bình thạnh"],
  ["pn", "phú nhuận"],
  ["tb", "tân bình"],
  ["hbt", "hai bà trưng"],
  ["hk", "hoàn kiếm"],
  ["cg", "cầu giấy"],
  ["đh", "đại học"],
  ["dh", "đại học"],
  ["bv", "bệnh viện"],
  ["pk", "phòng khám"],
  ["bs", "bác sĩ"],
  ["ttyt", "trung tâm y tế"],
  ["tttm", "trung tâm thương mại"],
  ["ch", "cửa hàng"],
  ["st", "siêu thị"],
  ["ks", "khách sạn"],
  ["nh", "nhà hàng"],
  ["qa", "quán ăn"],
  ["cf", "cafe"],
  ["cp", "cà phê"],
  ["cx", "chung cư"],
  ["cc", "chung cư"],
  ["kcn", "khu công nghiệp"],
  ["kdt", "khu đô thị"],
  ["ng", "nguyễn"],
  ["nt", "nguyễn trãi"],
  ["nct", "nguyễn chí thanh"],
  ["hvt", "hoàng văn thụ"],
  ["dbp", "điện biên phủ"],
  ["lvc", "lý văn chương"],
  ["ltt", "lê thánh tôn"],
  ["lhp", "lê hồng phong"],
  ["hvh", "huỳnh văn bánh"],
  ["xvnt", "xô viết nghệ tĩnh"],
  ["pvt", "phan văn trị"],
  ["cmt8", "cách mạng tháng 8"],
  ["dt", "đường"],
  ["dg", "đường"],
  ["duong", "đường"],
  ["hem", "hẻm"],
  ["hx", "hẻm xe"],
  ["nga4", "ngã tư"],
  ["nga3", "ngã ba"],
  ["benxe", "bến xe"],
  ["bx", "bến xe"],
  ["sanbay", "sân bay"],
  ["sb", "sân bay"],
  ["cayxang", "cây xăng"],
  ["tramxang", "trạm xăng"],
  ["ubnd", "ủy ban nhân dân"]
] as const;

export const vnMapsAbbreviations: Record<string, string> = Object.fromEntries(abbreviationEntries);

export const p6NormalizeRecipe: NormalizeRecipe = {
  steps: ["abbrev-dict"],
  abbreviations: vnMapsAbbreviations
};

export interface NormalizedQuery {
  original_query: string;
  corrected_query: string;
  expanded_query: string;
  normalized_query: string;
  parsed_address: AddressParts;
}

const phraseCorrections = [
  ["benh vien cho ray", "bệnh viện chợ rẫy"],
  ["benh vien da khoa", "bệnh viện đa khoa"],
  ["trung tam thuong mai", "trung tâm thương mại"],
  ["quan cafe", "quán cafe"],
  ["gan day", "gần đây"],
  ["gan", "gần"],
  ["cho ray", "chợ rẫy"],
  ["ben nghe", "bến nghé"],
  ["nguyen hue", "nguyễn huệ"],
  ["le loi", "lê lợi"],
  ["hai chau", "hải châu"],
  ["nha hang", "nhà hàng"],
  ["cay xang", "cây xăng"],
  ["tram xang", "trạm xăng"],
  ["phuong", "phường"],
  ["quan 1", "quận 1"],
  ["quan 2", "quận 2"],
  ["quan 3", "quận 3"],
  ["quan 4", "quận 4"],
  ["quan 5", "quận 5"],
  ["thanh pho", "thành phố"],
  ["ho chi minh", "hồ chí minh"],
  ["da nang", "đà nẵng"],
  ["ha noi", "hà nội"],
  ["nguyen", "nguyễn"],
  ["benh vien", "bệnh viện"],
  ["da khoa", "đa khoa"],
  ["dai hoc", "đại học"],
  ["sieu thi", "siêu thị"],
  ["khach san", "khách sạn"],
  ["chung cu", "chung cư"],
  ["duong", "đường"]
] as const;

const districtAliases = new Map([
  ["hai chau", "hải châu"],
  ["quan 1", "quận 1"],
  ["quan 2", "quận 2"],
  ["quan 3", "quận 3"],
  ["quan 4", "quận 4"],
  ["quan 5", "quận 5"]
]);

export function normalizeQueryText(query: string): NormalizedQuery {
  const original = query;
  const prepared = cleanSpacing(query.toLowerCase());
  const expanded = cleanSpacing(expandAbbreviations(prepared, vnMapsAbbreviations).toLowerCase());
  const restored = cleanSpacing(restoreVietnamese(expanded));
  const parsedAddress = parseVietnameseAddress(restored);
  return {
    original_query: original,
    corrected_query: restored,
    expanded_query: restored,
    normalized_query: restored,
    parsed_address: parsedAddress
  };
}

export function restoreVietnamese(text: string): string {
  let current = accentFold(text).toLowerCase();
  for (const [folded, restored] of [...phraseCorrections].sort(([left], [right]) => right.length - left.length)) {
    current = current.replace(new RegExp(`(^|\\s|,)${escapeRegExp(folded)}(?=\\s|$|,)`, "g"), (_match, prefix: string) => {
      return `${prefix}${restored}`;
    });
  }
  return cleanSpacing(current);
}

export function parseVietnameseAddress(normalizedText: string): AddressParts {
  const base = parseSimpleAddress(normalizedText);
  const rawParts = base.rawParts.map((part) => cleanSpacing(part));
  const result: AddressParts = { rawParts };
  const first = rawParts[0];
  const second = rawParts[1];
  const third = rawParts[2];
  if (first !== undefined && looksLikeStreet(first)) result.street = first;
  if (second !== undefined) {
    const foldedSecond = canonicalKey(second);
    if (foldedSecond.startsWith("phuong ")) result.ward = second;
    else if (districtAliases.has(foldedSecond) || foldedSecond.startsWith("quan ")) result.district = second;
    else result.ward = second;
  }
  if (third !== undefined) {
    const foldedThird = canonicalKey(third);
    if (districtAliases.has(foldedThird) || foldedThird.startsWith("quan ")) result.district = third;
    else result.city = rawParts.slice(2).join(", ");
  }
  if (rawParts.length > 3) result.city = rawParts.slice(3).join(", ");
  return result;
}

export function canonicalKey(value: string): string {
  return accentFold(value).toLowerCase().trim().replace(/[^\p{Letter}\p{Number}\s-]/gu, "").replace(/\s+/g, " ");
}

export function cleanSpacing(value: string): string {
  return value.trim().replace(/\s+,/g, ",").replace(/,\s+/g, ", ").replace(/\s+/g, " ");
}

function looksLikeStreet(value: string): boolean {
  const folded = canonicalKey(value);
  return /^\d+\s+/.test(folded) || ["nguyen hue", "le loi", "cao thang", "ham nghi", "mai chi tho"].includes(folded);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
