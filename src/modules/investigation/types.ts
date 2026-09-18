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

export const CLAIM_VALUE_TYPE = [
  "TEXT",
  "NUMBER",
  "DATE_TIME",
  "DATE",
  "MONEY",
  "IDENTIFIER",
] as const;

export type ClaimValueType = (typeof CLAIM_VALUE_TYPE)[number];

export const DEMURRAGE_CLAIM_TYPES = [
  "CONTAINER_ID",
  "VESSEL_NAME",
  "VESSEL_MMSI",
  "TERMINAL",
  "ARRIVAL_TIME",
  "DISCHARGE_TIME",
  "AVAILABLE_TIME",
  "FREE_TIME_START",
  "FREE_DAYS",
  "FREE_TIME_EXPIRY",
  "RELEASE_TIME",
  "CHARGED_DAYS",
  "DAILY_RATE",
  "CHARGED_AMOUNT",
  "CURRENCY",
  "INVOICE_NUMBER",
  "INVOICE_DATE",
  "PORT_LAT",
  "PORT_LON",
] as const;

export type DemurrageClaimType = (typeof DEMURRAGE_CLAIM_TYPES)[number];

export interface EvidenceClaimInput {
  caseId: string;
  sourceId: string;
  documentVersionId?: string;
  claimType: string;
  claimText: string;
  normalizedValue?: unknown;
  valueType?: ClaimValueType;
  sourceQuote?: string;
  pageNumber?: number;
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
