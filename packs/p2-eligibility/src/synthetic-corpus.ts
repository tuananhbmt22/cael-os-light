import type { CorpusUnit } from "@cael/os-light";
import {
  ACTIVE_STATUS,
  BANK_LINK_LABEL,
  CIVIL_LIABILITY_LABEL,
  DOCUMENT_WALLET_LABEL,
  FALLBACK_LABEL,
  INSURANCE_STATUS_NEEDS_ACTION,
  MONTHLY_PASS_LABEL,
  ROAD_ASSISTANCE_LABEL
} from "./eligibility-rule-set.js";
import type { P2State, P2UserState, P2VehicleState } from "./p2-recommend.js";

export const syntheticUsers: P2UserState[] = [
  { user_id: "SYN-HEALTHY", wallet_status: ACTIVE_STATUS, monthly_toll_transactions: 8 },
  { user_id: "SYN-ALL-SIGNALS", wallet_status: "Chưa kích hoạt", monthly_toll_transactions: 35 },
  { user_id: "SYN-COUPLING", wallet_status: ACTIVE_STATUS, monthly_toll_transactions: 4 },
  { user_id: "SYN-REGISTRATION", wallet_status: ACTIVE_STATUS, monthly_toll_transactions: 4 },
  { user_id: "SYN-MONTHLY", wallet_status: ACTIVE_STATUS, monthly_toll_transactions: 31 },
  { user_id: "SYN-BANK", wallet_status: "Chưa kích hoạt", monthly_toll_transactions: 4 }
];

export const syntheticVehicles: P2VehicleState[] = [
  {
    vehicle_id: "SYN-V-HEALTHY",
    user_id: "SYN-HEALTHY",
    vehicle_age_years: 1,
    insurance_days_left: 180,
    inspection_days_left: 120,
    registration_days_left: 120,
    roadside_status: ACTIVE_STATUS,
    civil_liability_status: ACTIVE_STATUS,
    frequent_route: ""
  },
  {
    vehicle_id: "SYN-V-ALL",
    user_id: "SYN-ALL-SIGNALS",
    vehicle_age_years: 5,
    insurance_days_left: 12,
    inspection_days_left: 20,
    registration_days_left: 20,
    roadside_status: "Chưa kích hoạt",
    civil_liability_status: INSURANCE_STATUS_NEEDS_ACTION[0],
    frequent_route: "synthetic-corridor-a"
  },
  {
    vehicle_id: "SYN-V-OLD-ACTIVE",
    user_id: "SYN-COUPLING",
    vehicle_age_years: 5,
    insurance_days_left: 180,
    inspection_days_left: 120,
    registration_days_left: 120,
    roadside_status: ACTIVE_STATUS,
    civil_liability_status: ACTIVE_STATUS,
    frequent_route: ""
  },
  {
    vehicle_id: "SYN-V-YOUNG-INACTIVE",
    user_id: "SYN-COUPLING",
    vehicle_age_years: 1,
    insurance_days_left: 180,
    inspection_days_left: 120,
    registration_days_left: 120,
    roadside_status: "Chưa kích hoạt",
    civil_liability_status: ACTIVE_STATUS,
    frequent_route: ""
  },
  {
    vehicle_id: "SYN-V-REG",
    user_id: "SYN-REGISTRATION",
    vehicle_age_years: 1,
    insurance_days_left: 180,
    inspection_days_left: 90,
    registration_days_left: 45,
    roadside_status: ACTIVE_STATUS,
    civil_liability_status: ACTIVE_STATUS,
    frequent_route: ""
  },
  {
    vehicle_id: "SYN-V-MONTHLY",
    user_id: "SYN-MONTHLY",
    vehicle_age_years: 1,
    insurance_days_left: 180,
    inspection_days_left: 120,
    registration_days_left: 120,
    roadside_status: ACTIVE_STATUS,
    civil_liability_status: ACTIVE_STATUS,
    frequent_route: "synthetic-corridor-b"
  },
  {
    vehicle_id: "SYN-V-BANK",
    user_id: "SYN-BANK",
    vehicle_age_years: 1,
    insurance_days_left: 180,
    inspection_days_left: 120,
    registration_days_left: 120,
    roadside_status: ACTIVE_STATUS,
    civil_liability_status: ACTIVE_STATUS,
    frequent_route: ""
  }
];

export const syntheticEligibilityUnits: CorpusUnit[] = [
  {
    id: "SYN-P2-RULES",
    source: "synthetic-p2-eligibility-rules",
    facts: [
      "P2 recommendations are ranked by eligibility signals over user and vehicle state.",
      "Fallback is returned when no eligibility rule fires."
    ],
    keywords: ["eligibility", "recommendation", "fallback"]
  }
];

export const syntheticScenarios = [
  {
    case_id: "SYN-P2-HEALTHY",
    user_id: "SYN-HEALTHY",
    question: "What should this user see next?",
    recommendation: [FALLBACK_LABEL]
  },
  {
    case_id: "SYN-P2-CAP",
    user_id: "SYN-ALL-SIGNALS",
    question: "Recommend the strongest actions.",
    recommendation: [ROAD_ASSISTANCE_LABEL, CIVIL_LIABILITY_LABEL, DOCUMENT_WALLET_LABEL]
  },
  {
    case_id: "SYN-P2-COUPLING",
    user_id: "SYN-COUPLING",
    question: "Check roadside status.",
    recommendation: [FALLBACK_LABEL]
  },
  {
    case_id: "SYN-P2-REGISTRATION",
    user_id: "SYN-REGISTRATION",
    question: "What deadline support applies?",
    recommendation: [DOCUMENT_WALLET_LABEL]
  },
  {
    case_id: "SYN-P2-MONTHLY",
    user_id: "SYN-MONTHLY",
    question: "What toll product applies?",
    recommendation: [MONTHLY_PASS_LABEL]
  },
  {
    case_id: "SYN-P2-BANK",
    user_id: "SYN-BANK",
    question: "What wallet action applies?",
    recommendation: [BANK_LINK_LABEL]
  }
];

export function syntheticStateForUser(userId: string): P2State {
  const user = syntheticUsers.find((candidate) => candidate.user_id === userId);
  if (!user) throw new Error(`Unknown synthetic user ${userId}`);
  return {
    user,
    vehicles: syntheticVehicles.filter((vehicle) => vehicle.user_id === userId)
  };
}

