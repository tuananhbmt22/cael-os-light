export type NormalizeStep = "accent-fold" | "abbrev-dict" | "address-parse";

export interface NormalizeRecipe {
  steps: NormalizeStep[];
  abbreviations?: Record<string, string>;
}

export interface AddressParts {
  rawParts: string[];
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
}

export interface NormalizeResult {
  normalized: string;
  steps: string[];
  addressParts?: AddressParts;
}

export interface NormalizeHooks {
  accentFold?: (text: string) => string;
  expandAbbreviations?: (text: string, dictionary: Record<string, string>) => string;
  parseAddress?: (text: string) => AddressParts;
}

export function normalize(text: string, recipe: NormalizeRecipe): NormalizeResult {
  let current = text;
  const steps: string[] = [];
  let addressParts: AddressParts | undefined;

  for (const step of recipe.steps) {
    if (step === "accent-fold") {
      current = accentFold(current);
      steps.push("accent-fold");
    }
    if (step === "abbrev-dict") {
      current = expandAbbreviations(current, recipe.abbreviations ?? {});
      steps.push("abbrev-dict");
    }
    if (step === "address-parse") {
      addressParts = parseSimpleAddress(current);
      current = addressParts.rawParts.join(" | ");
      steps.push("address-parse");
    }
  }

  return addressParts
    ? { normalized: current, steps, addressParts }
    : { normalized: current, steps };
}

export function canonicalizeDept(name: string, dict: Record<string, string>): string {
  const direct = dict[name];
  if (direct !== undefined) return direct;
  const target = canonicalKey(name);
  for (const [variant, canonical] of Object.entries(dict)) {
    if (canonicalKey(variant) === target) return canonical;
  }
  return name.trim().replace(/\s+/g, " ");
}

export function accentFold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function expandAbbreviations(text: string, dictionary: Record<string, string>): string {
  const entries = Object.entries(dictionary).sort(([left], [right]) => right.length - left.length || left.localeCompare(right));
  let current = text;
  const keepFolded = text === accentFold(text);
  for (const [abbr, expansion] of entries) {
    const escaped = escapeRegExp(abbr);
    const replacement = keepFolded ? accentFold(expansion) : expansion;
    current = current.replace(new RegExp(`(^|\\s)${escaped}(?=\\s|$|,|\\.)`, "gi"), (_match, prefix: string) => `${prefix}${replacement}`);
  }
  return current;
}

export function parseSimpleAddress(text: string): AddressParts {
  const rawParts = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const result: AddressParts = { rawParts };
  if (rawParts[0] !== undefined) result.street = rawParts[0];
  if (rawParts[1] !== undefined) result.ward = rawParts[1];
  if (rawParts[2] !== undefined) result.district = rawParts[2];
  if (rawParts[3] !== undefined) result.city = rawParts.slice(3).join(", ");
  return result;
}

function canonicalKey(value: string): string {
  return accentFold(value).toLowerCase().trim().replace(/\s+/g, " ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
