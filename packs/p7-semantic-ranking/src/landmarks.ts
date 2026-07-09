export interface P7LandmarkAlias {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly city?: string;
  readonly district?: string;
  readonly lat?: number;
  readonly lon?: number;
  readonly provenance: string;
}

export const p7LandmarkAliases: readonly P7LandmarkAlias[] = [
  {
    name: "Hồ Gươm",
    aliases: ["hồ gươm", "ho guom", "hoan kiem lake", "hoàn kiếm lake"],
    city: "Hà Nội",
    district: "Hoàn Kiếm",
    lat: 21.0287,
    lon: 105.8521,
    provenance: "API PDF nearby-search example page 8 plus workbook rows C003/S002"
  },
  {
    name: "Hoàn Kiếm",
    aliases: ["hoàn kiếm", "hoan kiem"],
    city: "Hà Nội",
    district: "Hoàn Kiếm",
    provenance: "workbook POI_Dataset district rows C003/C004/R001/S002"
  },
  {
    name: "Quận 1",
    aliases: ["quận 1", "quan 1", "q1", "district 1"],
    city: "TP.HCM",
    district: "Quận 1",
    provenance: "workbook POI_Dataset district rows C001/C002/R002/R008/H005/M001"
  },
  {
    name: "Quận 3",
    aliases: ["quận 3", "quan 3", "q3", "district 3"],
    city: "TP.HCM",
    district: "Quận 3",
    provenance: "workbook POI_Dataset district row R007"
  },
  {
    name: "Nguyễn Huệ",
    aliases: ["nguyễn huệ", "nguyen hue", "phố đi bộ nguyễn huệ", "pho di bo nguyen hue"],
    city: "TP.HCM",
    district: "Quận 1",
    lat: 10.7752,
    lon: 106.7035,
    provenance: "workbook POI_Dataset rows C002/S001"
  },
  {
    name: "Chợ Bến Thành",
    aliases: ["chợ bến thành", "cho ben thanh", "bến thành", "ben thanh"],
    city: "TP.HCM",
    district: "Quận 1",
    provenance: "workbook POI_Dataset row H005 attributes/tags"
  },
  {
    name: "Bãi biển Mỹ Khê",
    aliases: ["biển đà nẵng", "bien da nang", "da nang beach", "mỹ khê", "my khe", "biển mỹ khê", "beach da nang"],
    city: "Đà Nẵng",
    district: "Sơn Trà",
    lat: 16.0617,
    lon: 108.247,
    provenance: "workbook POI_Dataset beach rows H001/R005 plus API search facade location parameters"
  },
  {
    name: "Sông Hàn",
    aliases: ["sông hàn", "song han", "han river"],
    city: "Đà Nẵng",
    district: "Hải Châu",
    lat: 16.071,
    lon: 108.223,
    provenance: "workbook POI_Dataset row C005"
  },
  {
    name: "Duy Tân",
    aliases: ["duy tân", "duy tan"],
    city: "Hà Nội",
    district: "Cầu Giấy",
    lat: 21.0304,
    lon: 105.7871,
    provenance: "workbook POI_Dataset rows C007/H003"
  },
  {
    name: "Cầu Giấy",
    aliases: ["cầu giấy", "cau giay"],
    city: "Hà Nội",
    district: "Cầu Giấy",
    provenance: "workbook POI_Dataset district rows C007/H003/S003"
  },
  {
    name: "Hồ Xuân Hương",
    aliases: ["hồ xuân hương", "ho xuan huong", "xuân hương", "xuan huong"],
    city: "Đà Lạt",
    district: "Phường 1",
    provenance: "workbook POI_Dataset row A004 attributes"
  },
  {
    name: "Đà Lạt",
    aliases: ["đà lạt", "da lat", "dalat"],
    city: "Đà Lạt",
    provenance: "workbook POI_Dataset city rows C006/R009/H004/A004"
  },
  {
    name: "Đà Nẵng",
    aliases: ["đà nẵng", "da nang", "danang"],
    city: "Đà Nẵng",
    provenance: "workbook POI_Dataset city rows H001/H002/R005/C005/S004"
  },
  {
    name: "Hà Nội",
    aliases: ["hà nội", "ha noi", "hanoi"],
    city: "Hà Nội",
    provenance: "workbook POI_Dataset city rows C003/C004/R001/A005"
  },
  {
    name: "Sài Gòn",
    aliases: ["sài gòn", "sai gon", "saigon", "tp.hcm", "tp hcm", "hồ chí minh", "ho chi minh"],
    city: "TP.HCM",
    provenance: "workbook POI_Dataset city rows C001/R002/A001/M001"
  },
  {
    name: "Tây Hồ",
    aliases: ["tây hồ", "tay ho"],
    city: "Hà Nội",
    district: "Tây Hồ",
    provenance: "workbook POI_Dataset district row R010"
  },
  {
    name: "Ba Đình",
    aliases: ["ba đình", "ba dinh"],
    city: "Hà Nội",
    district: "Ba Đình",
    provenance: "workbook POI_Dataset district row A005"
  },
  {
    name: "Bình Thạnh",
    aliases: ["bình thạnh", "binh thanh"],
    city: "TP.HCM",
    district: "Bình Thạnh",
    provenance: "workbook POI_Dataset district row S006"
  },
  {
    name: "Thủ Đức",
    aliases: ["thủ đức", "thu duc"],
    city: "TP.HCM",
    district: "Thủ Đức",
    provenance: "workbook POI_Dataset district row C008"
  }
];
