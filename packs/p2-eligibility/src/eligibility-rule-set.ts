import type { EligibilityRuleSetData } from "@cael/os-light";

export const ACTIVE_STATUS = "Đã kích hoạt";
export const INSURANCE_STATUS_NEEDS_ACTION = ["Chưa kích hoạt", "Sắp hết hạn"] as const;

export const ROAD_ASSISTANCE_LABEL = "Cứu hộ giao thông";
export const CIVIL_LIABILITY_LABEL = "Bảo hiểm Trách nhiệm Dân sự";
export const DOCUMENT_WALLET_LABEL = "Ví giấy tờ / Nhắc lịch đăng kiểm";
export const BANK_LINK_LABEL = "Liên kết ngân hàng / Ví VETC";
export const MONTHLY_PASS_LABEL = "Mua vé tháng";
export const FALLBACK_LABEL = "Khám phá dịch vụ VETC / My Loyalty";

export const recommendationRank: Record<string, number> = {
  [ROAD_ASSISTANCE_LABEL]: 1,
  [CIVIL_LIABILITY_LABEL]: 2,
  [DOCUMENT_WALLET_LABEL]: 3,
  [BANK_LINK_LABEL]: 4,
  [MONTHLY_PASS_LABEL]: 5,
  [FALLBACK_LABEL]: 99
};

export const rulePriorityByRecommendation: Record<string, number> = {
  [ROAD_ASSISTANCE_LABEL]: 100,
  [CIVIL_LIABILITY_LABEL]: 90,
  [DOCUMENT_WALLET_LABEL]: 80,
  [BANK_LINK_LABEL]: 70,
  [MONTHLY_PASS_LABEL]: 60,
  [FALLBACK_LABEL]: 10
};

export const eligibilityThresholdIds = {
  vehicleAgeYearsAtLeast: "vehicle_age_years_at_least",
  insuranceDaysLeftBelow: "insurance_days_left_below",
  inspectionDaysLeftBelow: "inspection_days_left_below",
  registrationDaysLeftAtMost: "registration_days_left_at_most",
  monthlyTollTransactionsAtLeast: "monthly_toll_transactions_at_least"
} as const;

export const p2EligibilityRuleSet: EligibilityRuleSetData = {
  archetype: "B",
  cap: 3,
  thresholds: {
    [eligibilityThresholdIds.vehicleAgeYearsAtLeast]: 3,
    [eligibilityThresholdIds.insuranceDaysLeftBelow]: 30,
    [eligibilityThresholdIds.inspectionDaysLeftBelow]: 45,
    [eligibilityThresholdIds.registrationDaysLeftAtMost]: 60,
    [eligibilityThresholdIds.monthlyTollTransactionsAtLeast]: 30
  },
  rules: [
    {
      rule_id: "ROADSIDE",
      recommendation: ROAD_ASSISTANCE_LABEL,
      priority: 100,
      conditions: [
        {
          field: "vehicle_age_years",
          op: "gte",
          value: undefined,
          threshold_id: eligibilityThresholdIds.vehicleAgeYearsAtLeast
        },
        { field: "roadside_status", op: "neq", value: ACTIVE_STATUS, threshold_id: undefined }
      ],
      threshold_refs: [eligibilityThresholdIds.vehicleAgeYearsAtLeast]
    },
    {
      rule_id: "INSURANCE_STATUS",
      recommendation: CIVIL_LIABILITY_LABEL,
      priority: 90,
      conditions: [
        {
          field: "civil_liability_status",
          op: "in",
          value: [...INSURANCE_STATUS_NEEDS_ACTION],
          threshold_id: undefined
        }
      ],
      threshold_refs: undefined
    },
    {
      rule_id: "INSURANCE_DAYS",
      recommendation: CIVIL_LIABILITY_LABEL,
      priority: 90,
      conditions: [
        {
          field: "insurance_days_left",
          op: "lt",
          value: undefined,
          threshold_id: eligibilityThresholdIds.insuranceDaysLeftBelow
        }
      ],
      threshold_refs: [eligibilityThresholdIds.insuranceDaysLeftBelow]
    },
    {
      rule_id: "DOCWALLET_INSP",
      recommendation: DOCUMENT_WALLET_LABEL,
      priority: 80,
      conditions: [
        {
          field: "inspection_days_left",
          op: "lt",
          value: undefined,
          threshold_id: eligibilityThresholdIds.inspectionDaysLeftBelow
        }
      ],
      threshold_refs: [eligibilityThresholdIds.inspectionDaysLeftBelow]
    },
    {
      rule_id: "DOCWALLET_REG",
      recommendation: DOCUMENT_WALLET_LABEL,
      priority: 80,
      conditions: [
        {
          field: "registration_days_left",
          op: "lte",
          value: undefined,
          threshold_id: eligibilityThresholdIds.registrationDaysLeftAtMost
        }
      ],
      threshold_refs: [eligibilityThresholdIds.registrationDaysLeftAtMost]
    },
    {
      rule_id: "BANK",
      recommendation: BANK_LINK_LABEL,
      priority: 70,
      conditions: [{ field: "wallet_status", op: "neq", value: ACTIVE_STATUS, threshold_id: undefined }],
      threshold_refs: undefined
    },
    {
      rule_id: "MONTHLYPASS",
      recommendation: MONTHLY_PASS_LABEL,
      priority: 60,
      conditions: [
        {
          field: "monthly_toll_transactions",
          op: "gte",
          value: undefined,
          threshold_id: eligibilityThresholdIds.monthlyTollTransactionsAtLeast
        },
        { field: "frequent_route_present", op: "truthy", value: undefined, threshold_id: undefined }
      ],
      threshold_refs: [eligibilityThresholdIds.monthlyTollTransactionsAtLeast]
    }
  ],
  fallback: {
    rule_id: "FALLBACK_DISCOVERY_LOYALTY",
    recommendation: FALLBACK_LABEL,
    priority: 10
  }
};

export function canonicalRecommendationOrder(values: string[]): string[] {
  return [...values].sort((left, right) => (recommendationRank[left] ?? 500) - (recommendationRank[right] ?? 500));
}

