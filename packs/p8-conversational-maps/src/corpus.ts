import type { P7Poi } from "../../p7-semantic-ranking/src/rank.js";

export interface P8Poi {
  readonly poi_id: string;
  readonly poi_name: string;
  readonly category: string;
  readonly brand: string;
  readonly city: string;
  readonly district: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly rating: number;
  readonly review_count: number;
  readonly popularity_score: number;
  readonly attributes: readonly string[];
  readonly tags: readonly string[];
  readonly description: string;
  readonly source_row: number;
  readonly provenance: string;
}

export const p8PoiCorpus = [
  {
    "poi_id": "POI001",
    "poi_name": "The Workshop Coffee",
    "category": "Quán cà phê",
    "brand": "The Workshop",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "27 Ngô Đức Kế, Bến Nghé, Quận 1",
    "latitude": 10.7734,
    "longitude": 106.7041,
    "rating": 4.6,
    "review_count": 1850,
    "popularity_score": 92.0,
    "attributes": [
      "wifi",
      "yên tĩnh",
      "làm việc",
      "ổ cắm",
      "máy lạnh"
    ],
    "tags": [
      "cafe làm việc",
      "coffee",
      "quiet",
      "work-friendly"
    ],
    "description": "Quán cà phê chuyên specialty coffee, phù hợp làm việc và gặp đối tác.",
    "source_row": 2,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI002",
    "poi_name": "Highlands Coffee Nguyễn Huệ",
    "category": "Quán cà phê",
    "brand": "Highlands Coffee",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "68 Nguyễn Huệ, Bến Nghé, Quận 1",
    "latitude": 10.7742,
    "longitude": 106.7039,
    "rating": 4.2,
    "review_count": 2100,
    "popularity_score": 88.0,
    "attributes": [
      "wifi",
      "đông khách",
      "mở cửa sớm",
      "takeaway"
    ],
    "tags": [
      "cafe",
      "brand",
      "nguyễn huệ"
    ],
    "description": "Chi nhánh Highlands Coffee nằm trên phố đi bộ Nguyễn Huệ, thuận tiện gặp bạn bè.",
    "source_row": 3,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI003",
    "poi_name": "Chợ Bến Thành",
    "category": "Chợ",
    "brand": "Không",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "Đường Lê Lợi, Phường Bến Thành, Quận 1",
    "latitude": 10.7721,
    "longitude": 106.6983,
    "rating": 4.3,
    "review_count": 12000,
    "popularity_score": 98.0,
    "attributes": [
      "du lịch",
      "mua sắm",
      "ẩm thực",
      "biểu tượng thành phố"
    ],
    "tags": [
      "market",
      "ben thanh",
      "du lịch"
    ],
    "description": "Địa điểm biểu tượng tại trung tâm TP.HCM, phù hợp tham quan và mua quà.",
    "source_row": 4,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI004",
    "poi_name": "Pizza 4P's Hai Bà Trưng",
    "category": "Nhà hàng",
    "brand": "Pizza 4P's",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "8/15 Lê Thánh Tôn, Quận 1",
    "latitude": 10.7801,
    "longitude": 106.7049,
    "rating": 4.7,
    "review_count": 5400,
    "popularity_score": 94.0,
    "attributes": [
      "phù hợp hẹn hò",
      "gia đình",
      "đặt bàn",
      "đồ Ý"
    ],
    "tags": [
      "pizza",
      "italian",
      "date",
      "family"
    ],
    "description": "Nhà hàng Ý nổi tiếng với pizza phô mai tự làm, phù hợp hẹn hò và gia đình.",
    "source_row": 5,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI005",
    "poi_name": "Rooftop Chill Skybar",
    "category": "Bar/Rooftop",
    "brand": "Chill Skybar",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "AB Tower, 76A Lê Lai, Quận 1",
    "latitude": 10.7708,
    "longitude": 106.6935,
    "rating": 4.4,
    "review_count": 3900,
    "popularity_score": 90.0,
    "attributes": [
      "view đẹp",
      "hẹn hò",
      "nightlife",
      "cao cấp"
    ],
    "tags": [
      "rooftop",
      "date",
      "view đẹp"
    ],
    "description": "Rooftop bar trung tâm thành phố, phù hợp hẹn hò và ngắm cảnh đêm.",
    "source_row": 6,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI006",
    "poi_name": "Bệnh viện Bạch Mai",
    "category": "Bệnh viện",
    "brand": "Không",
    "city": "Hà Nội",
    "district": "Đống Đa",
    "address": "78 Giải Phóng, Phương Mai, Đống Đa",
    "latitude": 21.0025,
    "longitude": 105.8404,
    "rating": 4.0,
    "review_count": 3400,
    "popularity_score": 91.0,
    "attributes": [
      "cấp cứu",
      "đa khoa",
      "24/7",
      "bãi đỗ xe"
    ],
    "tags": [
      "hospital",
      "bach mai",
      "cấp cứu"
    ],
    "description": "Bệnh viện đa khoa tuyến cuối, có nhiều chuyên khoa và dịch vụ cấp cứu.",
    "source_row": 7,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI007",
    "poi_name": "Vincom Center Đồng Khởi",
    "category": "Trung tâm thương mại",
    "brand": "Vincom",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "72 Lê Thánh Tôn, Bến Nghé, Quận 1",
    "latitude": 10.7781,
    "longitude": 106.7017,
    "rating": 4.5,
    "review_count": 8200,
    "popularity_score": 96.0,
    "attributes": [
      "mua sắm",
      "ăn uống",
      "rạp phim",
      "bãi đỗ xe"
    ],
    "tags": [
      "mall",
      "vincom",
      "shopping"
    ],
    "description": "Trung tâm thương mại lớn tại trung tâm TP.HCM, có cửa hàng, nhà hàng và giải trí.",
    "source_row": 8,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI008",
    "poi_name": "Galaxy Nguyễn Du",
    "category": "Rạp chiếu phim",
    "brand": "Galaxy Cinema",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "116 Nguyễn Du, Bến Thành, Quận 1",
    "latitude": 10.7749,
    "longitude": 106.6917,
    "rating": 4.1,
    "review_count": 3100,
    "popularity_score": 82.0,
    "attributes": [
      "rạp phim",
      "giải trí",
      "đặt vé"
    ],
    "tags": [
      "cinema",
      "galaxy"
    ],
    "description": "Rạp chiếu phim phổ biến tại trung tâm TP.HCM.",
    "source_row": 9,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI009",
    "poi_name": "Galaxy Hotel Đà Nẵng",
    "category": "Khách sạn",
    "brand": "Galaxy Hotel",
    "city": "Đà Nẵng",
    "district": "Sơn Trà",
    "address": "102 Võ Nguyên Giáp, Sơn Trà",
    "latitude": 16.0678,
    "longitude": 108.2441,
    "rating": 4.0,
    "review_count": 780,
    "popularity_score": 70.0,
    "attributes": [
      "gần biển",
      "gia đình",
      "bữa sáng"
    ],
    "tags": [
      "hotel",
      "near beach",
      "galaxy"
    ],
    "description": "Khách sạn gần biển Mỹ Khê, phù hợp du lịch gia đình.",
    "source_row": 10,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI010",
    "poi_name": "Cộng Cà Phê Hồ Gươm",
    "category": "Quán cà phê",
    "brand": "Cộng Cà Phê",
    "city": "Hà Nội",
    "district": "Hoàn Kiếm",
    "address": "116 Cầu Gỗ, Hoàn Kiếm",
    "latitude": 21.0321,
    "longitude": 105.8528,
    "rating": 4.3,
    "review_count": 2900,
    "popularity_score": 86.0,
    "attributes": [
      "view hồ",
      "du lịch",
      "wifi",
      "đông khách"
    ],
    "tags": [
      "cafe",
      "hồ gươm",
      "view"
    ],
    "description": "Quán cà phê phong cách hoài cổ gần Hồ Gươm.",
    "source_row": 11,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI011",
    "poi_name": "Maison de Tet Décor",
    "category": "Quán cà phê",
    "brand": "Maison de Tet",
    "city": "Hà Nội",
    "district": "Tây Hồ",
    "address": "156 Từ Hoa, Tây Hồ",
    "latitude": 21.0631,
    "longitude": 105.8272,
    "rating": 4.5,
    "review_count": 1600,
    "popularity_score": 84.0,
    "attributes": [
      "yên tĩnh",
      "ăn sáng",
      "healthy",
      "view hồ"
    ],
    "tags": [
      "cafe làm việc",
      "healthy",
      "hồ tây"
    ],
    "description": "Không gian yên tĩnh, phù hợp ăn sáng, làm việc và gặp bạn bè.",
    "source_row": 12,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI012",
    "poi_name": "Lotte Hotel Hanoi",
    "category": "Khách sạn",
    "brand": "Lotte",
    "city": "Hà Nội",
    "district": "Ba Đình",
    "address": "54 Liễu Giai, Ba Đình",
    "latitude": 21.0322,
    "longitude": 105.812,
    "rating": 4.7,
    "review_count": 4600,
    "popularity_score": 95.0,
    "attributes": [
      "5 sao",
      "hồ bơi",
      "business",
      "gia đình",
      "view đẹp"
    ],
    "tags": [
      "hotel",
      "luxury",
      "business"
    ],
    "description": "Khách sạn cao cấp phù hợp công tác, gia đình và du lịch.",
    "source_row": 13,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI013",
    "poi_name": "Khách sạn Sala Đà Nẵng Beach",
    "category": "Khách sạn",
    "brand": "Sala",
    "city": "Đà Nẵng",
    "district": "Sơn Trà",
    "address": "36-38 Lâm Hoành, Sơn Trà",
    "latitude": 16.0582,
    "longitude": 108.2473,
    "rating": 4.6,
    "review_count": 3100,
    "popularity_score": 90.0,
    "attributes": [
      "gần biển",
      "hồ bơi",
      "gia đình",
      "buffet sáng"
    ],
    "tags": [
      "hotel",
      "beach",
      "family"
    ],
    "description": "Khách sạn gần biển Mỹ Khê với hồ bơi và phòng gia đình.",
    "source_row": 14,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI014",
    "poi_name": "Mì Quảng Bà Mua",
    "category": "Nhà hàng",
    "brand": "Bà Mua",
    "city": "Đà Nẵng",
    "district": "Hải Châu",
    "address": "19 Trần Bình Trọng, Hải Châu",
    "latitude": 16.0689,
    "longitude": 108.2176,
    "rating": 4.2,
    "review_count": 2500,
    "popularity_score": 80.0,
    "attributes": [
      "đặc sản",
      "giá hợp lý",
      "gia đình"
    ],
    "tags": [
      "mi quang",
      "local food",
      "da nang"
    ],
    "description": "Quán đặc sản Mì Quảng nổi tiếng tại Đà Nẵng.",
    "source_row": 15,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI015",
    "poi_name": "Công viên Thỏ Trắng",
    "category": "Khu vui chơi",
    "brand": "Thỏ Trắng",
    "city": "TP.HCM",
    "district": "Quận 10",
    "address": "875 Cách Mạng Tháng Tám, Quận 10",
    "latitude": 10.779,
    "longitude": 106.6675,
    "rating": 4.1,
    "review_count": 1800,
    "popularity_score": 79.0,
    "attributes": [
      "trẻ em",
      "gia đình",
      "cuối tuần"
    ],
    "tags": [
      "kids",
      "family",
      "playground"
    ],
    "description": "Khu vui chơi ngoài trời phù hợp cho gia đình có trẻ nhỏ.",
    "source_row": 16,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI016",
    "poi_name": "CGV Vincom Bà Triệu",
    "category": "Rạp chiếu phim",
    "brand": "CGV",
    "city": "Hà Nội",
    "district": "Hai Bà Trưng",
    "address": "191 Bà Triệu, Hai Bà Trưng",
    "latitude": 21.0119,
    "longitude": 105.8495,
    "rating": 4.4,
    "review_count": 5200,
    "popularity_score": 89.0,
    "attributes": [
      "rạp phim",
      "mua sắm",
      "ăn uống",
      "bãi đỗ xe"
    ],
    "tags": [
      "cinema",
      "cgv",
      "vincom"
    ],
    "description": "Rạp CGV trong trung tâm thương mại Vincom Bà Triệu.",
    "source_row": 17,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI017",
    "poi_name": "Trung Nguyên Legend Café Lý Tự Trọng",
    "category": "Quán cà phê",
    "brand": "Trung Nguyên",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "80 Lý Tự Trọng, Quận 1",
    "latitude": 10.7761,
    "longitude": 106.6999,
    "rating": 4.3,
    "review_count": 1400,
    "popularity_score": 78.0,
    "attributes": [
      "wifi",
      "gặp đối tác",
      "yên tĩnh",
      "coffee"
    ],
    "tags": [
      "cafe",
      "work",
      "meeting"
    ],
    "description": "Quán cà phê phù hợp gặp đối tác và làm việc ngắn.",
    "source_row": 18,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI018",
    "poi_name": "Phở Thìn Lò Đúc",
    "category": "Nhà hàng",
    "brand": "Phở Thìn",
    "city": "Hà Nội",
    "district": "Hai Bà Trưng",
    "address": "13 Lò Đúc, Hai Bà Trưng",
    "latitude": 21.0188,
    "longitude": 105.8589,
    "rating": 4.4,
    "review_count": 6700,
    "popularity_score": 93.0,
    "attributes": [
      "phở",
      "nổi tiếng",
      "đông khách",
      "giá vừa"
    ],
    "tags": [
      "pho",
      "local",
      "hanoi"
    ],
    "description": "Quán phở bò nổi tiếng tại Hà Nội.",
    "source_row": 19,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI019",
    "poi_name": "Bún Chả Hương Liên",
    "category": "Nhà hàng",
    "brand": "Hương Liên",
    "city": "Hà Nội",
    "district": "Hai Bà Trưng",
    "address": "24 Lê Văn Hưu, Hai Bà Trưng",
    "latitude": 21.0184,
    "longitude": 105.8533,
    "rating": 4.3,
    "review_count": 7200,
    "popularity_score": 92.0,
    "attributes": [
      "đặc sản",
      "bún chả",
      "du lịch",
      "gia đình"
    ],
    "tags": [
      "bun cha",
      "local food"
    ],
    "description": "Quán bún chả nổi tiếng với khách du lịch và người địa phương.",
    "source_row": 20,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI020",
    "poi_name": "AEON Mall Tân Phú",
    "category": "Trung tâm thương mại",
    "brand": "AEON Mall",
    "city": "TP.HCM",
    "district": "Tân Phú",
    "address": "30 Bờ Bao Tân Thắng, Tân Phú",
    "latitude": 10.801,
    "longitude": 106.6188,
    "rating": 4.5,
    "review_count": 11500,
    "popularity_score": 94.0,
    "attributes": [
      "mua sắm",
      "gia đình",
      "trẻ em",
      "bãi đỗ xe"
    ],
    "tags": [
      "mall",
      "family",
      "shopping"
    ],
    "description": "Trung tâm thương mại lớn, phù hợp mua sắm cuối tuần cùng gia đình.",
    "source_row": 21,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI021",
    "poi_name": "Nhà hàng Secret Garden",
    "category": "Nhà hàng",
    "brand": "Secret Garden",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "158 Pasteur, Bến Nghé, Quận 1",
    "latitude": 10.7767,
    "longitude": 106.7007,
    "rating": 4.4,
    "review_count": 3300,
    "popularity_score": 84.0,
    "attributes": [
      "hẹn hò",
      "ẩm thực Việt",
      "view đẹp",
      "gia đình"
    ],
    "tags": [
      "romantic",
      "vietnamese",
      "date"
    ],
    "description": "Nhà hàng món Việt phong cách sân vườn, phù hợp hẹn hò và tiếp khách.",
    "source_row": 22,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI022",
    "poi_name": "Đường sách Nguyễn Văn Bình",
    "category": "Địa điểm văn hóa",
    "brand": "Không",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "Nguyễn Văn Bình, Bến Nghé, Quận 1",
    "latitude": 10.7798,
    "longitude": 106.6999,
    "rating": 4.6,
    "review_count": 5200,
    "popularity_score": 88.0,
    "attributes": [
      "sách",
      "check-in",
      "yên tĩnh",
      "du lịch"
    ],
    "tags": [
      "book street",
      "check-in"
    ],
    "description": "Không gian văn hóa, đọc sách và check-in gần Nhà thờ Đức Bà.",
    "source_row": 23,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI023",
    "poi_name": "Nhà thờ Đức Bà Sài Gòn",
    "category": "Địa điểm du lịch",
    "brand": "Không",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "Công xã Paris, Bến Nghé, Quận 1",
    "latitude": 10.7798,
    "longitude": 106.699,
    "rating": 4.5,
    "review_count": 9800,
    "popularity_score": 95.0,
    "attributes": [
      "du lịch",
      "check-in",
      "biểu tượng"
    ],
    "tags": [
      "landmark",
      "check-in"
    ],
    "description": "Công trình kiến trúc nổi tiếng tại trung tâm TP.HCM.",
    "source_row": 24,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI024",
    "poi_name": "Cây xăng Petrolimex Võ Văn Kiệt",
    "category": "Trạm xăng",
    "brand": "Petrolimex",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "592 Võ Văn Kiệt, Quận 1",
    "latitude": 10.7565,
    "longitude": 106.6882,
    "rating": 4.0,
    "review_count": 600,
    "popularity_score": 72.0,
    "attributes": [
      "xăng dầu",
      "toilet",
      "24/7"
    ],
    "tags": [
      "gas station",
      "petrolimex"
    ],
    "description": "Trạm xăng trên tuyến Võ Văn Kiệt, có dịch vụ cơ bản.",
    "source_row": 25,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI025",
    "poi_name": "ATM Vietcombank Bến Thành",
    "category": "ATM",
    "brand": "Vietcombank",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "45 Lê Lợi, Bến Thành, Quận 1",
    "latitude": 10.7729,
    "longitude": 106.6971,
    "rating": 4.0,
    "review_count": 320,
    "popularity_score": 70.0,
    "attributes": [
      "atm",
      "24/7",
      "gần chợ"
    ],
    "tags": [
      "atm",
      "vcb"
    ],
    "description": "ATM Vietcombank gần Chợ Bến Thành.",
    "source_row": 26,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI026",
    "poi_name": "Sân bay Tân Sơn Nhất",
    "category": "Sân bay",
    "brand": "Không",
    "city": "TP.HCM",
    "district": "Tân Bình",
    "address": "Trường Sơn, Phường 2, Tân Bình",
    "latitude": 10.8188,
    "longitude": 106.6519,
    "rating": 4.1,
    "review_count": 14000,
    "popularity_score": 99.0,
    "attributes": [
      "sân bay",
      "giao thông",
      "24/7"
    ],
    "tags": [
      "airport",
      "tsn"
    ],
    "description": "Sân bay lớn tại TP.HCM.",
    "source_row": 27,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI027",
    "poi_name": "Sân bay Nội Bài",
    "category": "Sân bay",
    "brand": "Không",
    "city": "Hà Nội",
    "district": "Sóc Sơn",
    "address": "Phú Minh, Sóc Sơn",
    "latitude": 21.2187,
    "longitude": 105.8042,
    "rating": 4.2,
    "review_count": 11000,
    "popularity_score": 98.0,
    "attributes": [
      "sân bay",
      "giao thông",
      "24/7"
    ],
    "tags": [
      "airport",
      "noi bai"
    ],
    "description": "Sân bay quốc tế phục vụ Hà Nội và miền Bắc.",
    "source_row": 28,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI028",
    "poi_name": "Công viên 29/3 Đà Nẵng",
    "category": "Công viên",
    "brand": "Không",
    "city": "Đà Nẵng",
    "district": "Thanh Khê",
    "address": "Điện Biên Phủ, Thanh Khê",
    "latitude": 16.0672,
    "longitude": 108.2058,
    "rating": 4.2,
    "review_count": 1700,
    "popularity_score": 75.0,
    "attributes": [
      "trẻ em",
      "gia đình",
      "đi bộ",
      "ngoài trời"
    ],
    "tags": [
      "park",
      "kids",
      "family"
    ],
    "description": "Công viên lớn phù hợp đi dạo và cho trẻ em vui chơi.",
    "source_row": 29,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI029",
    "poi_name": "Anantara Hội An Resort",
    "category": "Khách sạn/Resort",
    "brand": "Anantara",
    "city": "Quảng Nam",
    "district": "Hội An",
    "address": "1 Phạm Hồng Thái, Hội An",
    "latitude": 15.8791,
    "longitude": 108.3348,
    "rating": 4.6,
    "review_count": 1700,
    "popularity_score": 87.0,
    "attributes": [
      "resort",
      "gia đình",
      "cao cấp",
      "gần phố cổ"
    ],
    "tags": [
      "resort",
      "hoi an",
      "family"
    ],
    "description": "Resort cao cấp gần phố cổ Hội An, phù hợp nghỉ dưỡng.",
    "source_row": 30,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI030",
    "poi_name": "Hồ Hoàn Kiếm",
    "category": "Địa điểm du lịch",
    "brand": "Không",
    "city": "Hà Nội",
    "district": "Hoàn Kiếm",
    "address": "Trung tâm Hoàn Kiếm",
    "latitude": 21.0287,
    "longitude": 105.852,
    "rating": 4.7,
    "review_count": 20000,
    "popularity_score": 99.0,
    "attributes": [
      "du lịch",
      "check-in",
      "đi bộ",
      "view đẹp"
    ],
    "tags": [
      "lake",
      "ho guom",
      "landmark"
    ],
    "description": "Địa điểm biểu tượng của Hà Nội, phù hợp đi bộ và tham quan.",
    "source_row": 31,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI031",
    "poi_name": "Cafe Mộc Đà Lạt 31",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Đà Lạt",
    "district": "Đống Đa",
    "address": "31 Đường Trung Tâm, Đà Lạt",
    "latitude": 11.77467,
    "longitude": 108.65851,
    "rating": 4.1,
    "review_count": 2552,
    "popularity_score": 60.0,
    "attributes": [
      "đặt bàn",
      "wifi",
      "check-in",
      "cao cấp"
    ],
    "tags": [
      "đặt bàn",
      "wifi",
      "check-in"
    ],
    "description": "Quán cà phê tại Đà Lạt, phù hợp cho đặt bàn, wifi.",
    "source_row": 32,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI032",
    "poi_name": "Khu vui chơi KidZone Hội An 32",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Hội An",
    "district": "Quận 7",
    "address": "32 Đường Trung Tâm, Hội An",
    "latitude": 14.254498,
    "longitude": 105.522142,
    "rating": 4.6,
    "review_count": 1821,
    "popularity_score": 77.0,
    "attributes": [
      "bãi đỗ xe",
      "view đẹp",
      "mở cửa khuya",
      "wifi"
    ],
    "tags": [
      "bãi đỗ xe",
      "view đẹp",
      "mở cửa khuya"
    ],
    "description": "Khu vui chơi tại Hội An, phù hợp cho bãi đỗ xe, view đẹp.",
    "source_row": 33,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI033",
    "poi_name": "Trung tâm thương mại City Plaza Đà Nẵng 33",
    "category": "Trung tâm thương mại",
    "brand": "Trung",
    "city": "Đà Nẵng",
    "district": "Đống Đa",
    "address": "33 Đường Trung Tâm, Đà Nẵng",
    "latitude": 19.22033,
    "longitude": 108.04272,
    "rating": 4.1,
    "review_count": 662,
    "popularity_score": 91.0,
    "attributes": [
      "yên tĩnh",
      "check-in",
      "wifi",
      "ngoài trời"
    ],
    "tags": [
      "yên tĩnh",
      "check-in",
      "wifi"
    ],
    "description": "Trung tâm thương mại tại Đà Nẵng, phù hợp cho yên tĩnh, check-in.",
    "source_row": 34,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI034",
    "poi_name": "Khách sạn Sao Việt Hà Nội 34",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "Hà Nội",
    "district": "Hải Châu",
    "address": "34 Đường Trung Tâm, Hà Nội",
    "latitude": 17.182314,
    "longitude": 108.346686,
    "rating": 4.2,
    "review_count": 2677,
    "popularity_score": 79.0,
    "attributes": [
      "check-in",
      "ngoài trời",
      "gia đình",
      "giá hợp lý"
    ],
    "tags": [
      "check-in",
      "ngoài trời",
      "gia đình"
    ],
    "description": "Khách sạn tại Hà Nội, phù hợp cho check-in, ngoài trời.",
    "source_row": 35,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI035",
    "poi_name": "Điểm check-in Panorama TP.HCM 35",
    "category": "Địa điểm du lịch",
    "brand": "Điểm",
    "city": "TP.HCM",
    "district": "Hải Châu",
    "address": "35 Đường Trung Tâm, TP.HCM",
    "latitude": 21.087507,
    "longitude": 106.83236,
    "rating": 4.3,
    "review_count": 1396,
    "popularity_score": 89.0,
    "attributes": [
      "cao cấp",
      "mở cửa khuya",
      "phù hợp hẹn hò",
      "ngoài trời"
    ],
    "tags": [
      "cao cấp",
      "mở cửa khuya",
      "phù hợp hẹn hò"
    ],
    "description": "Địa điểm du lịch tại TP.HCM, phù hợp cho cao cấp, mở cửa khuya.",
    "source_row": 36,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI036",
    "poi_name": "Cafe Mộc Hội An 36",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Hội An",
    "district": "Ba Đình",
    "address": "36 Đường Trung Tâm, Hội An",
    "latitude": 10.823977,
    "longitude": 108.01376,
    "rating": 4.0,
    "review_count": 2922,
    "popularity_score": 86.0,
    "attributes": [
      "yên tĩnh",
      "gia đình",
      "wifi",
      "giá hợp lý"
    ],
    "tags": [
      "yên tĩnh",
      "gia đình",
      "wifi"
    ],
    "description": "Quán cà phê tại Hội An, phù hợp cho yên tĩnh, gia đình.",
    "source_row": 37,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI037",
    "poi_name": "ATM BIDV Nha Trang 37",
    "category": "ATM",
    "brand": "ATM",
    "city": "Nha Trang",
    "district": "Hải Châu",
    "address": "37 Đường Trung Tâm, Nha Trang",
    "latitude": 15.497977,
    "longitude": 107.898319,
    "rating": 4.0,
    "review_count": 1353,
    "popularity_score": 79.0,
    "attributes": [
      "giá hợp lý",
      "mở cửa khuya",
      "yên tĩnh",
      "phù hợp hẹn hò"
    ],
    "tags": [
      "giá hợp lý",
      "mở cửa khuya",
      "yên tĩnh"
    ],
    "description": "ATM tại Nha Trang, phù hợp cho giá hợp lý, mở cửa khuya.",
    "source_row": 38,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI038",
    "poi_name": "Khu vui chơi KidZone Đà Nẵng 38",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Nẵng",
    "district": "Đống Đa",
    "address": "38 Đường Trung Tâm, Đà Nẵng",
    "latitude": 11.126672,
    "longitude": 106.025951,
    "rating": 4.0,
    "review_count": 1018,
    "popularity_score": 83.0,
    "attributes": [
      "gia đình",
      "wifi",
      "mở cửa khuya",
      "cao cấp"
    ],
    "tags": [
      "gia đình",
      "wifi",
      "mở cửa khuya"
    ],
    "description": "Khu vui chơi tại Đà Nẵng, phù hợp cho gia đình, wifi.",
    "source_row": 39,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI039",
    "poi_name": "Bệnh viện Minh Tâm Đà Nẵng 39",
    "category": "Bệnh viện",
    "brand": "Bệnh",
    "city": "Đà Nẵng",
    "district": "Quận 7",
    "address": "39 Đường Trung Tâm, Đà Nẵng",
    "latitude": 10.410934,
    "longitude": 107.675169,
    "rating": 4.6,
    "review_count": 1099,
    "popularity_score": 69.0,
    "attributes": [
      "check-in",
      "mở cửa khuya",
      "phù hợp hẹn hò",
      "đặt bàn"
    ],
    "tags": [
      "check-in",
      "mở cửa khuya",
      "phù hợp hẹn hò"
    ],
    "description": "Bệnh viện tại Đà Nẵng, phù hợp cho check-in, mở cửa khuya.",
    "source_row": 40,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI040",
    "poi_name": "Khách sạn Sao Việt Hà Nội 40",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "Hà Nội",
    "district": "Tây Hồ",
    "address": "40 Đường Trung Tâm, Hà Nội",
    "latitude": 13.419828,
    "longitude": 105.052471,
    "rating": 4.5,
    "review_count": 265,
    "popularity_score": 75.0,
    "attributes": [
      "đặt bàn",
      "cao cấp",
      "gia đình",
      "phù hợp hẹn hò"
    ],
    "tags": [
      "đặt bàn",
      "cao cấp",
      "gia đình"
    ],
    "description": "Khách sạn tại Hà Nội, phù hợp cho đặt bàn, cao cấp.",
    "source_row": 41,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI041",
    "poi_name": "Công viên Xanh Đà Nẵng 41",
    "category": "Công viên",
    "brand": "Công",
    "city": "Đà Nẵng",
    "district": "Quận 7",
    "address": "41 Đường Trung Tâm, Đà Nẵng",
    "latitude": 10.149241,
    "longitude": 107.048228,
    "rating": 4.0,
    "review_count": 193,
    "popularity_score": 93.0,
    "attributes": [
      "check-in",
      "gia đình",
      "bãi đỗ xe",
      "cao cấp"
    ],
    "tags": [
      "check-in",
      "gia đình",
      "bãi đỗ xe"
    ],
    "description": "Công viên tại Đà Nẵng, phù hợp cho check-in, gia đình.",
    "source_row": 42,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI042",
    "poi_name": "ATM BIDV Nha Trang 42",
    "category": "ATM",
    "brand": "ATM",
    "city": "Nha Trang",
    "district": "Ba Đình",
    "address": "42 Đường Trung Tâm, Nha Trang",
    "latitude": 17.406636,
    "longitude": 108.203826,
    "rating": 4.5,
    "review_count": 1432,
    "popularity_score": 90.0,
    "attributes": [
      "đặt bàn",
      "gần biển",
      "bãi đỗ xe",
      "ngoài trời"
    ],
    "tags": [
      "đặt bàn",
      "gần biển",
      "bãi đỗ xe"
    ],
    "description": "ATM tại Nha Trang, phù hợp cho đặt bàn, gần biển.",
    "source_row": 43,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI043",
    "poi_name": "Khu vui chơi KidZone Đà Lạt 43",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Lạt",
    "district": "Đống Đa",
    "address": "43 Đường Trung Tâm, Đà Lạt",
    "latitude": 18.026528,
    "longitude": 107.805402,
    "rating": 4.6,
    "review_count": 257,
    "popularity_score": 84.0,
    "attributes": [
      "ngoài trời",
      "mở cửa khuya",
      "gần biển",
      "gia đình"
    ],
    "tags": [
      "ngoài trời",
      "mở cửa khuya",
      "gần biển"
    ],
    "description": "Khu vui chơi tại Đà Lạt, phù hợp cho ngoài trời, mở cửa khuya.",
    "source_row": 44,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI044",
    "poi_name": "Điểm check-in Panorama Đà Nẵng 44",
    "category": "Địa điểm du lịch",
    "brand": "Điểm",
    "city": "Đà Nẵng",
    "district": "Quận 1",
    "address": "44 Đường Trung Tâm, Đà Nẵng",
    "latitude": 17.539114,
    "longitude": 105.550492,
    "rating": 4.3,
    "review_count": 2109,
    "popularity_score": 70.0,
    "attributes": [
      "ngoài trời",
      "view đẹp",
      "mở cửa khuya",
      "yên tĩnh"
    ],
    "tags": [
      "ngoài trời",
      "view đẹp",
      "mở cửa khuya"
    ],
    "description": "Địa điểm du lịch tại Đà Nẵng, phù hợp cho ngoài trời, view đẹp.",
    "source_row": 45,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI045",
    "poi_name": "Khách sạn Sao Việt Nha Trang 45",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "Nha Trang",
    "district": "Quận 7",
    "address": "45 Đường Trung Tâm, Nha Trang",
    "latitude": 21.292789,
    "longitude": 108.712561,
    "rating": 4.1,
    "review_count": 759,
    "popularity_score": 76.0,
    "attributes": [
      "check-in",
      "yên tĩnh",
      "view đẹp",
      "gia đình"
    ],
    "tags": [
      "check-in",
      "yên tĩnh",
      "view đẹp"
    ],
    "description": "Khách sạn tại Nha Trang, phù hợp cho check-in, yên tĩnh.",
    "source_row": 46,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI046",
    "poi_name": "Khu vui chơi KidZone Đà Nẵng 46",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Nẵng",
    "district": "Hải Châu",
    "address": "46 Đường Trung Tâm, Đà Nẵng",
    "latitude": 16.553201,
    "longitude": 106.438999,
    "rating": 3.8,
    "review_count": 1620,
    "popularity_score": 82.0,
    "attributes": [
      "đặt bàn",
      "gần biển",
      "yên tĩnh",
      "phù hợp hẹn hò"
    ],
    "tags": [
      "đặt bàn",
      "gần biển",
      "yên tĩnh"
    ],
    "description": "Khu vui chơi tại Đà Nẵng, phù hợp cho đặt bàn, gần biển.",
    "source_row": 47,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI047",
    "poi_name": "Khu vui chơi KidZone Đà Nẵng 47",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Nẵng",
    "district": "Đống Đa",
    "address": "47 Đường Trung Tâm, Đà Nẵng",
    "latitude": 15.955816,
    "longitude": 108.35357,
    "rating": 4.7,
    "review_count": 2554,
    "popularity_score": 92.0,
    "attributes": [
      "đặt bàn",
      "check-in",
      "bãi đỗ xe",
      "giá hợp lý"
    ],
    "tags": [
      "đặt bàn",
      "check-in",
      "bãi đỗ xe"
    ],
    "description": "Khu vui chơi tại Đà Nẵng, phù hợp cho đặt bàn, check-in.",
    "source_row": 48,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI048",
    "poi_name": "Bệnh viện Minh Tâm Đà Lạt 48",
    "category": "Bệnh viện",
    "brand": "Bệnh",
    "city": "Đà Lạt",
    "district": "Đống Đa",
    "address": "48 Đường Trung Tâm, Đà Lạt",
    "latitude": 21.968411,
    "longitude": 106.601454,
    "rating": 4.0,
    "review_count": 554,
    "popularity_score": 79.0,
    "attributes": [
      "view đẹp",
      "bãi đỗ xe",
      "đặt bàn",
      "yên tĩnh"
    ],
    "tags": [
      "view đẹp",
      "bãi đỗ xe",
      "đặt bàn"
    ],
    "description": "Bệnh viện tại Đà Lạt, phù hợp cho view đẹp, bãi đỗ xe.",
    "source_row": 49,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI049",
    "poi_name": "Khách sạn Sao Việt Đà Nẵng 49",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "Đà Nẵng",
    "district": "Sơn Trà",
    "address": "49 Đường Trung Tâm, Đà Nẵng",
    "latitude": 18.764326,
    "longitude": 105.208487,
    "rating": 4.2,
    "review_count": 1185,
    "popularity_score": 95.0,
    "attributes": [
      "cao cấp",
      "gia đình",
      "đặt bàn",
      "ngoài trời"
    ],
    "tags": [
      "cao cấp",
      "gia đình",
      "đặt bàn"
    ],
    "description": "Khách sạn tại Đà Nẵng, phù hợp cho cao cấp, gia đình.",
    "source_row": 50,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI050",
    "poi_name": "Bệnh viện Minh Tâm Đà Nẵng 50",
    "category": "Bệnh viện",
    "brand": "Bệnh",
    "city": "Đà Nẵng",
    "district": "Hải Châu",
    "address": "50 Đường Trung Tâm, Đà Nẵng",
    "latitude": 11.961205,
    "longitude": 108.916268,
    "rating": 4.2,
    "review_count": 2319,
    "popularity_score": 53.0,
    "attributes": [
      "cao cấp",
      "wifi",
      "yên tĩnh",
      "giá hợp lý"
    ],
    "tags": [
      "cao cấp",
      "wifi",
      "yên tĩnh"
    ],
    "description": "Bệnh viện tại Đà Nẵng, phù hợp cho cao cấp, wifi.",
    "source_row": 51,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI051",
    "poi_name": "Trung tâm thương mại City Plaza Đà Lạt 51",
    "category": "Trung tâm thương mại",
    "brand": "Trung",
    "city": "Đà Lạt",
    "district": "Hoàn Kiếm",
    "address": "51 Đường Trung Tâm, Đà Lạt",
    "latitude": 13.963496,
    "longitude": 107.729436,
    "rating": 4.5,
    "review_count": 805,
    "popularity_score": 57.0,
    "attributes": [
      "cao cấp",
      "giá hợp lý",
      "bãi đỗ xe",
      "check-in"
    ],
    "tags": [
      "cao cấp",
      "giá hợp lý",
      "bãi đỗ xe"
    ],
    "description": "Trung tâm thương mại tại Đà Lạt, phù hợp cho cao cấp, giá hợp lý.",
    "source_row": 52,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI052",
    "poi_name": "Cafe Mộc Đà Nẵng 52",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Đà Nẵng",
    "district": "Tây Hồ",
    "address": "52 Đường Trung Tâm, Đà Nẵng",
    "latitude": 19.942875,
    "longitude": 107.887697,
    "rating": 4.0,
    "review_count": 947,
    "popularity_score": 75.0,
    "attributes": [
      "check-in",
      "phù hợp hẹn hò",
      "view đẹp",
      "ngoài trời"
    ],
    "tags": [
      "check-in",
      "phù hợp hẹn hò",
      "view đẹp"
    ],
    "description": "Quán cà phê tại Đà Nẵng, phù hợp cho check-in, phù hợp hẹn hò.",
    "source_row": 53,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI053",
    "poi_name": "ATM BIDV Đà Nẵng 53",
    "category": "ATM",
    "brand": "ATM",
    "city": "Đà Nẵng",
    "district": "Hoàn Kiếm",
    "address": "53 Đường Trung Tâm, Đà Nẵng",
    "latitude": 18.532017,
    "longitude": 106.740695,
    "rating": 4.4,
    "review_count": 2706,
    "popularity_score": 53.0,
    "attributes": [
      "view đẹp",
      "gia đình",
      "check-in",
      "mở cửa khuya"
    ],
    "tags": [
      "view đẹp",
      "gia đình",
      "check-in"
    ],
    "description": "ATM tại Đà Nẵng, phù hợp cho view đẹp, gia đình.",
    "source_row": 54,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI054",
    "poi_name": "ATM BIDV Đà Lạt 54",
    "category": "ATM",
    "brand": "ATM",
    "city": "Đà Lạt",
    "district": "Hải Châu",
    "address": "54 Đường Trung Tâm, Đà Lạt",
    "latitude": 12.877223,
    "longitude": 106.605391,
    "rating": 4.6,
    "review_count": 2385,
    "popularity_score": 70.0,
    "attributes": [
      "gần biển",
      "bãi đỗ xe",
      "phù hợp hẹn hò",
      "đặt bàn"
    ],
    "tags": [
      "gần biển",
      "bãi đỗ xe",
      "phù hợp hẹn hò"
    ],
    "description": "ATM tại Đà Lạt, phù hợp cho gần biển, bãi đỗ xe.",
    "source_row": 55,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI055",
    "poi_name": "Cafe Mộc Hội An 55",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Hội An",
    "district": "Tây Hồ",
    "address": "55 Đường Trung Tâm, Hội An",
    "latitude": 12.950419,
    "longitude": 105.137388,
    "rating": 4.4,
    "review_count": 107,
    "popularity_score": 84.0,
    "attributes": [
      "view đẹp",
      "gia đình",
      "yên tĩnh",
      "gần biển"
    ],
    "tags": [
      "view đẹp",
      "gia đình",
      "yên tĩnh"
    ],
    "description": "Quán cà phê tại Hội An, phù hợp cho view đẹp, gia đình.",
    "source_row": 56,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI056",
    "poi_name": "Khu vui chơi KidZone Đà Lạt 56",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Lạt",
    "district": "Quận 1",
    "address": "56 Đường Trung Tâm, Đà Lạt",
    "latitude": 12.461173,
    "longitude": 108.821817,
    "rating": 4.0,
    "review_count": 1829,
    "popularity_score": 59.0,
    "attributes": [
      "gia đình",
      "view đẹp",
      "đặt bàn",
      "cao cấp"
    ],
    "tags": [
      "gia đình",
      "view đẹp",
      "đặt bàn"
    ],
    "description": "Khu vui chơi tại Đà Lạt, phù hợp cho gia đình, view đẹp.",
    "source_row": 57,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI057",
    "poi_name": "Công viên Xanh Hội An 57",
    "category": "Công viên",
    "brand": "Công",
    "city": "Hội An",
    "district": "Tây Hồ",
    "address": "57 Đường Trung Tâm, Hội An",
    "latitude": 14.506114,
    "longitude": 106.007878,
    "rating": 4.5,
    "review_count": 791,
    "popularity_score": 91.0,
    "attributes": [
      "phù hợp hẹn hò",
      "cao cấp",
      "check-in",
      "bãi đỗ xe"
    ],
    "tags": [
      "phù hợp hẹn hò",
      "cao cấp",
      "check-in"
    ],
    "description": "Công viên tại Hội An, phù hợp cho phù hợp hẹn hò, cao cấp.",
    "source_row": 58,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI058",
    "poi_name": "Khu vui chơi KidZone Hà Nội 58",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Hà Nội",
    "district": "Sơn Trà",
    "address": "58 Đường Trung Tâm, Hà Nội",
    "latitude": 19.589912,
    "longitude": 106.334785,
    "rating": 4.1,
    "review_count": 892,
    "popularity_score": 80.0,
    "attributes": [
      "wifi",
      "gia đình",
      "yên tĩnh",
      "mở cửa khuya"
    ],
    "tags": [
      "wifi",
      "gia đình",
      "yên tĩnh"
    ],
    "description": "Khu vui chơi tại Hà Nội, phù hợp cho wifi, gia đình.",
    "source_row": 59,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI059",
    "poi_name": "Khu vui chơi KidZone Đà Nẵng 59",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Nẵng",
    "district": "Hoàn Kiếm",
    "address": "59 Đường Trung Tâm, Đà Nẵng",
    "latitude": 19.556747,
    "longitude": 108.961715,
    "rating": 4.5,
    "review_count": 2983,
    "popularity_score": 74.0,
    "attributes": [
      "wifi",
      "gần biển",
      "ngoài trời",
      "phù hợp hẹn hò"
    ],
    "tags": [
      "wifi",
      "gần biển",
      "ngoài trời"
    ],
    "description": "Khu vui chơi tại Đà Nẵng, phù hợp cho wifi, gần biển.",
    "source_row": 60,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI060",
    "poi_name": "Cafe Mộc Hà Nội 60",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Hà Nội",
    "district": "Đống Đa",
    "address": "60 Đường Trung Tâm, Hà Nội",
    "latitude": 13.123086,
    "longitude": 108.261335,
    "rating": 4.4,
    "review_count": 1992,
    "popularity_score": 59.0,
    "attributes": [
      "ngoài trời",
      "cao cấp",
      "phù hợp hẹn hò",
      "đặt bàn"
    ],
    "tags": [
      "ngoài trời",
      "cao cấp",
      "phù hợp hẹn hò"
    ],
    "description": "Quán cà phê tại Hà Nội, phù hợp cho ngoài trời, cao cấp.",
    "source_row": 61,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI061",
    "poi_name": "Khu vui chơi KidZone Đà Lạt 61",
    "category": "Khu vui chơi",
    "brand": "Khu",
    "city": "Đà Lạt",
    "district": "Hoàn Kiếm",
    "address": "61 Đường Trung Tâm, Đà Lạt",
    "latitude": 12.372561,
    "longitude": 108.128465,
    "rating": 4.0,
    "review_count": 1196,
    "popularity_score": 68.0,
    "attributes": [
      "đặt bàn",
      "giá hợp lý",
      "cao cấp",
      "yên tĩnh"
    ],
    "tags": [
      "đặt bàn",
      "giá hợp lý",
      "cao cấp"
    ],
    "description": "Khu vui chơi tại Đà Lạt, phù hợp cho đặt bàn, giá hợp lý.",
    "source_row": 62,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI062",
    "poi_name": "Công viên Xanh TP.HCM 62",
    "category": "Công viên",
    "brand": "Công",
    "city": "TP.HCM",
    "district": "Tây Hồ",
    "address": "62 Đường Trung Tâm, TP.HCM",
    "latitude": 11.507209,
    "longitude": 108.461129,
    "rating": 4.6,
    "review_count": 811,
    "popularity_score": 89.0,
    "attributes": [
      "mở cửa khuya",
      "gần biển",
      "đặt bàn",
      "gia đình"
    ],
    "tags": [
      "mở cửa khuya",
      "gần biển",
      "đặt bàn"
    ],
    "description": "Công viên tại TP.HCM, phù hợp cho mở cửa khuya, gần biển.",
    "source_row": 63,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI063",
    "poi_name": "Cafe Mộc Đà Lạt 63",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Đà Lạt",
    "district": "Sơn Trà",
    "address": "63 Đường Trung Tâm, Đà Lạt",
    "latitude": 12.596824,
    "longitude": 105.83694,
    "rating": 4.1,
    "review_count": 1549,
    "popularity_score": 68.0,
    "attributes": [
      "gia đình",
      "phù hợp hẹn hò",
      "view đẹp",
      "ngoài trời"
    ],
    "tags": [
      "gia đình",
      "phù hợp hẹn hò",
      "view đẹp"
    ],
    "description": "Quán cà phê tại Đà Lạt, phù hợp cho gia đình, phù hợp hẹn hò.",
    "source_row": 64,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI064",
    "poi_name": "Điểm check-in Panorama Hội An 64",
    "category": "Địa điểm du lịch",
    "brand": "Điểm",
    "city": "Hội An",
    "district": "Hải Châu",
    "address": "64 Đường Trung Tâm, Hội An",
    "latitude": 17.508133,
    "longitude": 105.60959,
    "rating": 4.1,
    "review_count": 882,
    "popularity_score": 64.0,
    "attributes": [
      "view đẹp",
      "mở cửa khuya",
      "yên tĩnh",
      "đặt bàn"
    ],
    "tags": [
      "view đẹp",
      "mở cửa khuya",
      "yên tĩnh"
    ],
    "description": "Địa điểm du lịch tại Hội An, phù hợp cho view đẹp, mở cửa khuya.",
    "source_row": 65,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI065",
    "poi_name": "Khách sạn Sao Việt Nha Trang 65",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "Nha Trang",
    "district": "Hải Châu",
    "address": "65 Đường Trung Tâm, Nha Trang",
    "latitude": 17.00924,
    "longitude": 108.162599,
    "rating": 4.0,
    "review_count": 1088,
    "popularity_score": 58.0,
    "attributes": [
      "trẻ em",
      "ngoài trời",
      "đặt bàn",
      "wifi"
    ],
    "tags": [
      "trẻ em",
      "ngoài trời",
      "đặt bàn"
    ],
    "description": "Khách sạn tại Nha Trang, phù hợp cho trẻ em, ngoài trời.",
    "source_row": 66,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI066",
    "poi_name": "Bệnh viện Minh Tâm TP.HCM 66",
    "category": "Bệnh viện",
    "brand": "Bệnh",
    "city": "TP.HCM",
    "district": "Tây Hồ",
    "address": "66 Đường Trung Tâm, TP.HCM",
    "latitude": 15.110312,
    "longitude": 108.651486,
    "rating": 4.0,
    "review_count": 2230,
    "popularity_score": 63.0,
    "attributes": [
      "gần biển",
      "giá hợp lý",
      "trẻ em",
      "view đẹp"
    ],
    "tags": [
      "gần biển",
      "giá hợp lý",
      "trẻ em"
    ],
    "description": "Bệnh viện tại TP.HCM, phù hợp cho gần biển, giá hợp lý.",
    "source_row": 67,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI067",
    "poi_name": "Bệnh viện Minh Tâm Nha Trang 67",
    "category": "Bệnh viện",
    "brand": "Bệnh",
    "city": "Nha Trang",
    "district": "Hải Châu",
    "address": "67 Đường Trung Tâm, Nha Trang",
    "latitude": 18.744919,
    "longitude": 106.202209,
    "rating": 4.5,
    "review_count": 1324,
    "popularity_score": 91.0,
    "attributes": [
      "wifi",
      "ngoài trời",
      "cao cấp",
      "mở cửa khuya"
    ],
    "tags": [
      "wifi",
      "ngoài trời",
      "cao cấp"
    ],
    "description": "Bệnh viện tại Nha Trang, phù hợp cho wifi, ngoài trời.",
    "source_row": 68,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI068",
    "poi_name": "Cafe Mộc Đà Nẵng 68",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Đà Nẵng",
    "district": "Sơn Trà",
    "address": "68 Đường Trung Tâm, Đà Nẵng",
    "latitude": 12.064217,
    "longitude": 107.993788,
    "rating": 4.1,
    "review_count": 1344,
    "popularity_score": 92.0,
    "attributes": [
      "view đẹp",
      "ngoài trời",
      "giá hợp lý",
      "đặt bàn"
    ],
    "tags": [
      "view đẹp",
      "ngoài trời",
      "giá hợp lý"
    ],
    "description": "Quán cà phê tại Đà Nẵng, phù hợp cho view đẹp, ngoài trời.",
    "source_row": 69,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI069",
    "poi_name": "Cafe Mộc TP.HCM 69",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "TP.HCM",
    "district": "Sơn Trà",
    "address": "69 Đường Trung Tâm, TP.HCM",
    "latitude": 17.278887,
    "longitude": 106.639291,
    "rating": 3.9,
    "review_count": 2371,
    "popularity_score": 84.0,
    "attributes": [
      "đặt bàn",
      "cao cấp",
      "giá hợp lý",
      "mở cửa khuya"
    ],
    "tags": [
      "đặt bàn",
      "cao cấp",
      "giá hợp lý"
    ],
    "description": "Quán cà phê tại TP.HCM, phù hợp cho đặt bàn, cao cấp.",
    "source_row": 70,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI070",
    "poi_name": "Công viên Xanh Hà Nội 70",
    "category": "Công viên",
    "brand": "Công",
    "city": "Hà Nội",
    "district": "Hoàn Kiếm",
    "address": "70 Đường Trung Tâm, Hà Nội",
    "latitude": 13.827136,
    "longitude": 108.890692,
    "rating": 4.4,
    "review_count": 628,
    "popularity_score": 80.0,
    "attributes": [
      "ngoài trời",
      "yên tĩnh",
      "gần biển",
      "wifi"
    ],
    "tags": [
      "ngoài trời",
      "yên tĩnh",
      "gần biển"
    ],
    "description": "Công viên tại Hà Nội, phù hợp cho ngoài trời, yên tĩnh.",
    "source_row": 71,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI071",
    "poi_name": "Khách sạn Sao Việt TP.HCM 71",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "TP.HCM",
    "district": "Quận 1",
    "address": "71 Đường Trung Tâm, TP.HCM",
    "latitude": 21.678351,
    "longitude": 106.673431,
    "rating": 4.0,
    "review_count": 1915,
    "popularity_score": 89.0,
    "attributes": [
      "mở cửa khuya",
      "yên tĩnh",
      "giá hợp lý",
      "phù hợp hẹn hò"
    ],
    "tags": [
      "mở cửa khuya",
      "yên tĩnh",
      "giá hợp lý"
    ],
    "description": "Khách sạn tại TP.HCM, phù hợp cho mở cửa khuya, yên tĩnh.",
    "source_row": 72,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI072",
    "poi_name": "Bệnh viện Minh Tâm TP.HCM 72",
    "category": "Bệnh viện",
    "brand": "Bệnh",
    "city": "TP.HCM",
    "district": "Hoàn Kiếm",
    "address": "72 Đường Trung Tâm, TP.HCM",
    "latitude": 18.355085,
    "longitude": 106.678138,
    "rating": 4.0,
    "review_count": 1192,
    "popularity_score": 82.0,
    "attributes": [
      "mở cửa khuya",
      "gần biển",
      "bãi đỗ xe",
      "wifi"
    ],
    "tags": [
      "mở cửa khuya",
      "gần biển",
      "bãi đỗ xe"
    ],
    "description": "Bệnh viện tại TP.HCM, phù hợp cho mở cửa khuya, gần biển.",
    "source_row": 73,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI073",
    "poi_name": "Trung tâm thương mại City Plaza Đà Nẵng 73",
    "category": "Trung tâm thương mại",
    "brand": "Trung",
    "city": "Đà Nẵng",
    "district": "Hoàn Kiếm",
    "address": "73 Đường Trung Tâm, Đà Nẵng",
    "latitude": 20.576006,
    "longitude": 106.908113,
    "rating": 4.1,
    "review_count": 68,
    "popularity_score": 85.0,
    "attributes": [
      "phù hợp hẹn hò",
      "check-in",
      "gần biển",
      "wifi"
    ],
    "tags": [
      "phù hợp hẹn hò",
      "check-in",
      "gần biển"
    ],
    "description": "Trung tâm thương mại tại Đà Nẵng, phù hợp cho phù hợp hẹn hò, check-in.",
    "source_row": 74,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI074",
    "poi_name": "Khách sạn Sao Việt TP.HCM 74",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "TP.HCM",
    "district": "Đống Đa",
    "address": "74 Đường Trung Tâm, TP.HCM",
    "latitude": 14.565382,
    "longitude": 107.599228,
    "rating": 4.7,
    "review_count": 2805,
    "popularity_score": 82.0,
    "attributes": [
      "wifi",
      "gia đình",
      "check-in",
      "view đẹp"
    ],
    "tags": [
      "wifi",
      "gia đình",
      "check-in"
    ],
    "description": "Khách sạn tại TP.HCM, phù hợp cho wifi, gia đình.",
    "source_row": 75,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI075",
    "poi_name": "ATM BIDV Đà Nẵng 75",
    "category": "ATM",
    "brand": "ATM",
    "city": "Đà Nẵng",
    "district": "Đống Đa",
    "address": "75 Đường Trung Tâm, Đà Nẵng",
    "latitude": 20.941099,
    "longitude": 106.270907,
    "rating": 4.6,
    "review_count": 218,
    "popularity_score": 51.0,
    "attributes": [
      "yên tĩnh",
      "phù hợp hẹn hò",
      "view đẹp",
      "bãi đỗ xe"
    ],
    "tags": [
      "yên tĩnh",
      "phù hợp hẹn hò",
      "view đẹp"
    ],
    "description": "ATM tại Đà Nẵng, phù hợp cho yên tĩnh, phù hợp hẹn hò.",
    "source_row": 76,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI076",
    "poi_name": "Cafe Mộc Đà Lạt 76",
    "category": "Quán cà phê",
    "brand": "Cafe",
    "city": "Đà Lạt",
    "district": "Hải Châu",
    "address": "76 Đường Trung Tâm, Đà Lạt",
    "latitude": 13.629296,
    "longitude": 107.343319,
    "rating": 4.5,
    "review_count": 2772,
    "popularity_score": 60.0,
    "attributes": [
      "ngoài trời",
      "giá hợp lý",
      "bãi đỗ xe",
      "gần biển"
    ],
    "tags": [
      "ngoài trời",
      "giá hợp lý",
      "bãi đỗ xe"
    ],
    "description": "Quán cà phê tại Đà Lạt, phù hợp cho ngoài trời, giá hợp lý.",
    "source_row": 77,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI077",
    "poi_name": "Điểm check-in Panorama Nha Trang 77",
    "category": "Địa điểm du lịch",
    "brand": "Điểm",
    "city": "Nha Trang",
    "district": "Hải Châu",
    "address": "77 Đường Trung Tâm, Nha Trang",
    "latitude": 13.399565,
    "longitude": 107.835328,
    "rating": 4.6,
    "review_count": 1341,
    "popularity_score": 73.0,
    "attributes": [
      "ngoài trời",
      "yên tĩnh",
      "check-in",
      "mở cửa khuya"
    ],
    "tags": [
      "ngoài trời",
      "yên tĩnh",
      "check-in"
    ],
    "description": "Địa điểm du lịch tại Nha Trang, phù hợp cho ngoài trời, yên tĩnh.",
    "source_row": 78,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI078",
    "poi_name": "Khách sạn Sao Việt TP.HCM 78",
    "category": "Khách sạn",
    "brand": "Khách",
    "city": "TP.HCM",
    "district": "Hoàn Kiếm",
    "address": "78 Đường Trung Tâm, TP.HCM",
    "latitude": 13.403413,
    "longitude": 107.437706,
    "rating": 3.8,
    "review_count": 414,
    "popularity_score": 82.0,
    "attributes": [
      "trẻ em",
      "cao cấp",
      "yên tĩnh",
      "wifi"
    ],
    "tags": [
      "trẻ em",
      "cao cấp",
      "yên tĩnh"
    ],
    "description": "Khách sạn tại TP.HCM, phù hợp cho trẻ em, cao cấp.",
    "source_row": 79,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI079",
    "poi_name": "Công viên Xanh Đà Lạt 79",
    "category": "Công viên",
    "brand": "Công",
    "city": "Đà Lạt",
    "district": "Tây Hồ",
    "address": "79 Đường Trung Tâm, Đà Lạt",
    "latitude": 13.237298,
    "longitude": 107.807666,
    "rating": 4.3,
    "review_count": 974,
    "popularity_score": 82.0,
    "attributes": [
      "giá hợp lý",
      "yên tĩnh",
      "cao cấp",
      "gia đình"
    ],
    "tags": [
      "giá hợp lý",
      "yên tĩnh",
      "cao cấp"
    ],
    "description": "Công viên tại Đà Lạt, phù hợp cho giá hợp lý, yên tĩnh.",
    "source_row": 80,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  },
  {
    "poi_id": "POI080",
    "poi_name": "Công viên Xanh Đà Nẵng 80",
    "category": "Công viên",
    "brand": "Công",
    "city": "Đà Nẵng",
    "district": "Đống Đa",
    "address": "80 Đường Trung Tâm, Đà Nẵng",
    "latitude": 13.478821,
    "longitude": 108.110192,
    "rating": 4.1,
    "review_count": 274,
    "popularity_score": 81.0,
    "attributes": [
      "bãi đỗ xe",
      "gần biển",
      "yên tĩnh",
      "giá hợp lý"
    ],
    "tags": [
      "bãi đỗ xe",
      "gần biển",
      "yên tĩnh"
    ],
    "description": "Công viên tại Đà Nẵng, phù hợp cho bãi đỗ xe, gần biển.",
    "source_row": 81,
    "provenance": "synthetic-p8-workbook:POI_Dataset"
  }
] as const satisfies readonly P8Poi[];

export const p8PoiById: ReadonlyMap<string, P8Poi> = new Map(p8PoiCorpus.map((poi) => [poi.poi_id, poi]));

export function toP7Poi(poi: P8Poi): P7Poi {
  return {
    poi_id: poi.poi_id,
    poi_name: poi.poi_name,
    brand: poi.brand || poi.poi_name,
    category: categoryForP7(poi.category),
    sub_category: poi.category,
    city: poi.city,
    district: poi.district,
    address: poi.address,
    latitude: poi.latitude,
    longitude: poi.longitude,
    rating: poi.rating,
    review_count: poi.review_count,
    popularity_score: poi.popularity_score,
    price_level: priceLevelFor(poi),
    opening_hours: openingHoursFor(poi),
    attributes: poi.attributes,
    tags: [...poi.tags, poi.category, poi.city, poi.district],
    description: poi.description,
    source_row: poi.source_row,
    provenance: poi.provenance
  };
}

export const p8AsP7PoiCorpus: P7Poi[] = p8PoiCorpus.map(toP7Poi);

function categoryForP7(category: string): string {
  const folded = category.toLocaleLowerCase("vi");
  if (folded.includes("rạp")) return "Rạp phim";
  if (folded.includes("du lịch") || folded.includes("văn hóa") || folded.includes("chợ") || folded.includes("sân bay")) return "Điểm tham quan";
  if (folded.includes("khu vui chơi")) return "Công viên";
  if (folded.includes("resort")) return "Khách sạn";
  if (folded.includes("rooftop") || folded.includes("bar")) return "Nhà hàng";
  return category;
}

function priceLevelFor(poi: P8Poi): number {
  const haystack = [...poi.attributes, ...poi.tags, poi.description].join(" ").toLocaleLowerCase("vi");
  if (haystack.includes("cao cấp") || haystack.includes("5 sao") || haystack.includes("luxury") || haystack.includes("resort")) return 3;
  if (haystack.includes("giá hợp lý") || haystack.includes("giá rẻ") || haystack.includes("budget")) return 1;
  return 2;
}

function openingHoursFor(poi: P8Poi): string {
  const haystack = [...poi.attributes, ...poi.tags].join(" ").toLocaleLowerCase("vi");
  if (haystack.includes("24/7")) return "00:00-24:00";
  if (haystack.includes("mở cửa khuya") || haystack.includes("mở khuya") || haystack.includes("nightlife")) return "10:00-02:00";
  if (haystack.includes("mở cửa sớm")) return "06:00-22:00";
  return "08:00-22:00";
}
