import { describe, expect, it } from "vitest";
import { runP5Turn } from "../src/turn.js";

const NOW = "2026-07-07";

describe("T2 P5 deterministic rules", () => {
  it("uses pinned-now deadline math and handles motorbike inspection N/A", () => {
    const veh001 = runP5Turn({}, { turnId: "veh001", userId: "U001", vehicleId: "VEH001", query: "Khi nào xe của tôi cần đăng kiểm?", now: NOW });
    expect(veh001.deadline_checks.find((check) => check.kind === "inspection")).toMatchObject({
      expiry_date: "2026-07-20",
      days_remaining: 13,
      urgency: "due_soon"
    });

    const veh012 = runP5Turn({}, { turnId: "veh012", userId: "U012", vehicleId: "VEH012", query: "Bảo hiểm TNDS của tôi sắp hết hạn chưa?", now: NOW });
    expect(veh012.deadline_checks.find((check) => check.kind === "civil_liability")).toMatchObject({
      expiry_date: "2026-07-18",
      days_remaining: 11,
      urgency: "due_soon"
    });

    const veh020 = runP5Turn({}, { turnId: "veh020", userId: "U020", vehicleId: "VEH020", query: "Đăng kiểm và bảo hiểm của tôi đều sắp hết hạn.", now: NOW });
    expect(veh020.deadline_checks.find((check) => check.kind === "inspection")?.days_remaining).toBe(18);
    expect(veh020.deadline_checks.find((check) => check.kind === "civil_liability")?.days_remaining).toBe(21);

    const veh014 = runP5Turn({}, { turnId: "veh014", userId: "U014", vehicleId: "VEH014", query: "Xe máy có cần quản lý giống ô tô không?", now: NOW });
    expect(veh014.deadline_checks.some((check) => check.kind === "inspection")).toBe(false);
  });

  it("surfaces missing upload metadata with document ids and verbatim notes", () => {
    const veh003 = runP5Turn({}, { turnId: "veh003", userId: "U003", vehicleId: "VEH003", query: "Tôi còn thiếu giấy tờ nào trong hồ sơ xe?", now: NOW });
    expect(veh003.missing_documents).toEqual([
      { document_id: "DOC004", document_type: "Inspection", reason: "Chưa upload bản scan" }
    ]);

    const veh006 = runP5Turn({}, { turnId: "veh006", userId: "U006", vehicleId: "VEH006", query: "Tôi chưa tải lên bảo hiểm xe.", now: NOW });
    expect(veh006.missing_documents).toEqual([
      { document_id: "DOC007", document_type: "Insurance", reason: "Thiếu bản upload" }
    ]);
  });

  it("recommends services from deterministic eligibility rules", () => {
    const roadside = runP5Turn({}, { turnId: "roadside", userId: "U006", vehicleId: "VEH006", query: "Xe của tôi đã sử dụng 9 năm. Có nên kích hoạt Cứu hộ giao thông không?", now: NOW });
    expect(roadside.recommended_service_ids).toContain("SVC002");

    const ev = runP5Turn({}, { turnId: "ev", userId: "U010", vehicleId: "VEH010", query: "Tôi sử dụng VinFast VF8. Trợ lý nên hỗ trợ thêm những gì?", now: NOW });
    expect(ev.recommended_service_ids).toContain("SVC005");

    const missingUpload = runP5Turn({}, { turnId: "wallet", userId: "U003", vehicleId: "VEH003", query: "Tôi còn thiếu giấy tờ nào trong hồ sơ xe?", now: NOW });
    expect(missingUpload.recommended_service_ids).toContain("SVC004");
  });
});
