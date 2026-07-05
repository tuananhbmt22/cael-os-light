import { describe, expect, it } from "vitest";
import { accentFold, canonicalizeDept, normalize } from "../src/index.js";
import { readFixture } from "./helpers.js";

describe("S5 normalize seam", () => {
  it("accent-fold strips Vietnamese diacritics deterministically", () => {
    const fixture = readFixture<NormalizeFixture>("../fixtures/phase0/s5/normalize-demo/input.json");
    const expected = readFixture<NormalizeExpected>("../fixtures/phase0/s5/normalize-demo/expected.json");

    expect(accentFold(fixture.accentText)).toBe(expected.accentFolded);
  });

  it("expands recipe-supplied abbreviations and records steps", () => {
    const fixture = readFixture<NormalizeFixture>("../fixtures/phase0/s5/normalize-demo/input.json");
    const result = normalize(fixture.abbrevText, {
      steps: ["abbrev-dict"],
      abbreviations: { "P ĐK": "Phòng Đăng ký" }
    });

    expect(result.normalized).toBe("Phòng Đăng ký xe");
    expect(result.steps).toEqual(["abbrev-dict"]);
  });

  it("splits a simple address into deterministic parts", () => {
    const fixture = readFixture<NormalizeFixture>("../fixtures/phase0/s5/normalize-demo/input.json");
    const expected = readFixture<NormalizeExpected>("../fixtures/phase0/s5/normalize-demo/expected.json");
    const result = normalize(fixture.addressText, {
      steps: ["accent-fold", "abbrev-dict", "address-parse"],
      abbreviations: { P: "Phường", TP: "Thành phố" }
    });

    expect(result.normalized).toBe(expected.addressNormalized);
    expect(result.steps).toEqual(expected.addressSteps);
    expect(result.addressParts).toMatchObject({
      street: "12 Le Loi",
      ward: "Phuong Tan Loi",
      district: "Thanh pho Buon Ma Thuot"
    });
  });

  it("canonicalizes department synonyms and Vietnamese variants to one shared canonical", () => {
    const fixture = readFixture<NormalizeFixture>("../fixtures/phase0/s5/normalize-demo/input.json");
    const expected = readFixture<NormalizeExpected>("../fixtures/phase0/s5/normalize-demo/expected.json");

    expect(canonicalizeDept(fixture.deptName, fixture.deptDict)).toBe(expected.canonicalDept);
    expect(canonicalizeDept("Phòng Đăng ký", fixture.deptDict)).toBe(expected.canonicalDept);
    expect(canonicalizeDept("P ĐK", fixture.deptDict)).toBe(expected.canonicalDept);
  });
});

interface NormalizeFixture {
  accentText: string;
  abbrevText: string;
  addressText: string;
  deptName: string;
  deptDict: Record<string, string>;
}

interface NormalizeExpected {
  accentFolded: string;
  abbrevExpanded: string;
  addressNormalized: string;
  canonicalDept: string;
  addressSteps: string[];
}
