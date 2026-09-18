export const PROVENANCE_STATUS = [
  "VERIFIED",
  "DERIVED",
  "INFERRED",
  "DISPUTED",
  "UNKNOWN",
] as const;

export type ProvenanceStatus = (typeof PROVENANCE_STATUS)[number];

export const SOURCE_TYPE = [
  "CUSTOMER_PRIMARY",
  "CONTRACTUAL",
  "OFFICIAL_PUBLIC",
  "LICENSED_COMMERCIAL",
  "INDEPENDENT_OBSERVATION",
  "DERIVED",
  "INFERRED",
  "UNKNOWN",
] as const;

export type SourceType = (typeof SOURCE_TYPE)[number];

export const CASE_STATUS = [
  "OPEN",
  "INVESTIGATING",
  "REVIEW",
  "APPROVED",
  "CLOSED",
] as const;

export type CaseStatus = (typeof CASE_STATUS)[number];

export const DISPUTE_TYPE = [
  "DEMURRAGE",
  "DETENTION",
  "STORAGE",
  "WAITING_TIME",
  "ACCESSORIAL",
  "CARRIER_OVERCHARGE",
  "OTHER",
] as const;

export type DisputeType = (typeof DISPUTE_TYPE)[number];

export interface EvidenceClaimInput {
  caseId: string;
  sourceId: string;
  claimType: string;
  claimText: string;
  observedAt?: string;
  timezone?: string;
  confidence?: number;
  provenance: ProvenanceStatus;
  sourceType: SourceType;
  locationRef?: string;
}

export interface DemurrageInput {
  chargeStart: string;
  chargeEnd: string;
  freeDays: number;
  dailyRateMinor: number;
  currency: string;
  weekendBillable?: boolean;
  holidayDates?: string[];
}

export interface DemurrageResult {
  totalDays: number;
  freeDaysApplied: number;
  chargeableDays: number;
  amountMinor: number;
  currency: string;
  dailyRateMinor: number;
  chargeableDates: string[];
  assumptions: string[];
}
