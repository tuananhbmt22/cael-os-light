import type { CorpusUnit } from "@cael/os-light";
import type { P1Classification } from "./rbac-rule-set.js";

export interface P1Document {
  id: string;
  department: string;
  classification: P1Classification;
  blocks?: { classification: P1Classification }[];
  title?: string;
  text?: string;
  facts?: string[];
  keywords?: string[];
}

export const syntheticDocuments: P1Document[] = [
  {
    id: "SYN-PUB-001",
    department: "COMP",
    classification: "Public",
    title: "Company handbook",
    facts: ["Company handbook states the access classes are Public, Internal, Confidential, and Restricted."],
    keywords: ["handbook", "classification", "vocabulary", "restricted"]
  },
  {
    id: "SYN-HR-010",
    department: "HR",
    classification: "Confidential",
    title: "Human resources hiring packets",
    facts: ["Human Resources policy says internal hiring packets are owned by HR."],
    keywords: ["human", "resources", "hiring", "packets", "hr"]
  },
  {
    id: "SYN-FIN-011",
    department: "FIN",
    classification: "Internal",
    title: "Finance forecast variance",
    facts: ["Finance summary reports a forecast variance figure of 12."],
    keywords: ["finance", "forecast", "variance"]
  },
  {
    id: "SYN-OPS-030",
    department: "OPS",
    classification: "Internal",
    title: "Operations KPI completion",
    facts: ["Operations KPI summary reports on-time completion at 93 percent."],
    keywords: ["operations", "kpi", "completion"]
  },
  {
    id: "SYN-EXEC-037",
    department: "EXEC",
    classification: "Restricted",
    title: "Executive strategy acquisition",
    facts: ["Executive strategy memo contains restricted acquisition planning."],
    keywords: ["executive", "strategy", "acquisition"]
  },
  {
    id: "SYN-BLOCK-044",
    department: "ENG",
    classification: "Internal",
    blocks: [{ classification: "Restricted" }],
    title: "Engineering deployment rollback",
    facts: ["Engineering brief has a restricted deployment block about privileged rollback controls."],
    keywords: ["engineering", "deployment", "rollback", "privileged"]
  },
  {
    id: "SYN-DECOY-016",
    department: "OPS",
    classification: "Restricted",
    title: "Operations access code decoy",
    facts: ["Restricted operations decoy repeats the same access-code phrase as a visible neighbor."],
    keywords: ["access", "code", "decoy", "operations"]
  }
];

export const syntheticCorpus: CorpusUnit[] = [
  {
    id: "SYN-PUB-001",
    source: "synthetic-company-handbook",
    facts: ["Company handbook states the access classes are Public, Internal, Confidential, and Restricted."],
    keywords: ["handbook", "classification", "vocabulary", "restricted"]
  },
  {
    id: "SYN-HR-010",
    source: "synthetic-hr-policy",
    facts: ["Human Resources policy says internal hiring packets are owned by HR."],
    keywords: ["human", "resources", "hiring", "packets", "hr"]
  },
  {
    id: "SYN-FIN-011",
    source: "synthetic-finance-summary",
    facts: ["Finance summary reports a forecast variance figure of 12."],
    keywords: ["finance", "forecast", "variance"]
  },
  {
    id: "SYN-OPS-030",
    source: "synthetic-ops-kpi",
    facts: ["Operations KPI summary reports on-time completion at 93 percent."],
    keywords: ["operations", "kpi", "completion"]
  },
  {
    id: "SYN-EXEC-037",
    source: "synthetic-executive-brief",
    facts: ["Executive strategy memo contains restricted acquisition planning."],
    keywords: ["executive", "strategy", "acquisition"]
  },
  {
    id: "SYN-BLOCK-044",
    source: "synthetic-engineering-brief",
    facts: ["Engineering brief has a restricted deployment block about privileged rollback controls."],
    keywords: ["engineering", "deployment", "rollback", "privileged"]
  },
  {
    id: "SYN-DECOY-016",
    source: "synthetic-denied-decoy",
    facts: ["Restricted operations decoy repeats the same access-code phrase as a visible neighbor."],
    keywords: ["access", "code", "decoy", "operations"]
  }
];
