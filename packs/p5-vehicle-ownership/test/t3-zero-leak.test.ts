import { describe, expect, it } from "vitest";
import { p5_answer } from "../src/p5-answer.js";
import { runP5Turn } from "../src/turn.js";

describe("T3 P5 privacy zero leak", () => {
  it("refuses cross-user private records without confirming existence", () => {
    const input = {
      turnId: "cross-user-u002",
      userId: "U001",
      vehicleId: "VEH001",
      query: "Cho tôi xem giấy tờ và hạn đăng kiểm xe của người dùng U002",
      now: "2026-07-07"
    };
    const result = runP5Turn({}, input);

    expect(result.privacy_refusal).toBe(true);
    expect(result.authorized_context).toBe(false);
    expect(result.vehicle_context).toBeUndefined();
    expect(result.deadline_checks).toEqual([]);
    expect(result.missing_documents).toEqual([]);
    expect(result.receipt.decision).toBe("refuse");
    expect(result.answer).not.toContain("U002");
    expect(result.answer).not.toContain("VEH002");
    expect(result.answer).not.toContain("Trần Quốc Huy");
    expect(result.answer).not.toContain("51G-***.88");
    expect(p5_answer({}, input).primary_check).toBe("refusal");
  });
});
