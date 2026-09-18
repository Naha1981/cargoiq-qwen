import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getTenantForUser } from "@/lib/tenant/for-user";
import {
  externalObservations,
  investigationCases,
} from "@/lib/db/investigation-schema";
import { generateId } from "@/lib/utils";
import type { DisputeType } from "./types";

export interface CreateInvestigationInput {
  title: string;
  reference?: string;
  disputeType: DisputeType;
  baseCurrency: string;
  notes?: string;
  originType?: string;
  originId?: string;
}

export async function getTenantContext(userId: string) {
  const resolved = await getTenantForUser(userId);
  return resolved?.tenant ?? null;
}

export async function listInvestigationCases(tenantId: string) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  return db
    .select()
    .from(investigationCases)
    .where(eq(investigationCases.tenantId, tenantId))
    .orderBy(desc(investigationCases.updatedAt));
}

export async function createInvestigationCase(
  tenantId: string,
  input: CreateInvestigationInput,
) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const now = new Date();
  const [row] = await db
    .insert(investigationCases)
    .values({
      id: generateId(),
      tenantId,
      title: input.title,
      reference: input.reference ?? null,
      disputeType: input.disputeType,
      status: "OPEN",
      baseCurrency: input.baseCurrency,
      notes: input.notes ?? null,
      originType: input.originType ?? null,
      originId: input.originId ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return row;
}

export async function getInvestigationCase(
  tenantId: string,
  caseId: string,
) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  const [row] = await db
    .select()
    .from(investigationCases)
    .where(
      and(
        eq(investigationCases.id, caseId),
        eq(investigationCases.tenantId, tenantId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function listCaseObservations(
  tenantId: string,
  caseId: string,
) {
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");

  return db
    .select()
    .from(externalObservations)
    .where(
      and(
        eq(externalObservations.caseId, caseId),
        eq(externalObservations.tenantId, tenantId),
      ),
    )
    .orderBy(desc(externalObservations.observedAt));
}
