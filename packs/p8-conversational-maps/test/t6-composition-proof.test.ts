import { describe, expect, it, vi } from "vitest";

vi.mock("../../p6-query-understanding/src/intent-rules.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../p6-query-understanding/src/intent-rules.js")>();
  return { ...actual, understandQuery: vi.fn(actual.understandQuery) };
});

vi.mock("../../p7-semantic-ranking/src/rank.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../p7-semantic-ranking/src/rank.js")>();
  return { ...actual, evaluateP7RankingWithCorpus: vi.fn(actual.evaluateP7RankingWithCorpus) };
});

describe("T6 P8 composition proof", () => {
  it("calls P6 understandQuery and P7 evaluateP7RankingWithCorpus on a search turn", async () => {
    const p6 = await import("../../p6-query-understanding/src/intent-rules.js");
    const p7 = await import("../../p7-semantic-ranking/src/rank.js");
    const { runP8Turn } = await import("../src/turn.js");

    vi.mocked(p6.understandQuery).mockClear();
    vi.mocked(p7.evaluateP7RankingWithCorpus).mockClear();
    const result = runP8Turn({}, {
      turnId: "composition-search",
      sessionId: "composition",
      userId: "U001",
      message: "Tìm quán cà phê yên tĩnh để làm việc gần tôi."
    });

    expect(result.map_action.type).toBe("search");
    expect(p6.understandQuery).toHaveBeenCalledTimes(1);
    expect(p7.evaluateP7RankingWithCorpus).toHaveBeenCalledTimes(1);
    expect(vi.mocked(p7.evaluateP7RankingWithCorpus).mock.calls[0]?.[0]).toHaveLength(80);
  });

  it("calls P6 but deliberately does not call P7 for unresolved Galaxy ambiguity", async () => {
    const p6 = await import("../../p6-query-understanding/src/intent-rules.js");
    const p7 = await import("../../p7-semantic-ranking/src/rank.js");
    const { runP8Turn } = await import("../src/turn.js");

    vi.mocked(p6.understandQuery).mockClear();
    vi.mocked(p7.evaluateP7RankingWithCorpus).mockClear();
    const result = runP8Turn({}, {
      turnId: "composition-clarify",
      sessionId: "composition",
      userId: "U004",
      message: "Đưa tôi đến Galaxy."
    });

    expect(result.map_action.type).toBe("clarify");
    expect(p6.understandQuery).toHaveBeenCalledTimes(1);
    expect(p7.evaluateP7RankingWithCorpus).not.toHaveBeenCalled();
  });
});
