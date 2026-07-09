import { canonicalText } from "../src/conversation.js";
import type { P8TurnResponse } from "../src/turn.js";

export interface P8EvalCase {
  readonly case_id: string;
  readonly input: {
    readonly message: string;
    readonly conversation_history: readonly { readonly role: "user" | "assistant"; readonly content: string }[];
    readonly userId: string;
  };
  readonly expected: {
    readonly intent: string;
    readonly recommendation_names: readonly string[];
    readonly recommendation_ids: readonly string[];
    readonly map_action: string;
    readonly clarification: boolean;
    readonly response_summary_tags: readonly string[];
  };
  readonly metadata: {
    readonly category: string;
    readonly difficulty: string;
    readonly skills_tested: readonly string[];
  };
}

export interface CaseScore {
  readonly case_id: string;
  readonly category: string;
  readonly intent: boolean;
  readonly map_action: boolean;
  readonly recommendation: boolean;
}

export function scoreCase(testCase: P8EvalCase, actual: P8TurnResponse): CaseScore {
  return {
    case_id: testCase.case_id,
    category: testCase.metadata.category,
    intent: canonicalText(actual.intent) === canonicalText(testCase.expected.intent),
    map_action: scoreMapAction(testCase.expected.map_action, actual),
    recommendation: scoreRecommendations(testCase, actual)
  };
}

export function summarizeScores(scores: readonly CaseScore[]) {
  const byCategory = new Map<string, CaseScore[]>();
  for (const score of scores) {
    const list = byCategory.get(score.category) ?? [];
    list.push(score);
    byCategory.set(score.category, list);
  }
  return {
    overall: summarizeGroup(scores),
    categories: [...byCategory.entries()].map(([category, rows]) => ({ category, ...summarizeGroup(rows) })),
    misses: scores
      .filter((score) => !score.intent || !score.map_action || !score.recommendation)
      .map((score) => ({
        case_id: score.case_id,
        category: score.category,
        intent: score.intent,
        map_action: score.map_action,
        recommendation: score.recommendation
      }))
  };
}

function summarizeGroup(scores: readonly CaseScore[]) {
  return {
    cases: scores.length,
    intent: ratio(scores.filter((score) => score.intent).length, scores.length),
    map_action: ratio(scores.filter((score) => score.map_action).length, scores.length),
    recommendation: ratio(scores.filter((score) => score.recommendation).length, scores.length)
  };
}

function scoreMapAction(expected: string, actual: P8TurnResponse): boolean {
  const expectedFolded = expandAliases(canonicalText(expected));
  const actualFolded = expandAliases(canonicalText(
    [
      actual.map_action.type,
      actual.map_action.query,
      actual.map_action.category,
      actual.map_action.location,
      actual.map_action.origin,
      actual.map_action.destination,
      ...(actual.map_action.attributes ?? []),
      ...(actual.map_action.candidates ?? [])
    ]
      .filter(Boolean)
      .join(" ")
  ));
  if (expectedFolded.includes("clarify") && actual.map_action.type === "clarify") return true;
  if (expectedFolded.includes("route") && actual.map_action.type === "route") return true;
  if (expectedFolded.includes("plan") && actual.map_action.type === "plan") return true;
  if (expectedFolded.includes("explain") && actual.map_action.type === "explain") return true;
  if (expectedFolded.includes("recommend") && actual.map_action.type === "recommend") return tokenOverlap(expectedFolded, actualFolded) >= 0.25;
  if (expectedFolded.includes("search") && actual.map_action.type === "search") return tokenOverlap(expectedFolded, actualFolded) >= 0.25;
  return tokenOverlap(expectedFolded, actualFolded) >= 0.35;
}

function scoreRecommendations(testCase: P8EvalCase, actual: P8TurnResponse): boolean {
  const actualIds = new Set(actual.recommendations.map((rec) => rec.poi_id).filter(Boolean));
  if (testCase.expected.recommendation_ids.some((id) => actualIds.has(id))) return true;
  const actualNames = actual.recommendations.map((rec) => canonicalText(rec.poi_name)).join(" ");
  return testCase.expected.recommendation_names.some((name) => {
    const expected = canonicalText(name.replace("nếu ngân sách phù hợp", ""));
    if (!expected) return false;
    if (actualNames.includes(expected) || expected.includes(actualNames)) return true;
    return tokenOverlap(expected, actualNames) >= 0.5;
  });
}

function tokenOverlap(expectedFolded: string, actualFolded: string): number {
  const ignore = new Set(["a", "an", "the", "or", "va", "và", "voi", "gan", "near", "with", "co", "cho", "phu", "hop"]);
  const expected = expectedFolded.split(" ").filter((token) => token.length > 2 && !ignore.has(token));
  if (expected.length === 0) return 0;
  const actual = new Set(actualFolded.split(" "));
  return expected.filter((token) => actual.has(token)).length / expected.length;
}

function expandAliases(folded: string): string {
  const pairs: readonly [string, string][] = [
    ["date", "hen ho lang man"],
    ["romantic", "hen ho lang man"],
    ["kids", "tre em gia dinh"],
    ["children", "tre em gia dinh"],
    ["family", "gia dinh tre em"],
    ["work", "lam viec gap doi tac"],
    ["meeting", "gap doi tac hop business"],
    ["business", "cong tac gap doi tac tiep khach"],
    ["quiet", "yen tinh khong on"],
    ["beach", "bien gan bien"],
    ["pool", "ho boi"],
    ["parking", "bai do xe cho dau xe"],
    ["gas", "xang tram xang cay xang"],
    ["food", "nha hang quan an dac san pho bun cha mi quang"],
    ["local", "dac san dia phuong"],
    ["budget", "gia hop ly gia re"],
    ["hotel", "khach san"],
    ["restaurant", "nha hang quan an"],
    ["cafe", "ca phe quan ca phe"],
    ["airport", "san bay tan son nhat noi bai"],
    ["discover", "kham pha du lich check in chup hinh"],
    ["nearby", "gan toi gan day"],
    ["hcmc", "tp hcm sai gon"],
    ["hanoi", "ha noi"],
    ["danang", "da nang"],
    ["route", "chi duong dan duong"],
    ["recommend", "goi y de xuat"],
    ["search", "tim kiem"]
  ];
  const extras: string[] = [];
  for (const [left, right] of pairs) {
    if (folded.includes(left)) extras.push(right);
    if (right.split(" ").some((token) => folded.includes(token))) extras.push(left);
  }
  return `${folded} ${extras.join(" ")}`.trim();
}

function ratio(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 10000) / 10000;
}
