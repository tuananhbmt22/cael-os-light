import type { CorpusUnit } from "@cael/os-light";

export interface P9Poi {
  id: string;
  name: string;
  aliases?: string[];
  category: string;
  popularity: number;
  query_frequency: number;
}

export interface P9PopularQuery {
  id: string;
  text: string;
  query_frequency: number;
}

export interface P9CategorySuggestion {
  id: string;
  text: string;
  popularity: number;
  query_frequency: number;
}

export interface P9AbbreviationEntry {
  id: string;
  abbr: string;
  expansion: string;
  popularity: number;
  query_frequency: number;
}

export const p9Pois: P9Poi[] = [
  {
    id: "SYN-POI-VINMART-DONG-SEN",
    name: "VinMart Đồng Sen",
    aliases: ["vin mart dong sen", "siêu thị đồng sen"],
    category: "siêu thị",
    popularity: 78,
    query_frequency: 400
  },
  {
    id: "SYN-POI-VINPEARL-CUA-HOI",
    name: "Vinpearl Cửa Hội",
    aliases: ["vin pearl cua hoi", "khách sạn cửa hội"],
    category: "khách sạn",
    popularity: 92,
    query_frequency: 340
  },
  {
    id: "SYN-POI-VINCOM-LE-LOI",
    name: "Vincom Lê Lợi",
    aliases: ["vincom le loi", "trung tâm thương mại lê lợi"],
    category: "trung tâm thương mại",
    popularity: 85,
    query_frequency: 520
  },
  {
    id: "SYN-POI-BV-HOA-SEN",
    name: "Bệnh viện Hoa Sen",
    aliases: ["bv hoa sen", "benh vien hoa sen"],
    category: "bệnh viện",
    popularity: 88,
    query_frequency: 610
  },
  {
    id: "SYN-POI-BV-BINH-MINH",
    name: "Bệnh viện Bình Minh",
    aliases: ["bv binh minh", "benh vien binh minh"],
    category: "bệnh viện",
    popularity: 74,
    query_frequency: 470
  },
  {
    id: "SYN-POI-DH-SAO-KHUE",
    name: "Đại học Sao Khuê",
    aliases: ["dh sao khue", "đh sao khuê"],
    category: "đại học",
    popularity: 68,
    query_frequency: 430
  },
  {
    id: "SYN-POI-SB-DONG-HA",
    name: "Sân bay Đông Hà",
    aliases: ["sb dong ha", "san bay dong ha"],
    category: "sân bay",
    popularity: 96,
    query_frequency: 680
  },
  {
    id: "SYN-POI-QUAN-1-PHO-DI-BO",
    name: "Quận 1 Phố Đi Bộ",
    aliases: ["q1 pho di bo", "quận một phố đi bộ"],
    category: "điểm đi bộ",
    popularity: 91,
    query_frequency: 620
  },
  {
    id: "SYN-POI-CC-AN-PHU",
    name: "Chung cư An Phú",
    aliases: ["cc an phu", "can ho an phu"],
    category: "chung cư",
    popularity: 72,
    query_frequency: 360
  },
  {
    id: "SYN-POI-KDC-NAM-SONG",
    name: "Khu dân cư Nam Sông",
    aliases: ["kdc nam song", "khu dan cu nam song"],
    category: "khu dân cư",
    popularity: 66,
    query_frequency: 300
  },
  {
    id: "SYN-POI-NHA-THUOC-MAI-ANH",
    name: "Nhà thuốc Mai Anh",
    aliases: ["nha thuoc mai anh"],
    category: "nhà thuốc",
    popularity: 59,
    query_frequency: 260
  },
  {
    id: "SYN-POI-TRAM-SAC-CAU-DONG",
    name: "Trạm sạc Cầu Đông",
    aliases: ["tram sac cau dong", "sạc xe cầu đông"],
    category: "trạm sạc",
    popularity: 63,
    query_frequency: 410
  },
  {
    id: "SYN-POI-CONG-VIEN-MAT-TROI",
    name: "Công viên Mặt Trời",
    aliases: ["cv mat troi", "cong vien mat troi"],
    category: "công viên",
    popularity: 80,
    query_frequency: 390
  },
  {
    id: "SYN-POI-CHO-TAN-LAP",
    name: "Chợ Tân Lập",
    aliases: ["cho tan lap"],
    category: "chợ",
    popularity: 61,
    query_frequency: 330
  },
  {
    id: "SYN-POI-PHO-SACH-NGUYEN-HUE",
    name: "Phố sách Nguyễn Huệ",
    aliases: ["pho sach nguyen hue", "đường sách nguyễn huệ"],
    category: "phố sách",
    popularity: 84,
    query_frequency: 450
  },
  {
    id: "SYN-POI-CA-PHE-MUA-NHO",
    name: "Cà phê Mưa Nhỏ",
    aliases: ["cafe mua nho", "ca phe mua nho"],
    category: "cà phê",
    popularity: 57,
    query_frequency: 280
  },
  {
    id: "SYN-POI-BEN-XE-MIEN-DONG",
    name: "Bến xe Miền Đông",
    aliases: ["bx mien dong", "ben xe mien dong"],
    category: "bến xe",
    popularity: 87,
    query_frequency: 540
  },
  {
    id: "SYN-POI-BAO-TANG-ANH-DUONG",
    name: "Bảo tàng Ánh Dương",
    aliases: ["bao tang anh duong"],
    category: "bảo tàng",
    popularity: 62,
    query_frequency: 250
  },
  {
    id: "SYN-POI-RAP-PHIM-SAO-BAC",
    name: "Rạp phim Sao Bắc",
    aliases: ["rap phim sao bac"],
    category: "rạp phim",
    popularity: 76,
    query_frequency: 370
  },
  {
    id: "SYN-POI-ATM-NGAN-HANG-XANH",
    name: "ATM Ngân Hàng Xanh",
    aliases: ["atm ngan hang xanh"],
    category: "atm",
    popularity: 73,
    query_frequency: 420
  },
  {
    id: "SYN-POI-TT-DANG-KIEM-MAU",
    name: "Trung tâm Đăng Kiểm Mẫu",
    aliases: ["tt dang kiem mau", "đăng kiểm mẫu"],
    category: "đăng kiểm",
    popularity: 81,
    query_frequency: 490
  },
  {
    id: "SYN-POI-NHA-HANG-LUA-VANG",
    name: "Nhà hàng Lúa Vàng",
    aliases: ["nha hang lua vang"],
    category: "nhà hàng",
    popularity: 70,
    query_frequency: 315
  },
  {
    id: "SYN-POI-TRUONG-HOA-MAI",
    name: "Trường mầm non Hoa Mai",
    aliases: ["truong mam non hoa mai"],
    category: "trường học",
    popularity: 55,
    query_frequency: 230
  },
  {
    id: "SYN-POI-GA-METRO-CAT-LINH",
    name: "Ga Metro Cát Linh",
    aliases: ["ga cat linh", "metro cat linh"],
    category: "ga metro",
    popularity: 83,
    query_frequency: 510
  },
  {
    id: "SYN-POI-HO-BAN-NGUYET",
    name: "Hồ Bán Nguyệt",
    aliases: ["ho ban nguyet"],
    category: "hồ cảnh quan",
    popularity: 69,
    query_frequency: 295
  }
];

export const popularQueries: P9PopularQuery[] = [
  { id: "SYN-Q-BENH-VIEN-GAN-NHAT", text: "bệnh viện gần nhất", query_frequency: 720 },
  { id: "SYN-Q-QUAN-AN-Q1", text: "quán ăn quận 1", query_frequency: 690 },
  { id: "SYN-Q-SAN-BAY-GAN-TOI", text: "sân bay gần tôi", query_frequency: 650 },
  { id: "SYN-Q-CHUNG-CU-AN-PHU", text: "chung cư an phú", query_frequency: 610 },
  { id: "SYN-Q-DAI-HOC-GAN-DAY", text: "đại học gần đây", query_frequency: 590 },
  { id: "SYN-Q-BEN-XE-MIEN-DONG", text: "bến xe miền đông", query_frequency: 580 },
  { id: "SYN-Q-TRAM-SAC-GAN-NHAT", text: "trạm sạc gần nhất", query_frequency: 560 },
  { id: "SYN-Q-DANG-KIEM-XE", text: "đăng kiểm xe ô tô", query_frequency: 530 },
  { id: "SYN-Q-PHO-DI-BO-CUOI-TUAN", text: "phố đi bộ cuối tuần", query_frequency: 500 },
  { id: "SYN-Q-VINCOM-GIO-MO-CUA", text: "vincom giờ mở cửa", query_frequency: 360 }
];

export const categorySuggestions: P9CategorySuggestion[] = [
  { id: "SYN-CAT-BENH-VIEN", text: "bệnh viện", popularity: 88, query_frequency: 610 },
  { id: "SYN-CAT-SAN-BAY", text: "sân bay", popularity: 96, query_frequency: 680 },
  { id: "SYN-CAT-CHUNG-CU", text: "chung cư", popularity: 72, query_frequency: 360 },
  { id: "SYN-CAT-DAI-HOC", text: "đại học", popularity: 68, query_frequency: 430 },
  { id: "SYN-CAT-BEN-XE", text: "bến xe", popularity: 87, query_frequency: 540 },
  { id: "SYN-CAT-DANG-KIEM", text: "đăng kiểm", popularity: 81, query_frequency: 490 },
  { id: "SYN-CAT-TRAM-SAC", text: "trạm sạc", popularity: 63, query_frequency: 410 },
  { id: "SYN-CAT-TRUNG-TAM-THUONG-MAI", text: "trung tâm thương mại", popularity: 85, query_frequency: 520 },
  { id: "SYN-CAT-KHU-DAN-CU", text: "khu dân cư", popularity: 66, query_frequency: 300 },
  { id: "SYN-CAT-CONG-VIEN", text: "công viên", popularity: 80, query_frequency: 390 }
];

export const abbreviationEntries: P9AbbreviationEntry[] = [
  { id: "SYN-ABBR-BV", abbr: "bv", expansion: "bệnh viện", popularity: 88, query_frequency: 610 },
  { id: "SYN-ABBR-Q1", abbr: "q1", expansion: "quận 1", popularity: 91, query_frequency: 620 },
  { id: "SYN-ABBR-Q2", abbr: "q2", expansion: "quận 2", popularity: 64, query_frequency: 290 },
  { id: "SYN-ABBR-TP", abbr: "tp", expansion: "thành phố", popularity: 70, query_frequency: 310 },
  { id: "SYN-ABBR-TPHCM", abbr: "tphcm", expansion: "thành phố hồ chí minh", popularity: 86, query_frequency: 600 },
  { id: "SYN-ABBR-HN", abbr: "hn", expansion: "hà nội", popularity: 79, query_frequency: 440 },
  { id: "SYN-ABBR-DH-ACCENT", abbr: "đh", expansion: "đại học", popularity: 68, query_frequency: 430 },
  { id: "SYN-ABBR-DH", abbr: "dh", expansion: "đại học", popularity: 68, query_frequency: 430 },
  { id: "SYN-ABBR-SB", abbr: "sb", expansion: "sân bay", popularity: 96, query_frequency: 680 },
  { id: "SYN-ABBR-CC", abbr: "cc", expansion: "chung cư", popularity: 72, query_frequency: 360 },
  { id: "SYN-ABBR-KDC", abbr: "kdc", expansion: "khu dân cư", popularity: 66, query_frequency: 300 },
  { id: "SYN-ABBR-BX", abbr: "bx", expansion: "bến xe", popularity: 87, query_frequency: 540 },
  { id: "SYN-ABBR-CV", abbr: "cv", expansion: "công viên", popularity: 80, query_frequency: 390 },
  { id: "SYN-ABBR-TTTM", abbr: "tttm", expansion: "trung tâm thương mại", popularity: 85, query_frequency: 520 },
  { id: "SYN-ABBR-GA", abbr: "ga", expansion: "ga metro", popularity: 83, query_frequency: 510 },
  { id: "SYN-ABBR-DK", abbr: "dk", expansion: "đăng kiểm", popularity: 81, query_frequency: 490 }
];

export const abbreviations: Record<string, string> = Object.fromEntries(
  abbreviationEntries.map((entry) => [entry.abbr, entry.expansion])
);

export const typoCorrections: Record<string, string> = {
  vincon: "vincom",
  "ben vien": "bệnh viện",
  "san bai": "sân bay",
  quan1: "quận 1",
  "nguyen hue": "nguyễn huệ",
  "chung cu": "chung cư",
  "dai hoc": "đại học"
};

const poiUnits: CorpusUnit[] = p9Pois.map((poi) => ({
  id: poi.id,
  source: "synthetic-p9-autocomplete-poi",
  facts: [
    `${poi.name} is a synthetic POI in category ${poi.category}.`,
    `Synthetic popularity ${poi.popularity}; synthetic query_frequency ${poi.query_frequency}.`
  ],
  numbers: [poi.popularity, poi.query_frequency],
  keywords: [poi.name, poi.category, ...(poi.aliases ?? [])]
}));

const popularQueryUnits: CorpusUnit[] = popularQueries.map((query) => ({
  id: query.id,
  source: "synthetic-p9-autocomplete-popular-query",
  facts: [`${query.text} is a synthetic popular query with query_frequency ${query.query_frequency}.`],
  numbers: [query.query_frequency],
  keywords: [query.text]
}));

const categoryUnits: CorpusUnit[] = categorySuggestions.map((category) => ({
  id: category.id,
  source: "synthetic-p9-autocomplete-category",
  facts: [
    `${category.text} is a synthetic category suggestion.`,
    `Synthetic popularity ${category.popularity}; synthetic query_frequency ${category.query_frequency}.`
  ],
  numbers: [category.popularity, category.query_frequency],
  keywords: [category.text]
}));

const abbreviationUnits: CorpusUnit[] = abbreviationEntries.map((entry) => ({
  id: entry.id,
  source: "synthetic-p9-autocomplete-abbreviation",
  facts: [`${entry.abbr} expands deterministically to ${entry.expansion}.`],
  numbers: [entry.popularity, entry.query_frequency],
  keywords: [entry.abbr, entry.expansion]
}));

export const syntheticCorpus: CorpusUnit[] = [
  {
    id: "SYN-P9-SHAPE",
    source: "synthetic-p9-autocomplete-pack",
    facts: [
      "P9 autocomplete ranks synthetic Vietnamese prefixes by deterministic match, popularity, query frequency, and optional recent-query bonus.",
      "No client rows, live model calls, or live API keys are present in this corpus."
    ],
    keywords: ["autocomplete", "synthetic", "prefix", "ranking"]
  },
  ...poiUnits,
  ...popularQueryUnits,
  ...categoryUnits,
  ...abbreviationUnits
];
