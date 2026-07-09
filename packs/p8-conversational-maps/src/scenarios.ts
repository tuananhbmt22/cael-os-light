export interface P8ScenarioTurn {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface P8ConversationScenario {
  readonly scenario_id: string;
  readonly category: string;
  readonly conversation_history: readonly P8ScenarioTurn[];
  readonly latest_user_message: string;
  readonly expected_assistant_behavior: string;
  readonly required_map_action: string;
  readonly source_row: number;
  readonly provenance: string;
}

export const p8ConversationScenarios = [
  {
    "scenario_id": "S001",
    "category": "Conversational Search",
    "conversation_history": [
      {
        "role": "user",
        "content": "Tôi muốn tìm một quán cà phê yên tĩnh."
      },
      {
        "role": "assistant",
        "content": "Bạn muốn tìm khu vực nào?"
      },
      {
        "role": "user",
        "content": "Gần Hồ Hoàn Kiếm."
      }
    ],
    "latest_user_message": "Gần Hồ Hoàn Kiếm.",
    "expected_assistant_behavior": "Gợi ý quán cà phê yên tĩnh gần Hồ Hoàn Kiếm, nêu lý do như wifi, yên tĩnh, phù hợp làm việc.",
    "required_map_action": "search(category=cafe, location=Hồ Hoàn Kiếm, attributes=yên tĩnh;wifi;làm việc)",
    "source_row": 2,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S002",
    "category": "Clarification Dialog",
    "conversation_history": [
      {
        "role": "user",
        "content": "Đưa tôi đến Galaxy."
      }
    ],
    "latest_user_message": "Đưa tôi đến Galaxy.",
    "expected_assistant_behavior": "Không chọn ngay một kết quả. Cần hỏi làm rõ Galaxy Cinema, Galaxy Hotel hay địa điểm khác.",
    "required_map_action": "clarify(ambiguous_entity=Galaxy, candidates=Galaxy Cinema;Galaxy Hotel)",
    "source_row": 3,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S003",
    "category": "Recommendation Request",
    "conversation_history": [
      {
        "role": "user",
        "content": "Gợi ý nơi hẹn hò lần đầu ở Quận 1."
      }
    ],
    "latest_user_message": "Gợi ý nơi hẹn hò lần đầu ở Quận 1.",
    "expected_assistant_behavior": "Đề xuất nhà hàng/rooftop/cafe có không gian lãng mạn, giải thích lý do.",
    "required_map_action": "recommend(intent=date_place, location=Quận 1, attributes=lãng mạn;view đẹp)",
    "source_row": 4,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S004",
    "category": "Multi-turn Search",
    "conversation_history": [
      {
        "role": "user",
        "content": "Tìm nhà hàng."
      },
      {
        "role": "assistant",
        "content": "Bạn muốn loại nào?"
      },
      {
        "role": "user",
        "content": "món Ý, dưới 500k, gần trung tâm."
      }
    ],
    "latest_user_message": "món Ý, dưới 500k, gần trung tâm.",
    "expected_assistant_behavior": "Giữ ngữ cảnh nhà hàng, lọc món Ý, ngân sách, gần trung tâm.",
    "required_map_action": "search(category=restaurant, cuisine=Italian, budget<=500k, location=center)",
    "source_row": 5,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S005",
    "category": "Planning Assistance",
    "conversation_history": [
      {
        "role": "user",
        "content": "Tôi có 1 ngày ở Đà Nẵng, nên đi đâu?"
      }
    ],
    "latest_user_message": "Tôi có 1 ngày ở Đà Nẵng, nên đi đâu?",
    "expected_assistant_behavior": "Đề xuất lịch trình ngắn gồm bãi biển, món địa phương, điểm check-in, tối ưu theo vị trí.",
    "required_map_action": "plan(city=Đà Nẵng, duration=1 day)",
    "source_row": 6,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S006",
    "category": "Navigation Assistance",
    "conversation_history": [
      {
        "role": "user",
        "content": "Làm thế nào để đến Chợ Bến Thành từ Vincom Đồng Khởi?"
      }
    ],
    "latest_user_message": "Làm thế nào để đến Chợ Bến Thành từ Vincom Đồng Khởi?",
    "expected_assistant_behavior": "Sinh hành động chỉ đường từ điểm xuất phát đến điểm đến, có thể hỏi phương tiện nếu thiếu.",
    "required_map_action": "route(origin=Vincom Center Đồng Khởi, destination=Chợ Bến Thành)",
    "source_row": 7,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S007",
    "category": "Personalized Search",
    "conversation_history": [
      {
        "role": "user",
        "content": "Sinh viên, ngân sách thấp."
      },
      {
        "role": "user",
        "content": "Có quán nào để học nhóm gần đây không?"
      }
    ],
    "latest_user_message": "Có quán nào để học nhóm gần đây không?",
    "expected_assistant_behavior": "Gợi ý cafe giá hợp lý, wifi, có bàn nhóm, không gợi ý nơi cao cấp.",
    "required_map_action": "recommend(category=cafe, attributes=wifi;học nhóm;giá hợp lý)",
    "source_row": 8,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  },
  {
    "scenario_id": "S008",
    "category": "Voice-like Query",
    "conversation_history": [
      {
        "role": "user",
        "content": "kiếm giúp quán ăn khuya gần sân bay tân sơn nhất với"
      }
    ],
    "latest_user_message": "kiếm giúp quán ăn khuya gần sân bay tân sơn nhất với",
    "expected_assistant_behavior": "Hiểu dạng nói tự nhiên, tìm nhà hàng mở khuya gần sân bay TSN.",
    "required_map_action": "search(category=restaurant, location=Sân bay Tân Sơn Nhất, attributes=mở cửa khuya)",
    "source_row": 9,
    "provenance": "synthetic-p8-workbook:Conversation_Scenarios"
  }
] as const satisfies readonly P8ConversationScenario[];
