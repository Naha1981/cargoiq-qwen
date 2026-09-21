type ClaimLike = { id: string; claimType: string };
type ContradictionLike = {
  id: string;
  leftClaimId: string;
  rightClaimId: string;
  resolved: boolean;
};

export class CalculationBlockedError extends Error {
  readonly code = "CALCULATION_BLOCKED";
  readonly contradictionIds: string[];
  readonly claimTypes: string[];

  constructor(contradictionIds: string[], claimTypes: string[]) {
    super("CALCULATION_BLOCKED_UNRESOLVED_CONTRADICTIONS");
    this.name = "CalculationBlockedError";
    this.contradictionIds = contradictionIds;
    this.claimTypes = claimTypes;
  }
}

export function findMaterialUnresolvedContradictions(
  claims: ClaimLike[],
  contradictionRows: ContradictionLike[],
  requiredClaimTypes: readonly string[],
) {
  const claimTypeById = new Map(claims.map((claim) => [claim.id, claim.claimType]));
  const required = new Set(requiredClaimTypes);

  return contradictionRows.filter((contradiction) => {
    if (contradiction.resolved) return false;
    const leftType = claimTypeById.get(contradiction.leftClaimId);
    const rightType = claimTypeById.get(contradiction.rightClaimId);
    return required.has(leftType ?? "") || required.has(rightType ?? "");
  });
}

export function nextEvidencePackVersion(versions: string[]): string {
  const maxVersion = versions.reduce((max, version) => {
    const parsed = Number.parseInt(version, 10);
    return Number.isInteger(parsed) && parsed > max ? parsed : max;
  }, 0);
  return String(maxVersion + 1);
}

export function isLocalUploadBypassEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.NODE_ENV === "development" &&
    !env.VERCEL_ENV &&
    env.CARGOIQ_ALLOW_UNSCANNED_LOCAL_UPLOADS === "true"
  );
}

export function isMalwareScanRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  return !isLocalUploadBypassEnabled(env);
}

export async function malwareScan(buffer: Buffer) {
  const endpoint = process.env.CLAMAV_URL;
  if (!endpoint) {
    if (isMalwareScanRequired()) {
      throw new Error("MALWARE_SCAN_NOT_CONFIGURED");
    }
    return "LOCAL_BYPASS";
  }

  const response = await fetch(endpoint.replace(/\/$/, "") + "/scan", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: new Uint8Array(buffer),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("MALWARE_SCAN_" + response.status);
  const body = (await response.json().catch(() => null)) as { clean?: boolean } | null;
  if (body?.clean !== true) throw new Error("MALWARE_DETECTED");
  return "CLEAN";
}
