import { describe, expect, it } from "vitest";
import { parseVietnameseAddress, normalizeQueryText, abbreviationEntries, restoreVietnamese } from "../src/normalize-recipe.js";

describe("T2 deterministic VN query normalization", () => {
  it("ships a VN maps abbreviation dictionary large enough for the rubric", () => {
    expect(abbreviationEntries.length).toBeGreaterThanOrEqual(70);
  });

  it("restores missing accents and map typos deterministically", () => {
    expect(normalizeQueryText("quan cafe gan day").normalized_query).toBe("quán cafe gần đây");
    expect(normalizeQueryText("benh vien da khoa").normalized_query).toBe("bệnh viện đa khoa");
    expect(restoreVietnamese("nha hang quan 3")).toBe("nhà hàng quận 3");
  });

  it("expands abbreviations used by the synthetic map cases", () => {
    expect(normalizeQueryText("atm gan bv cho ray").normalized_query).toBe("atm gần bệnh viện chợ rẫy");
    expect(normalizeQueryText("tttm q1").normalized_query).toBe("trung tâm thương mại quận 1");
  });

  it("parses incomplete Vietnamese addresses into typed parts", () => {
    expect(parseVietnameseAddress("123 nguyễn huệ, phường bến nghé")).toMatchObject({
      street: "123 nguyễn huệ",
      ward: "phường bến nghé"
    });
    expect(parseVietnameseAddress("lê lợi, hải châu")).toMatchObject({
      street: "lê lợi",
      district: "hải châu"
    });
  });
});

