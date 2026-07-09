export interface P8UserPreference {
  readonly user_id: string;
  readonly persona: string;
  readonly current_location: string;
  readonly preferences: readonly string[];
  readonly avoid: readonly string[];
  readonly budget_level: string;
  readonly notes: string;
  readonly source_row: number;
  readonly provenance: string;
}

export const p8UserPreferences = [
  {
    "user_id": "U001",
    "persona": "Nhân viên văn phòng",
    "current_location": "Quận 1, TP.HCM",
    "preferences": [
      "cafe yên tĩnh",
      "wifi",
      "làm việc"
    ],
    "avoid": [
      "quán quá đông"
    ],
    "budget_level": "medium",
    "notes": "Hay tìm nơi làm việc buổi chiều.",
    "source_row": 2,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U002",
    "persona": "Gia đình có trẻ nhỏ",
    "current_location": "Hoàn Kiếm, Hà Nội",
    "preferences": [
      "nhà hàng gia đình",
      "khu vui chơi",
      "chỗ đậu xe"
    ],
    "avoid": [
      "quán bar",
      "ồn ào"
    ],
    "budget_level": "medium",
    "notes": "Ưu tiên nơi có không gian cho trẻ em.",
    "source_row": 3,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U003",
    "persona": "Du khách lần đầu đến Đà Nẵng",
    "current_location": "Sơn Trà, Đà Nẵng",
    "preferences": [
      "gần biển",
      "check-in",
      "đặc sản địa phương"
    ],
    "avoid": [
      "quá xa trung tâm"
    ],
    "budget_level": "medium",
    "notes": "Muốn lịch trình dễ đi trong 1 ngày.",
    "source_row": 4,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U004",
    "persona": "Người đi công tác",
    "current_location": "Ba Đình, Hà Nội",
    "preferences": [
      "khách sạn business",
      "gần trung tâm",
      "wifi tốt"
    ],
    "avoid": [
      "địa điểm quá du lịch"
    ],
    "budget_level": "high",
    "notes": "Cần gợi ý nhanh, rõ ràng.",
    "source_row": 5,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U005",
    "persona": "Cặp đôi",
    "current_location": "Quận 1, TP.HCM",
    "preferences": [
      "hẹn hò",
      "rooftop",
      "nhà hàng lãng mạn"
    ],
    "avoid": [
      "quá đông trẻ em"
    ],
    "budget_level": "high",
    "notes": "Thường tìm nơi ăn tối cuối tuần.",
    "source_row": 6,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U006",
    "persona": "Người thích khám phá",
    "current_location": "Đà Lạt",
    "preferences": [
      "check-in",
      "quán độc đáo",
      "view đẹp"
    ],
    "avoid": [
      "chuỗi thương hiệu quen thuộc"
    ],
    "budget_level": "medium",
    "notes": "Thích địa điểm mới và có câu chuyện.",
    "source_row": 7,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U007",
    "persona": "Sinh viên",
    "current_location": "Đống Đa, Hà Nội",
    "preferences": [
      "giá rẻ",
      "wifi",
      "học nhóm"
    ],
    "avoid": [
      "cao cấp"
    ],
    "budget_level": "low",
    "notes": "Cần cafe học bài hoặc ăn uống giá hợp lý.",
    "source_row": 8,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  },
  {
    "user_id": "U008",
    "persona": "Tài xế đường dài",
    "current_location": "TP.HCM",
    "preferences": [
      "trạm xăng",
      "toilet",
      "ăn khuya",
      "24/7"
    ],
    "avoid": [
      "đường nhỏ khó đỗ"
    ],
    "budget_level": "low",
    "notes": "Ưu tiên tiện ích trên đường đi.",
    "source_row": 9,
    "provenance": "synthetic-p8-workbook:User_Preferences"
  }
] as const satisfies readonly P8UserPreference[];

export const p8UserPreferenceById: ReadonlyMap<string, P8UserPreference> = new Map(
  p8UserPreferences.map((profile) => [profile.user_id, profile])
);

export function getP8UserPreference(userId: string | undefined): P8UserPreference | undefined {
  return userId === undefined ? undefined : p8UserPreferenceById.get(userId);
}
