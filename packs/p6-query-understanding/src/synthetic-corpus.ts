import type { CorpusUnit } from "@cael/os-light";

export interface SyntheticPoi {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  district?: string;
  ward?: string;
  street?: string;
  keywords: string[];
}

export const syntheticPois: SyntheticPoi[] = [
  {
    id: "SYN-POI-LOTUS-CAFE",
    name: "SYN-POI Lotus Cafe",
    category: "coffee_shop",
    aliases: ["lotus cafe", "cafe hoa sen"],
    district: "quan 1",
    ward: "ben nghe",
    street: "nguyen hue",
    keywords: ["cafe", "coffee", "nearby", "district:quan 1"]
  },
  {
    id: "SYN-POI-LOTUS-MARKET",
    name: "SYN-POI Lotus Market",
    category: "grocery",
    aliases: ["lotus market", "cho hoa sen"],
    district: "quan 1",
    ward: "ben nghe",
    street: "le thanh ton",
    keywords: ["market", "grocery", "lotus", "district:quan 1"]
  },
  {
    id: "SYN-POI-HOA-SEN-HOSPITAL",
    name: "SYN-POI Benh Vien Hoa Sen",
    category: "hospital",
    aliases: ["benh vien hoa sen", "phong kham hoa sen"],
    district: "quan 3",
    street: "cao thang",
    keywords: ["hospital", "clinic", "district:quan 3"]
  },
  {
    id: "SYN-POI-RIVER-MALL",
    name: "SYN-POI River Mall",
    category: "shopping_mall",
    aliases: ["river mall", "trung tam thuong mai river"],
    district: "quan 1",
    street: "ham nghi",
    keywords: ["mall", "shopping", "district:quan 1"]
  },
  {
    id: "SYN-POI-EAST-GATE-ATM",
    name: "SYN-POI East Gate ATM",
    category: "bank",
    aliases: ["east gate atm", "atm east gate"],
    district: "quan 5",
    street: "nguyen trai",
    keywords: ["atm", "bank", "cash"]
  },
  {
    id: "SYN-POI-NAM-RESTAURANT",
    name: "SYN-POI Nam Restaurant",
    category: "restaurant",
    aliases: ["nha hang nam", "quan an nam"],
    district: "quan 3",
    street: "vo van tan",
    keywords: ["restaurant", "food", "district:quan 3"]
  },
  {
    id: "SYN-POI-GREEN-FUEL",
    name: "SYN-POI Green Fuel",
    category: "fuel_station",
    aliases: ["cay xang xanh", "tram xang xanh"],
    district: "quan 2",
    street: "mai chi tho",
    keywords: ["fuel", "gas", "district:quan 2"]
  }
];

export const syntheticCorpus: CorpusUnit[] = syntheticPois.map((poi) => ({
  id: poi.id,
  source: "p6-synthetic-poi",
  text: `${poi.name} is a synthetic ${poi.category} point of interest.`,
  facts: [
    `id=${poi.id}`,
    `name=${poi.name}`,
    `category=${poi.category}`,
    ...(poi.district ? [`district=${poi.district}`] : []),
    ...(poi.ward ? [`ward=${poi.ward}`] : []),
    ...(poi.street ? [`street=${poi.street}`] : [])
  ],
  keywords: [poi.category, ...poi.aliases, ...poi.keywords]
}));

export const syntheticPoiById = new Map(syntheticPois.map((poi) => [poi.id, poi]));

