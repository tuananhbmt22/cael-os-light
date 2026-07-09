export const p7AttributeTaxonomy = [
  {
    "attribute": "yên tĩnh",
    "semantic_meaning": "Không gian ít ồn, phù hợp tập trung",
    "applicable_categories": [
      "Quán cà phê",
      "Khách sạn"
    ],
    "examples": [
      "quán cà phê yên tĩnh để làm việc"
    ],
    "source_row": 2
  },
  {
    "attribute": "wifi",
    "semantic_meaning": "Có Internet/Wi-Fi",
    "applicable_categories": [
      "Quán cà phê",
      "Khách sạn"
    ],
    "examples": [
      "cafe có wifi"
    ],
    "source_row": 3
  },
  {
    "attribute": "phù hợp làm việc",
    "semantic_meaning": "Có điều kiện làm việc/học tập",
    "applicable_categories": [
      "Quán cà phê",
      "Coworking"
    ],
    "examples": [
      "nơi làm việc ngoài văn phòng"
    ],
    "source_row": 4
  },
  {
    "attribute": "phù hợp gia đình",
    "semantic_meaning": "Phù hợp đi cùng gia đình",
    "applicable_categories": [
      "Nhà hàng",
      "Khách sạn",
      "Điểm tham quan"
    ],
    "examples": [
      "nhà hàng cho gia đình có trẻ nhỏ"
    ],
    "source_row": 5
  },
  {
    "attribute": "lãng mạn",
    "semantic_meaning": "Không gian phù hợp hẹn hò",
    "applicable_categories": [
      "Nhà hàng",
      "Rooftop",
      "Cafe"
    ],
    "examples": [
      "nơi phù hợp để hẹn hò"
    ],
    "source_row": 6
  },
  {
    "attribute": "mở khuya",
    "semantic_meaning": "Hoạt động sau 22h",
    "applicable_categories": [
      "Nhà hàng",
      "Cafe",
      "Pharmacy"
    ],
    "examples": [
      "quán ăn mở cửa khuya"
    ],
    "source_row": 7
  },
  {
    "attribute": "gần biển",
    "semantic_meaning": "Vị trí gần biển",
    "applicable_categories": [
      "Khách sạn",
      "Nhà hàng"
    ],
    "examples": [
      "khách sạn gần biển Đà Nẵng"
    ],
    "source_row": 8
  },
  {
    "attribute": "bãi đỗ xe",
    "semantic_meaning": "Có chỗ để xe",
    "applicable_categories": [
      "Cafe",
      "Nhà hàng",
      "Mall"
    ],
    "examples": [
      "quán cà phê có chỗ đậu xe"
    ],
    "source_row": 9
  },
  {
    "attribute": "check-in",
    "semantic_meaning": "Phù hợp chụp ảnh/du lịch",
    "applicable_categories": [
      "Cafe",
      "Điểm tham quan"
    ],
    "examples": [
      "địa điểm check-in đẹp"
    ],
    "source_row": 10
  },
  {
    "attribute": "24/7",
    "semantic_meaning": "Mở cửa cả ngày",
    "applicable_categories": [
      "ATM",
      "Trạm xăng",
      "Bệnh viện"
    ],
    "examples": [
      "cây xăng 24/7"
    ],
    "source_row": 11
  }
] as const;

export const p7RankingSignals = [
  {
    "signal": "relevance_score",
    "description": "Mức độ phù hợp ngữ nghĩa giữa truy vấn và POI",
    "example_usage": "Query \"làm việc yên tĩnh\" ưu tiên POI có wifi, yên tĩnh, ổ cắm",
    "source_row": 2
  },
  {
    "signal": "distance_score",
    "description": "Khoảng cách từ vị trí người dùng hoặc vị trí tham chiếu",
    "example_usage": "Ưu tiên POI gần Hồ Gươm nếu truy vấn có \"gần Hồ Gươm\"",
    "source_row": 3
  },
  {
    "signal": "rating_score",
    "description": "Điểm đánh giá người dùng",
    "example_usage": "POI rating 4.6 có lợi thế hơn 4.0 nếu độ liên quan tương đương",
    "source_row": 4
  },
  {
    "signal": "popularity_score",
    "description": "Mức phổ biến dựa trên lượt tìm kiếm/đánh giá/mức nhận diện",
    "example_usage": "POI thương hiệu nổi tiếng hoặc nhiều review được boost",
    "source_row": 5
  },
  {
    "signal": "review_signal",
    "description": "Tín hiệu khai thác từ review/tags",
    "example_usage": "Review nhắc \"yên tĩnh\", \"phù hợp trẻ em\"",
    "source_row": 6
  },
  {
    "signal": "freshness_score",
    "description": "Mức độ cập nhật dữ liệu",
    "example_usage": "POI có dữ liệu mới hơn có độ tin cậy tốt hơn",
    "source_row": 7
  },
  {
    "signal": "business_attributes",
    "description": "Thuộc tính như wifi, parking, mở khuya",
    "example_usage": "Ràng buộc từ truy vấn phải match thuộc tính POI",
    "source_row": 8
  }
] as const;
