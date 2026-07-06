import type { RbacAccessRow, RbacRuleSetData } from "@cael/os-light";

export const ROLES = ["Employee", "Manager", "Director", "Executive"] as const;
export const DEPARTMENTS = ["COMP", "HR", "FIN", "PROD", "ENG", "OPS", "LEGAL", "EXEC"] as const;
export const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"] as const;

export type P1Role = (typeof ROLES)[number];
export type P1Department = (typeof DEPARTMENTS)[number];
export type P1Classification = (typeof CLASSIFICATIONS)[number];
export type P1Permission = "Allow" | "Deny";

export const departmentAliases: Record<string, P1Department> = {
  company: "COMP",
  comp: "COMP",
  hr: "HR",
  "human resources": "HR",
  finance: "FIN",
  fin: "FIN",
  product: "PROD",
  prod: "PROD",
  engineering: "ENG",
  eng: "ENG",
  operations: "OPS",
  ops: "OPS",
  "legal & compliance": "LEGAL",
  legal: "LEGAL",
  "executive office": "EXEC",
  exec: "EXEC"
};

const roleAliases: Record<string, P1Role> = {
  employee: "Employee",
  manager: "Manager",
  director: "Director",
  executive: "Executive"
};

export function canonicalDepartment(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const folded = trimmed.toLocaleLowerCase("en-US");
  return departmentAliases[folded] ?? trimmed.toUpperCase();
}

export function canonicalRole(value: unknown): string {
  if (typeof value !== "string") return "";
  return roleAliases[value.trim().toLocaleLowerCase("en-US")] ?? value.trim();
}

export function canonicalClassification(value: unknown): string {
  if (typeof value !== "string") return "";
  const folded = value.trim().toLocaleLowerCase("en-US");
  if (folded === "public") return "Public";
  if (folded === "internal") return "Internal";
  if (folded === "confidential") return "Confidential";
  if (folded === "restricted" || folded === "privileged") return "Restricted";
  return value.trim();
}

const access: RbacAccessRow[] = [];
for (const role of ROLES) {
  access.push({ role, classification: "Public", allow: true, rule_id: `rbac_public_allow:${role}`, same_dept: undefined });
  access.push({ role, classification: "Internal", allow: true, rule_id: `rbac_internal_allow:${role}`, same_dept: undefined });
}
access.push({ role: "Executive", classification: "Confidential", allow: true, rule_id: "rbac_confidential_executive", same_dept: undefined });
for (const role of ["Employee", "Manager", "Director"] as const) {
  access.push({ role, classification: "Confidential", allow: true, rule_id: `rbac_confidential_same_dept:${role}`, same_dept: true });
  access.push({ role, classification: "Confidential", allow: false, rule_id: `rbac_confidential_cross_dept:${role}`, same_dept: undefined });
}
access.push({ role: "Executive", classification: "Restricted", allow: true, rule_id: "rbac_restricted_executive", same_dept: undefined });
for (const role of ["Employee", "Manager", "Director"] as const) {
  access.push({ role, classification: "Restricted", allow: false, rule_id: `rbac_restricted_deny:${role}`, same_dept: undefined });
}

export const p1RbacRuleSet: RbacRuleSetData = {
  archetype: "A",
  roles: [...ROLES],
  departments: [...DEPARTMENTS],
  classifications: [
    { id: "Public", rank: 0 },
    { id: "Internal", rank: 1 },
    { id: "Confidential", rank: 2 },
    { id: "Restricted", rank: 3 }
  ],
  normalization: {
    roles: roleAliases,
    departments: departmentAliases
  },
  role_hierarchy: {},
  access
};
