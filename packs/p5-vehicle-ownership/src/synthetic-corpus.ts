import type { CorpusUnit } from "@cael/os-light";

export interface P5User {
  user_id: string;
  user_name: string;
  city: string;
  age_group: string;
  user_segment: string;
  primary_vehicle_id: string;
  driving_frequency: string;
  preferred_channel: string;
  main_concerns: string;
  digital_confidence: string;
}

export interface P5Vehicle {
  vehicle_id: string;
  user_id: string;
  vehicle_type: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  license_plate_masked: string;
  ownership_status: string;
  inspection_expiry: string;
  civil_liability_expiry: string;
  registration_expiry: string;
  roadside_assistance_status: string;
  vehicle_age_years: number;
  risk_notes: string;
}

export interface P5Document {
  document_id: string;
  vehicle_id: string;
  document_type: string;
  document_name: string;
  status: string;
  issue_date: string;
  expiry_date: string;
  uploaded: "Yes" | "No";
  notes: string;
}

export interface P5Knowledge {
  knowledge_id: string;
  topic: string;
  question: string;
  answer: string;
  related_documents: string;
  recommended_action: string;
}

export interface P5Service {
  service_id: string;
  service_name: string;
  category: string;
  description: string;
  context_to_recommend: string;
  mock_integration: string;
}

export interface P5MockApi {
  api_name: string;
  method: "GET" | "POST";
  endpoint: string;
  purpose: string;
  sample_response: string;
}

export const p5Users: P5User[] = [
  // Source: User Profiles row U001.
  {
    "user_id": "U001",
    "user_name": "Nguyễn Minh Anh",
    "city": "Hà Nội",
    "age_group": "25-34",
    "user_segment": "Daily commuter",
    "primary_vehicle_id": "VEH001",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Push",
    "main_concerns": "Hay quên hạn đăng kiểm và bảo hiểm",
    "digital_confidence": "High"
  },
  // Source: User Profiles row U002.
  {
    "user_id": "U002",
    "user_name": "Trần Quốc Huy",
    "city": "TP.HCM",
    "age_group": "35-44",
    "user_segment": "Family driver",
    "primary_vehicle_id": "VEH002",
    "driving_frequency": "4-5 lần/tuần",
    "preferred_channel": "Push",
    "main_concerns": "Quản lý giấy tờ xe gia đình",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U003.
  {
    "user_id": "U003",
    "user_name": "Lê Thu Trang",
    "city": "Đà Nẵng",
    "age_group": "25-34",
    "user_segment": "New car owner",
    "primary_vehicle_id": "VEH003",
    "driving_frequency": "2-3 lần/tuần",
    "preferred_channel": "Zalo",
    "main_concerns": "Không rõ thủ tục đăng kiểm",
    "digital_confidence": "Low"
  },
  // Source: User Profiles row U004.
  {
    "user_id": "U004",
    "user_name": "Phạm Hoàng Nam",
    "city": "Hải Phòng",
    "age_group": "45-54",
    "user_segment": "Business traveler",
    "primary_vehicle_id": "VEH004",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Email",
    "main_concerns": "Cần nhắc nhở chủ động và hóa đơn",
    "digital_confidence": "High"
  },
  // Source: User Profiles row U005.
  {
    "user_id": "U005",
    "user_name": "Vũ Mai Linh",
    "city": "Hà Nội",
    "age_group": "18-24",
    "user_segment": "First-time owner",
    "primary_vehicle_id": "VEH005",
    "driving_frequency": "1-2 lần/tuần",
    "preferred_channel": "Push",
    "main_concerns": "Không biết giấy tờ cần lưu",
    "digital_confidence": "Low"
  },
  // Source: User Profiles row U006.
  {
    "user_id": "U006",
    "user_name": "Đỗ Văn Khoa",
    "city": "TP.HCM",
    "age_group": "35-44",
    "user_segment": "Older vehicle owner",
    "primary_vehicle_id": "VEH006",
    "driving_frequency": "3-4 lần/tuần",
    "preferred_channel": "Push",
    "main_concerns": "Xe cũ, lo sự cố và cứu hộ",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U007.
  {
    "user_id": "U007",
    "user_name": "Bùi Ngọc Hà",
    "city": "Nha Trang",
    "age_group": "25-34",
    "user_segment": "Weekend traveler",
    "primary_vehicle_id": "VEH007",
    "driving_frequency": "Cuối tuần",
    "preferred_channel": "Push",
    "main_concerns": "Đi xa cuối tuần, cần bảo vệ tốt hơn",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U008.
  {
    "user_id": "U008",
    "user_name": "Ngô Đức Long",
    "city": "Hà Nội",
    "age_group": "45-54",
    "user_segment": "Multi-vehicle user",
    "primary_vehicle_id": "VEH008",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Email",
    "main_concerns": "Quản lý nhiều xe, nhiều hạn giấy tờ",
    "digital_confidence": "High"
  },
  // Source: User Profiles row U009.
  {
    "user_id": "U009",
    "user_name": "Đặng Thảo Vy",
    "city": "Đà Lạt",
    "age_group": "25-34",
    "user_segment": "Occasional driver",
    "primary_vehicle_id": "VEH009",
    "driving_frequency": "2-3 lần/tháng",
    "preferred_channel": "Push",
    "main_concerns": "Thường bỏ lỡ thông báo",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U010.
  {
    "user_id": "U010",
    "user_name": "Hoàng Gia Bảo",
    "city": "TP.HCM",
    "age_group": "35-44",
    "user_segment": "EV owner",
    "primary_vehicle_id": "VEH010",
    "driving_frequency": "3-4 lần/tuần",
    "preferred_channel": "Push",
    "main_concerns": "Quản lý giấy tờ xe điện và dịch vụ sạc",
    "digital_confidence": "High"
  },
  // Source: User Profiles row U011.
  {
    "user_id": "U011",
    "user_name": "Mai Anh Tuấn",
    "city": "Hà Nội",
    "age_group": "35-44",
    "user_segment": "Roadside candidate",
    "primary_vehicle_id": "VEH011",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Push",
    "main_concerns": "Xe trên 8 năm, chưa có cứu hộ",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U012.
  {
    "user_id": "U012",
    "user_name": "Phan Thùy Dương",
    "city": "TP.HCM",
    "age_group": "25-34",
    "user_segment": "Insurance candidate",
    "primary_vehicle_id": "VEH012",
    "driving_frequency": "2-3 lần/tuần",
    "preferred_channel": "SMS",
    "main_concerns": "Bảo hiểm sắp hết hạn",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U013.
  {
    "user_id": "U013",
    "user_name": "Lê Hoàng Phúc",
    "city": "Đà Nẵng",
    "age_group": "35-44",
    "user_segment": "Business traveler",
    "primary_vehicle_id": "VEH013",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Email",
    "main_concerns": "Cần quản lý lịch bảo dưỡng và đăng kiểm",
    "digital_confidence": "High"
  },
  // Source: User Profiles row U014.
  {
    "user_id": "U014",
    "user_name": "Trịnh Bảo Châu",
    "city": "Hà Nội",
    "age_group": "25-34",
    "user_segment": "Light user",
    "primary_vehicle_id": "VEH014",
    "driving_frequency": "Thấp",
    "preferred_channel": "Zalo",
    "main_concerns": "Cần hướng dẫn đơn giản",
    "digital_confidence": "Low"
  },
  // Source: User Profiles row U015.
  {
    "user_id": "U015",
    "user_name": "Đinh Quốc Việt",
    "city": "TP.HCM",
    "age_group": "45-54",
    "user_segment": "Family driver",
    "primary_vehicle_id": "VEH015",
    "driving_frequency": "4-5 lần/tuần",
    "preferred_channel": "SMS",
    "main_concerns": "Xe gia đình sắp hết bảo hiểm",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U016.
  {
    "user_id": "U016",
    "user_name": "Nguyễn Khánh Linh",
    "city": "Hải Phòng",
    "age_group": "25-34",
    "user_segment": "EV owner",
    "primary_vehicle_id": "VEH016",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Push",
    "main_concerns": "Xe điện, cần nhắc bảo dưỡng và sạc",
    "digital_confidence": "High"
  },
  // Source: User Profiles row U017.
  {
    "user_id": "U017",
    "user_name": "Võ Minh Quân",
    "city": "Đà Nẵng",
    "age_group": "18-24",
    "user_segment": "New user",
    "primary_vehicle_id": "VEH017",
    "driving_frequency": "Mới lái",
    "preferred_channel": "Push",
    "main_concerns": "Không biết đăng kiểm cần gì",
    "digital_confidence": "Low"
  },
  // Source: User Profiles row U018.
  {
    "user_id": "U018",
    "user_name": "Tạ Ngọc Sơn",
    "city": "Hà Nội",
    "age_group": "35-44",
    "user_segment": "Parking user",
    "primary_vehicle_id": "VEH018",
    "driving_frequency": "Hằng ngày",
    "preferred_channel": "Push",
    "main_concerns": "Hay đi nội đô, cần giấy tờ đủ",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U019.
  {
    "user_id": "U019",
    "user_name": "Lâm Hương Giang",
    "city": "TP.HCM",
    "age_group": "25-34",
    "user_segment": "Inactive user",
    "primary_vehicle_id": "VEH019",
    "driving_frequency": "3-4 lần/tuần",
    "preferred_channel": "Email",
    "main_concerns": "Ít mở app, cần nhắc đúng lúc",
    "digital_confidence": "Medium"
  },
  // Source: User Profiles row U020.
  {
    "user_id": "U020",
    "user_name": "Hồ Đức Anh",
    "city": "Nha Trang",
    "age_group": "35-44",
    "user_segment": "Insurance candidate",
    "primary_vehicle_id": "VEH020",
    "driving_frequency": "3-4 lần/tuần",
    "preferred_channel": "Push",
    "main_concerns": "Bảo hiểm và đăng kiểm đều sắp hết hạn",
    "digital_confidence": "Medium"
  }
];

export const p5Vehicles: P5Vehicle[] = [
  // Source: Vehicle Dataset row U001.
  {
    "vehicle_id": "VEH001",
    "user_id": "U001",
    "vehicle_type": "Car",
    "brand": "Toyota",
    "model": "Vios",
    "year": 2019,
    "fuel_type": "Gasoline",
    "license_plate_masked": "30A-***.12",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-07-20",
    "civil_liability_expiry": "2026-08-15",
    "registration_expiry": "2029-01-10",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 7,
    "risk_notes": "Đăng kiểm sắp hết hạn, chưa có cứu hộ"
  },
  // Source: Vehicle Dataset row U002.
  {
    "vehicle_id": "VEH002",
    "user_id": "U002",
    "vehicle_type": "Car",
    "brand": "Mazda",
    "model": "CX-5",
    "year": 2021,
    "fuel_type": "Gasoline",
    "license_plate_masked": "51G-***.88",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-01-10",
    "civil_liability_expiry": "2026-11-05",
    "registration_expiry": "2030-02-01",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 5,
    "risk_notes": "Xe gia đình, cần nhắc bảo hiểm"
  },
  // Source: Vehicle Dataset row U003.
  {
    "vehicle_id": "VEH003",
    "user_id": "U003",
    "vehicle_type": "Car",
    "brand": "Hyundai",
    "model": "Accent",
    "year": 2020,
    "fuel_type": "Gasoline",
    "license_plate_masked": "43A-***.45",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-07-30",
    "civil_liability_expiry": "2026-07-25",
    "registration_expiry": "2028-10-12",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 6,
    "risk_notes": "Cả đăng kiểm và bảo hiểm sắp hết hạn"
  },
  // Source: Vehicle Dataset row U004.
  {
    "vehicle_id": "VEH004",
    "user_id": "U004",
    "vehicle_type": "Car",
    "brand": "Ford",
    "model": "Everest",
    "year": 2018,
    "fuel_type": "Diesel",
    "license_plate_masked": "15A-***.09",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-12-12",
    "civil_liability_expiry": "2026-10-01",
    "registration_expiry": "2028-05-09",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 8,
    "risk_notes": "Xe đi công tác nhiều"
  },
  // Source: Vehicle Dataset row U005.
  {
    "vehicle_id": "VEH005",
    "user_id": "U005",
    "vehicle_type": "Car",
    "brand": "Kia",
    "model": "Morning",
    "year": 2022,
    "fuel_type": "Gasoline",
    "license_plate_masked": "30K-***.19",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-03-11",
    "civil_liability_expiry": "2026-08-30",
    "registration_expiry": "2031-04-22",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 4,
    "risk_notes": "Người dùng mới, cần hướng dẫn giấy tờ"
  },
  // Source: Vehicle Dataset row U006.
  {
    "vehicle_id": "VEH006",
    "user_id": "U006",
    "vehicle_type": "Car",
    "brand": "Honda",
    "model": "City",
    "year": 2017,
    "fuel_type": "Gasoline",
    "license_plate_masked": "51F-***.77",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-08-10",
    "civil_liability_expiry": "2026-08-01",
    "registration_expiry": "2028-02-15",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 9,
    "risk_notes": "Xe cũ, nên xem xét cứu hộ"
  },
  // Source: Vehicle Dataset row U007.
  {
    "vehicle_id": "VEH007",
    "user_id": "U007",
    "vehicle_type": "Car",
    "brand": "Toyota",
    "model": "Corolla Cross",
    "year": 2023,
    "fuel_type": "Hybrid",
    "license_plate_masked": "79A-***.26",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-06-18",
    "civil_liability_expiry": "2027-01-05",
    "registration_expiry": "2032-01-01",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 3,
    "risk_notes": "Đi xa cuối tuần"
  },
  // Source: Vehicle Dataset row U008.
  {
    "vehicle_id": "VEH008",
    "user_id": "U008",
    "vehicle_type": "Car",
    "brand": "Mitsubishi",
    "model": "Xpander",
    "year": 2019,
    "fuel_type": "Gasoline",
    "license_plate_masked": "29A-***.99",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-10-22",
    "civil_liability_expiry": "2026-09-13",
    "registration_expiry": "2028-12-21",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 7,
    "risk_notes": "Quản lý nhiều xe, chưa kích hoạt cứu hộ"
  },
  // Source: Vehicle Dataset row U009.
  {
    "vehicle_id": "VEH009",
    "user_id": "U009",
    "vehicle_type": "Car",
    "brand": "Suzuki",
    "model": "XL7",
    "year": 2020,
    "fuel_type": "Gasoline",
    "license_plate_masked": "49A-***.31",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-11-02",
    "civil_liability_expiry": "2026-10-25",
    "registration_expiry": "2029-03-30",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 6,
    "risk_notes": "Ít mở app"
  },
  // Source: Vehicle Dataset row U010.
  {
    "vehicle_id": "VEH010",
    "user_id": "U010",
    "vehicle_type": "EV",
    "brand": "VinFast",
    "model": "VF 8",
    "year": 2024,
    "fuel_type": "Electric",
    "license_plate_masked": "51E-***.66",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-08-08",
    "civil_liability_expiry": "2027-02-15",
    "registration_expiry": "2032-08-08",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 2,
    "risk_notes": "Xe điện, cần nhắc sạc/bảo dưỡng"
  },
  // Source: Vehicle Dataset row U011.
  {
    "vehicle_id": "VEH011",
    "user_id": "U011",
    "vehicle_type": "Car",
    "brand": "Toyota",
    "model": "Innova",
    "year": 2015,
    "fuel_type": "Gasoline",
    "license_plate_masked": "30E-***.22",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-09-01",
    "civil_liability_expiry": "2026-08-28",
    "registration_expiry": "2027-09-01",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 11,
    "risk_notes": "Xe cũ, rủi ro sự cố cao"
  },
  // Source: Vehicle Dataset row U012.
  {
    "vehicle_id": "VEH012",
    "user_id": "U012",
    "vehicle_type": "Car",
    "brand": "Honda",
    "model": "Civic",
    "year": 2021,
    "fuel_type": "Gasoline",
    "license_plate_masked": "51H-***.41",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-02-05",
    "civil_liability_expiry": "2026-07-18",
    "registration_expiry": "2030-06-02",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 5,
    "risk_notes": "Bảo hiểm sắp hết hạn rất gần"
  },
  // Source: Vehicle Dataset row U013.
  {
    "vehicle_id": "VEH013",
    "user_id": "U013",
    "vehicle_type": "Car",
    "brand": "Ford",
    "model": "Ranger",
    "year": 2018,
    "fuel_type": "Diesel",
    "license_plate_masked": "43C-***.88",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-08-05",
    "civil_liability_expiry": "2026-09-20",
    "registration_expiry": "2028-04-19",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 8,
    "risk_notes": "Đăng kiểm sắp hết hạn"
  },
  // Source: Vehicle Dataset row U014.
  {
    "vehicle_id": "VEH014",
    "user_id": "U014",
    "vehicle_type": "Motorbike",
    "brand": "Honda",
    "model": "SH",
    "year": 2022,
    "fuel_type": "Gasoline",
    "license_plate_masked": "29B1-***.10",
    "ownership_status": "Owner",
    "inspection_expiry": "N/A",
    "civil_liability_expiry": "2026-11-10",
    "registration_expiry": "2031-08-18",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 4,
    "risk_notes": "Cần hướng dẫn khác biệt xe máy/ô tô"
  },
  // Source: Vehicle Dataset row U015.
  {
    "vehicle_id": "VEH015",
    "user_id": "U015",
    "vehicle_type": "Car",
    "brand": "Kia",
    "model": "Sorento",
    "year": 2020,
    "fuel_type": "Gasoline",
    "license_plate_masked": "51K-***.55",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-12-25",
    "civil_liability_expiry": "2026-07-22",
    "registration_expiry": "2029-11-01",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 6,
    "risk_notes": "Bảo hiểm sắp hết hạn"
  },
  // Source: Vehicle Dataset row U016.
  {
    "vehicle_id": "VEH016",
    "user_id": "U016",
    "vehicle_type": "EV",
    "brand": "VinFast",
    "model": "VF e34",
    "year": 2023,
    "fuel_type": "Electric",
    "license_plate_masked": "15E-***.19",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-05-20",
    "civil_liability_expiry": "2026-12-15",
    "registration_expiry": "2032-05-20",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 3,
    "risk_notes": "EV owner"
  },
  // Source: Vehicle Dataset row U017.
  {
    "vehicle_id": "VEH017",
    "user_id": "U017",
    "vehicle_type": "Car",
    "brand": "Toyota",
    "model": "Raize",
    "year": 2024,
    "fuel_type": "Gasoline",
    "license_plate_masked": "43A-***.02",
    "ownership_status": "Owner",
    "inspection_expiry": "2027-09-18",
    "civil_liability_expiry": "2027-01-10",
    "registration_expiry": "2034-01-10",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 2,
    "risk_notes": "Người mới lái"
  },
  // Source: Vehicle Dataset row U018.
  {
    "vehicle_id": "VEH018",
    "user_id": "U018",
    "vehicle_type": "Car",
    "brand": "Mercedes",
    "model": "C200",
    "year": 2019,
    "fuel_type": "Gasoline",
    "license_plate_masked": "30G-***.77",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-08-15",
    "civil_liability_expiry": "2026-08-20",
    "registration_expiry": "2029-01-01",
    "roadside_assistance_status": "Active",
    "vehicle_age_years": 7,
    "risk_notes": "Đăng kiểm và bảo hiểm cùng gần hạn"
  },
  // Source: Vehicle Dataset row U019.
  {
    "vehicle_id": "VEH019",
    "user_id": "U019",
    "vehicle_type": "Car",
    "brand": "Mazda",
    "model": "Mazda 3",
    "year": 2020,
    "fuel_type": "Gasoline",
    "license_plate_masked": "51F-***.03",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-09-25",
    "civil_liability_expiry": "2026-10-02",
    "registration_expiry": "2029-09-25",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 6,
    "risk_notes": "Ít mở app"
  },
  // Source: Vehicle Dataset row U020.
  {
    "vehicle_id": "VEH020",
    "user_id": "U020",
    "vehicle_type": "Car",
    "brand": "Hyundai",
    "model": "Tucson",
    "year": 2018,
    "fuel_type": "Diesel",
    "license_plate_masked": "79A-***.81",
    "ownership_status": "Owner",
    "inspection_expiry": "2026-07-25",
    "civil_liability_expiry": "2026-07-28",
    "registration_expiry": "2028-07-25",
    "roadside_assistance_status": "Inactive",
    "vehicle_age_years": 8,
    "risk_notes": "Cần nhắc gấp đăng kiểm và bảo hiểm"
  }
];

export const p5Documents: P5Document[] = [
  // Source: Vehicle Documents row VEH001.
  {
    "document_id": "DOC001",
    "vehicle_id": "VEH001",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-07-20",
    "expiry_date": "2026-07-20",
    "uploaded": "Yes",
    "notes": "Sắp hết hạn"
  },
  // Source: Vehicle Documents row VEH001.
  {
    "document_id": "DOC002",
    "vehicle_id": "VEH001",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS",
    "status": "Valid",
    "issue_date": "2025-08-15",
    "expiry_date": "2026-08-15",
    "uploaded": "Yes",
    "notes": "Sắp hết hạn"
  },
  // Source: Vehicle Documents row VEH001.
  {
    "document_id": "DOC003",
    "vehicle_id": "VEH001",
    "document_type": "Registration",
    "document_name": "Đăng ký xe",
    "status": "Valid",
    "issue_date": "2019-01-10",
    "expiry_date": "2029-01-10",
    "uploaded": "Yes",
    "notes": ""
  },
  // Source: Vehicle Documents row VEH003.
  {
    "document_id": "DOC004",
    "vehicle_id": "VEH003",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-07-30",
    "expiry_date": "2026-07-30",
    "uploaded": "No",
    "notes": "Chưa upload bản scan"
  },
  // Source: Vehicle Documents row VEH003.
  {
    "document_id": "DOC005",
    "vehicle_id": "VEH003",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS",
    "status": "Valid",
    "issue_date": "2025-07-25",
    "expiry_date": "2026-07-25",
    "uploaded": "Yes",
    "notes": "Cần nhắc gia hạn"
  },
  // Source: Vehicle Documents row VEH006.
  {
    "document_id": "DOC006",
    "vehicle_id": "VEH006",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-08-10",
    "expiry_date": "2026-08-10",
    "uploaded": "Yes",
    "notes": "Xe cũ"
  },
  // Source: Vehicle Documents row VEH006.
  {
    "document_id": "DOC007",
    "vehicle_id": "VEH006",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS",
    "status": "Valid",
    "issue_date": "2025-08-01",
    "expiry_date": "2026-08-01",
    "uploaded": "No",
    "notes": "Thiếu bản upload"
  },
  // Source: Vehicle Documents row VEH010.
  {
    "document_id": "DOC008",
    "vehicle_id": "VEH010",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-08-08",
    "expiry_date": "2027-08-08",
    "uploaded": "Yes",
    "notes": "EV"
  },
  // Source: Vehicle Documents row VEH012.
  {
    "document_id": "DOC009",
    "vehicle_id": "VEH012",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS",
    "status": "Valid",
    "issue_date": "2025-07-18",
    "expiry_date": "2026-07-18",
    "uploaded": "Yes",
    "notes": "Sắp hết hạn rất gần"
  },
  // Source: Vehicle Documents row VEH013.
  {
    "document_id": "DOC010",
    "vehicle_id": "VEH013",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-08-05",
    "expiry_date": "2026-08-05",
    "uploaded": "Yes",
    "notes": "Sắp hết hạn"
  },
  // Source: Vehicle Documents row VEH014.
  {
    "document_id": "DOC011",
    "vehicle_id": "VEH014",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS xe máy",
    "status": "Valid",
    "issue_date": "2025-11-10",
    "expiry_date": "2026-11-10",
    "uploaded": "No",
    "notes": "Chưa upload"
  },
  // Source: Vehicle Documents row VEH018.
  {
    "document_id": "DOC012",
    "vehicle_id": "VEH018",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-08-15",
    "expiry_date": "2026-08-15",
    "uploaded": "Yes",
    "notes": "Sắp hết hạn"
  },
  // Source: Vehicle Documents row VEH018.
  {
    "document_id": "DOC013",
    "vehicle_id": "VEH018",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS",
    "status": "Valid",
    "issue_date": "2025-08-20",
    "expiry_date": "2026-08-20",
    "uploaded": "Yes",
    "notes": "Sắp hết hạn"
  },
  // Source: Vehicle Documents row VEH020.
  {
    "document_id": "DOC014",
    "vehicle_id": "VEH020",
    "document_type": "Inspection",
    "document_name": "Giấy chứng nhận đăng kiểm",
    "status": "Valid",
    "issue_date": "2025-07-25",
    "expiry_date": "2026-07-25",
    "uploaded": "No",
    "notes": "Cần upload và nhắc gấp"
  },
  // Source: Vehicle Documents row VEH020.
  {
    "document_id": "DOC015",
    "vehicle_id": "VEH020",
    "document_type": "Insurance",
    "document_name": "Bảo hiểm TNDS",
    "status": "Valid",
    "issue_date": "2025-07-28",
    "expiry_date": "2026-07-28",
    "uploaded": "Yes",
    "notes": "Cần nhắc gấp"
  }
];

export const p5Knowledge: P5Knowledge[] = [
  // Source: Knowledge Dataset row K001.
  {
    "knowledge_id": "K001",
    "topic": "Đăng kiểm",
    "question": "Khi nào cần đăng kiểm xe?",
    "answer": "Người dùng cần theo dõi hạn đăng kiểm trên giấy chứng nhận đăng kiểm. Nên đặt nhắc trước 30 ngày, 14 ngày và 3 ngày để chuẩn bị hồ sơ.",
    "related_documents": "Giấy chứng nhận đăng kiểm",
    "recommended_action": "Tạo reminder trước hạn"
  },
  // Source: Knowledge Dataset row K002.
  {
    "knowledge_id": "K002",
    "topic": "Đăng kiểm",
    "question": "Cần chuẩn bị giấy tờ gì khi đi đăng kiểm?",
    "answer": "Thông thường cần giấy đăng ký xe, giấy chứng nhận đăng kiểm cũ, bảo hiểm TNDS còn hiệu lực và giấy tờ tùy thân/chủ xe khi cần.",
    "related_documents": "Registration, Inspection, Insurance",
    "recommended_action": "Hiển thị checklist giấy tờ"
  },
  // Source: Knowledge Dataset row K003.
  {
    "knowledge_id": "K003",
    "topic": "Bảo hiểm TNDS",
    "question": "Bảo hiểm Trách nhiệm Dân sự có bắt buộc không?",
    "answer": "Bảo hiểm TNDS là loại bảo hiểm bắt buộc với chủ phương tiện cơ giới theo quy định hiện hành.",
    "related_documents": "Insurance",
    "recommended_action": "Nhắc gia hạn trước khi hết hạn"
  },
  // Source: Knowledge Dataset row K004.
  {
    "knowledge_id": "K004",
    "topic": "Bảo hiểm TNDS",
    "question": "Khi bảo hiểm sắp hết hạn nên làm gì?",
    "answer": "Người dùng nên kiểm tra ngày hết hạn, xem gói gia hạn phù hợp và hoàn tất gia hạn trước hạn để tránh gián đoạn bảo vệ.",
    "related_documents": "Insurance",
    "recommended_action": "Đề xuất gia hạn"
  },
  // Source: Knowledge Dataset row K005.
  {
    "knowledge_id": "K005",
    "topic": "Đăng ký xe",
    "question": "Đăng ký xe có cần lưu trong ví giấy tờ không?",
    "answer": "Nên lưu bản số hóa của đăng ký xe để dễ tra cứu, nhưng vẫn cần tuân thủ yêu cầu giấy tờ gốc/bản hợp lệ khi tham gia giao thông theo quy định.",
    "related_documents": "Registration",
    "recommended_action": "Upload document"
  },
  // Source: Knowledge Dataset row K006.
  {
    "knowledge_id": "K006",
    "topic": "Cứu hộ",
    "question": "Khi nào nên kích hoạt Cứu hộ giao thông?",
    "answer": "Người dùng có xe cũ, thường đi xa hoặc chưa có phương án hỗ trợ khẩn cấp nên cân nhắc kích hoạt dịch vụ cứu hộ.",
    "related_documents": "Roadside Assistance",
    "recommended_action": "Gợi ý Roadside Assistance"
  },
  // Source: Knowledge Dataset row K007.
  {
    "knowledge_id": "K007",
    "topic": "Xe điện",
    "question": "Chủ xe điện cần theo dõi gì?",
    "answer": "Ngoài giấy tờ thông thường, chủ xe điện nên theo dõi lịch bảo dưỡng, tình trạng pin và điểm sạc phù hợp theo lộ trình.",
    "related_documents": "EV, Maintenance",
    "recommended_action": "Gợi ý dịch vụ sạc/bảo dưỡng EV"
  },
  // Source: Knowledge Dataset row K008.
  {
    "knowledge_id": "K008",
    "topic": "Nhắc nhở",
    "question": "Nên gửi nhắc nhở khi nào?",
    "answer": "Nhắc nhở nên được gửi theo mức độ khẩn cấp: 30 ngày, 14 ngày, 7 ngày và 3 ngày trước hạn; tránh gửi quá nhiều thông báo không cần thiết.",
    "related_documents": "Reminder",
    "recommended_action": "Notification schedule"
  },
  // Source: Knowledge Dataset row K009.
  {
    "knowledge_id": "K009",
    "topic": "Quản lý giấy tờ",
    "question": "Nếu thiếu bản upload giấy tờ thì AI nên làm gì?",
    "answer": "AI nên thông báo tài liệu còn thiếu, giải thích lợi ích của việc lưu bản số hóa và hướng dẫn người dùng upload.",
    "related_documents": "Document Management",
    "recommended_action": "Prompt upload"
  },
  // Source: Knowledge Dataset row K010.
  {
    "knowledge_id": "K010",
    "topic": "Dịch vụ VETC",
    "question": "Khi nào nên đề xuất dịch vụ VETC?",
    "answer": "Chỉ đề xuất dịch vụ khi phù hợp với ngữ cảnh người dùng, ví dụ bảo hiểm sắp hết hạn, xe cũ cần cứu hộ, EV cần sạc hoặc người dùng đi xa thường xuyên.",
    "related_documents": "Service Recommendation",
    "recommended_action": "Contextual recommendation"
  },
  // Source: Knowledge Dataset row K011.
  {
    "knowledge_id": "K011",
    "topic": "Xe máy",
    "question": "Xe máy có khác ô tô trong quản lý giấy tờ không?",
    "answer": "Xe máy có thể không có quy trình đăng kiểm giống ô tô nhưng vẫn cần quản lý đăng ký xe và bảo hiểm TNDS nếu áp dụng.",
    "related_documents": "Motorbike documents",
    "recommended_action": "Hướng dẫn theo loại xe"
  },
  // Source: Knowledge Dataset row K012.
  {
    "knowledge_id": "K012",
    "topic": "Chủ động hỗ trợ",
    "question": "AI Assistant nên chủ động hỗ trợ như thế nào?",
    "answer": "Trợ lý nên phát hiện mốc thời gian quan trọng, đưa checklist, tạo reminder và đề xuất bước tiếp theo thay vì chỉ trả lời câu hỏi.",
    "related_documents": "Proactive AI",
    "recommended_action": "Next best action"
  }
];

export const p5Services: P5Service[] = [
  // Source: VETC Services row SVC001.
  {
    "service_id": "SVC001",
    "service_name": "Civil Liability Insurance Renewal",
    "category": "Insurance",
    "description": "Gia hạn bảo hiểm TNDS",
    "context_to_recommend": "Bảo hiểm sắp hết hạn hoặc thiếu bản upload",
    "mock_integration": "Insurance API"
  },
  // Source: VETC Services row SVC002.
  {
    "service_id": "SVC002",
    "service_name": "Roadside Assistance",
    "category": "Safety",
    "description": "Cứu hộ giao thông",
    "context_to_recommend": "Xe trên 7 năm, đi xa nhiều, chưa kích hoạt cứu hộ",
    "mock_integration": "Service Activation API"
  },
  // Source: VETC Services row SVC003.
  {
    "service_id": "SVC003",
    "service_name": "Inspection Reminder",
    "category": "Reminder",
    "description": "Nhắc đăng kiểm",
    "context_to_recommend": "Đăng kiểm còn dưới 30 ngày",
    "mock_integration": "Reminder API"
  },
  // Source: VETC Services row SVC004.
  {
    "service_id": "SVC004",
    "service_name": "Document Wallet",
    "category": "Document",
    "description": "Lưu trữ giấy tờ xe số hóa",
    "context_to_recommend": "Thiếu bản upload hoặc người dùng muốn quản lý giấy tờ",
    "mock_integration": "Document API"
  },
  // Source: VETC Services row SVC005.
  {
    "service_id": "SVC005",
    "service_name": "EV Charging Partner",
    "category": "EV",
    "description": "Tìm/đặt lịch trạm sạc EV",
    "context_to_recommend": "Người dùng sở hữu xe điện",
    "mock_integration": "Partner API"
  },
  // Source: VETC Services row SVC006.
  {
    "service_id": "SVC006",
    "service_name": "Vehicle Maintenance Partner",
    "category": "Maintenance",
    "description": "Gợi ý bảo dưỡng xe",
    "context_to_recommend": "Xe cũ hoặc đi nhiều",
    "mock_integration": "Partner API"
  },
  // Source: VETC Services row SVC007.
  {
    "service_id": "SVC007",
    "service_name": "Notification Service",
    "category": "Platform",
    "description": "Gửi nhắc nhở cá nhân hóa",
    "context_to_recommend": "Có deadline quan trọng",
    "mock_integration": "Notification API"
  },
  // Source: VETC Services row SVC008.
  {
    "service_id": "SVC008",
    "service_name": "VETC Wallet",
    "category": "Payment",
    "description": "Thanh toán dịch vụ trong hệ sinh thái",
    "context_to_recommend": "Gia hạn, kích hoạt dịch vụ, đặt lịch",
    "mock_integration": "Wallet API"
  }
];

export const p5MockApis: P5MockApi[] = [
  // Source: Mock APIs row User Profile.
  {
    "api_name": "User Profile",
    "method": "GET",
    "endpoint": "/mock/users/{user_id}",
    "purpose": "Lấy hồ sơ người dùng",
    "sample_response": "{\"user_id\":\"U001\",\"segment\":\"Daily commuter\"}"
  },
  // Source: Mock APIs row Vehicle Info.
  {
    "api_name": "Vehicle Info",
    "method": "GET",
    "endpoint": "/mock/vehicles/{vehicle_id}",
    "purpose": "Lấy thông tin phương tiện",
    "sample_response": "{\"vehicle_id\":\"VEH001\",\"inspection_expiry\":\"2026-07-20\"}"
  },
  // Source: Mock APIs row Documents.
  {
    "api_name": "Documents",
    "method": "GET",
    "endpoint": "/mock/documents/{vehicle_id}",
    "purpose": "Lấy danh sách giấy tờ xe",
    "sample_response": "{\"documents\":[\"Inspection\",\"Insurance\",\"Registration\"]}"
  },
  // Source: Mock APIs row Create Reminder.
  {
    "api_name": "Create Reminder",
    "method": "POST",
    "endpoint": "/mock/reminders",
    "purpose": "Tạo nhắc nhở",
    "sample_response": "{\"status\":\"created\",\"reminder_id\":\"REM001\"}"
  },
  // Source: Mock APIs row Notification.
  {
    "api_name": "Notification",
    "method": "POST",
    "endpoint": "/mock/notifications/send",
    "purpose": "Gửi thông báo mô phỏng",
    "sample_response": "{\"status\":\"sent\"}"
  },
  // Source: Mock APIs row Insurance Renewal.
  {
    "api_name": "Insurance Renewal",
    "method": "POST",
    "endpoint": "/mock/insurance/renew",
    "purpose": "Mô phỏng gia hạn bảo hiểm",
    "sample_response": "{\"status\":\"success\",\"policy_id\":\"POL001\"}"
  },
  // Source: Mock APIs row Roadside Activation.
  {
    "api_name": "Roadside Activation",
    "method": "POST",
    "endpoint": "/mock/roadside/activate",
    "purpose": "Mô phỏng kích hoạt cứu hộ",
    "sample_response": "{\"status\":\"activated\"}"
  },
  // Source: Mock APIs row Document Upload.
  {
    "api_name": "Document Upload",
    "method": "POST",
    "endpoint": "/mock/documents/upload",
    "purpose": "Mô phỏng upload giấy tờ",
    "sample_response": "{\"status\":\"uploaded\",\"document_id\":\"DOC999\"}"
  },
  // Source: Mock APIs row Knowledge Search.
  {
    "api_name": "Knowledge Search",
    "method": "GET",
    "endpoint": "/mock/knowledge/search?q=",
    "purpose": "Tra cứu tri thức thủ tục",
    "sample_response": "{\"answer\":\"Cần chuẩn bị đăng ký xe, đăng kiểm cũ, bảo hiểm TNDS...\"}"
  },
  // Source: Mock APIs row Wallet Payment.
  {
    "api_name": "Wallet Payment",
    "method": "POST",
    "endpoint": "/mock/wallet/pay",
    "purpose": "Mô phỏng thanh toán",
    "sample_response": "{\"payment_status\":\"success\"}"
  }
];

export const p5UserById = new Map(p5Users.map((user) => [user.user_id, user]));
export const p5VehicleById = new Map(p5Vehicles.map((vehicle) => [vehicle.vehicle_id, vehicle]));
export const p5DocumentsByVehicleId = new Map<string, P5Document[]>();
for (const document of p5Documents) {
  const bucket = p5DocumentsByVehicleId.get(document.vehicle_id) ?? [];
  bucket.push(document);
  p5DocumentsByVehicleId.set(document.vehicle_id, bucket);
}
export const p5KnowledgeById = new Map(p5Knowledge.map((knowledge) => [knowledge.knowledge_id, knowledge]));
export const p5ServiceById = new Map(p5Services.map((service) => [service.service_id, service]));
export const p5MockApiByName = new Map(p5MockApis.map((api) => [api.api_name, api]));
export const p5MockApiByEndpoint = new Map(p5MockApis.map((api) => [api.endpoint, api]));

export const syntheticCorpus: CorpusUnit[] = [
  ...p5Users.map((user) => ({
    id: user.user_id,
    source: "P5_XLSM:User Profiles",
    text: `${user.user_name} segment=${user.user_segment} concerns=${user.main_concerns}`,
    facts: [
      `user_id=${user.user_id}`,
      `primary_vehicle_id=${user.primary_vehicle_id}`,
      `city=${user.city}`,
      `preferred_channel=${user.preferred_channel}`
    ],
    keywords: [user.user_id, user.user_segment, user.main_concerns, user.city]
  })),
  ...p5Vehicles.map((vehicle) => ({
    id: vehicle.vehicle_id,
    source: "P5_XLSM:Vehicle Dataset",
    text: `${vehicle.vehicle_id} ${vehicle.brand} ${vehicle.model} ${vehicle.vehicle_type} inspection=${vehicle.inspection_expiry} civil=${vehicle.civil_liability_expiry}`,
    facts: [
      `vehicle_id=${vehicle.vehicle_id}`,
      `user_id=${vehicle.user_id}`,
      `inspection_expiry=${vehicle.inspection_expiry}`,
      `civil_liability_expiry=${vehicle.civil_liability_expiry}`,
      `registration_expiry=${vehicle.registration_expiry}`,
      `roadside_assistance_status=${vehicle.roadside_assistance_status}`
    ],
    keywords: [vehicle.vehicle_id, vehicle.vehicle_type, vehicle.brand, vehicle.model, vehicle.risk_notes]
  })),
  ...p5Documents.map((document) => ({
    id: document.document_id,
    source: "P5_XLSM:Vehicle Documents",
    text: `${document.document_name} for ${document.vehicle_id}, uploaded=${document.uploaded}, notes=${document.notes}`,
    facts: [
      `document_id=${document.document_id}`,
      `vehicle_id=${document.vehicle_id}`,
      `document_type=${document.document_type}`,
      `uploaded=${document.uploaded}`
    ],
    keywords: [document.document_id, document.vehicle_id, document.document_type, document.document_name, document.notes]
  })),
  ...p5Knowledge.map((knowledge) => ({
    id: knowledge.knowledge_id,
    source: "P5_XLSM:Knowledge Dataset",
    text: knowledge.answer,
    facts: [
      `knowledge_id=${knowledge.knowledge_id}`,
      `topic=${knowledge.topic}`,
      `related_documents=${knowledge.related_documents}`,
      `recommended_action=${knowledge.recommended_action}`
    ],
    keywords: [knowledge.knowledge_id, knowledge.topic, knowledge.question, knowledge.related_documents]
  })),
  ...p5Services.map((service) => ({
    id: service.service_id,
    source: "P5_XLSM:VETC Services",
    text: `${service.service_name}: ${service.description}. Context: ${service.context_to_recommend}`,
    facts: [
      `service_id=${service.service_id}`,
      `category=${service.category}`,
      `mock_integration=${service.mock_integration}`
    ],
    keywords: [service.service_id, service.service_name, service.category, service.context_to_recommend]
  })),
  ...p5MockApis.map((api) => ({
    id: api.api_name,
    source: "P5_XLSM:Mock APIs",
    text: `${api.method} ${api.endpoint}: ${api.purpose}`,
    facts: [
      `api_name=${api.api_name}`,
      `method=${api.method}`,
      `endpoint=${api.endpoint}`
    ],
    keywords: [api.api_name, api.endpoint, api.purpose]
  }))
];
