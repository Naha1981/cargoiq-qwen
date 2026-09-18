import {
  PROVENANCE_STATUS,
  type ProvenanceStatus,
} from "./types.ts";

const DIRECT_TRANSITIONS: Record<ProvenanceStatus, ReadonlySet<ProvenanceStatus>> = {
  VERIFIED: new Set(["VERIFIED", "DISPUTED"]),
  DERIVED: new Set(["DERIVED", "DISPUTED", "INFERRED"]),
  INFERRED: new Set(["INFERRED", "DISPUTED"]),
  DISPUTED: new Set(["DISPUTED", "INFERRED"]),
  UNKNOWN: new Set(["UNKNOWN", "DERIVED", "INFERRED", "DISPUTED"]),
};

export function isProvenanceStatus(value: unknown): value is ProvenanceStatus {
  return typeof value === "string" && (PROVENANCE_STATUS as readonly string[]).includes(value);
}

export function canTransitionProvenance(
  from: ProvenanceStatus,
  to: ProvenanceStatus,
  humanApproved = false,
): boolean {
  if (!isProvenanceStatus(from) || !isProvenanceStatus(to)) return false;
  if (to === "VERIFIED" && from !== "VERIFIED") return humanApproved;
  return DIRECT_TRANSITIONS[from].has(to);
}

export function provenanceLabel(status: ProvenanceStatus): string {
  switch (status) {
    case "VERIFIED":
      return "Verified";
    case "DERIVED":
      return "Derived";
    case "INFERRED":
      return "Inferred";
    case "DISPUTED":
      return "Disputed";
    default:
      return "Unknown";
  }
}
