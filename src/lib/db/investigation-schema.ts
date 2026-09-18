import {
  boolean,
  customType,
  decimal,
  integer,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const investigationCases = pgTable(
  "investigation_cases",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    reference: varchar("reference", { length: 255 }),
    disputeType: varchar("dispute_type", { length: 50 }).notNull(),
    status: varchar("status", { length: 30 }).default("OPEN").notNull(),
    baseCurrency: varchar("base_currency", { length: 3 }).default("ZAR").notNull(),
    notes: text("notes"),
    originType: varchar("origin_type", { length: 50 }),
    originId: varchar("origin_id", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("investigation_cases_tenant_idx").on(table.tenantId),
    index("investigation_cases_status_idx").on(table.status),
  ],
);

export const caseParties = pgTable(
  "case_parties",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 80 }).notNull(),
    externalRef: varchar("external_ref", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("case_parties_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

export const investigationDocuments = pgTable(
  "investigation_documents",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    documentType: varchar("document_type", { length: 80 }),
    sourceLabel: varchar("source_label", { length: 255 }),
    originalStorageKey: text("original_storage_key"),
    sizeBytes: integer("size_bytes").notNull(),
    contentBytes: bytea("content_bytes").notNull(),
    immutable: boolean("immutable").default(true).notNull(),
    malwareScanStatus: varchar("malware_scan_status", { length: 30 }).default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("investigation_documents_tenant_case_idx").on(table.tenantId, table.caseId),
    index("investigation_documents_sha256_idx").on(table.sha256),
  ],
);

export const investigationDocumentVersions = pgTable(
  "investigation_document_versions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    documentId: varchar("document_id", { length: 64 }).notNull(),
    version: varchar("version", { length: 30 }).notNull(),
    extractionStatus: varchar("extraction_status", { length: 30 }).default("PENDING").notNull(),
    parser: varchar("parser", { length: 100 }),
    parserVersion: varchar("parser_version", { length: 100 }),
    pageCount: varchar("page_count", { length: 30 }),
    extractedText: text("extracted_text"),
    extractedPayload: jsonb("extracted_payload"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("investigation_doc_versions_tenant_document_idx").on(table.tenantId, table.documentId),
  ],
);

export const evidenceClaims = pgTable(
  "evidence_claims",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    sourceId: varchar("source_id", { length: 64 }).notNull(),
    claimType: varchar("claim_type", { length: 100 }).notNull(),
    claimText: text("claim_text").notNull(),
    observedAt: timestamp("observed_at"),
    timezone: varchar("timezone", { length: 80 }),
    confidence: decimal("confidence", { precision: 5, scale: 4 }),
    provenance: varchar("provenance", { length: 30 }).notNull(),
    sourceType: varchar("source_type", { length: 50 }).notNull(),
    locationRef: text("location_ref"),
    sourceQuote: text("source_quote"),
    pageNumber: integer("page_number"),
    normalizedValue: jsonb("normalized_value"),
    documentVersionId: varchar("document_version_id", { length: 64 }),
    humanReviewed: boolean("human_reviewed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("evidence_claims_tenant_case_idx").on(table.tenantId, table.caseId),
    index("evidence_claims_source_idx").on(table.sourceId),
  ],
);

export const freightEvents = pgTable(
  "freight_events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    eventTime: timestamp("event_time"),
    timezone: varchar("timezone", { length: 80 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    locationLabel: varchar("location_label", { length: 255 }),
    provenance: varchar("provenance", { length: 30 }).notNull(),
    sourceId: varchar("source_id", { length: 64 }),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("freight_events_tenant_case_idx").on(table.tenantId, table.caseId),
    index("freight_events_time_idx").on(table.eventTime),
  ],
);

export const eventEvidenceLinks = pgTable(
  "event_evidence_links",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    eventId: varchar("event_id", { length: 64 }).notNull(),
    claimId: varchar("claim_id", { length: 64 }).notNull(),
    relationship: varchar("relationship", { length: 40 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("event_evidence_links_tenant_event_idx").on(table.tenantId, table.eventId),
  ],
);

export const contradictions = pgTable(
  "contradictions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    leftClaimId: varchar("left_claim_id", { length: 64 }).notNull(),
    rightClaimId: varchar("right_claim_id", { length: 64 }).notNull(),
    contradictionType: varchar("contradiction_type", { length: 80 }).notNull(),
    explanation: text("explanation").notNull(),
    severity: varchar("severity", { length: 30 }).default("MEDIUM").notNull(),
    resolved: boolean("resolved").default(false).notNull(),
    fingerprint: varchar("fingerprint", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("contradictions_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

export const externalSources = pgTable(
  "external_sources",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    sourceType: varchar("source_type", { length: 60 }).notNull(),
    officialUrl: text("official_url"),
    licenseName: varchar("license_name", { length: 255 }),
    commercialUseStatus: varchar("commercial_use_status", { length: 60 }).default("REVIEW").notNull(),
    attributionRequired: boolean("attribution_required").default(true).notNull(),
    retentionNotes: text("retention_notes"),
    redistributionNotes: text("redistribution_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

export const externalObservations = pgTable(
  "external_observations",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    sourceId: varchar("source_id", { length: 64 }).notNull(),
    observationType: varchar("observation_type", { length: 100 }).notNull(),
    observedAt: timestamp("observed_at"),
    retrievedAt: timestamp("retrieved_at").defaultNow().notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    provenance: varchar("provenance", { length: 30 }).notNull(),
    confidence: decimal("confidence", { precision: 5, scale: 4 }),
    payload: jsonb("payload"),
    limitation: text("limitation"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("external_observations_tenant_case_idx").on(table.tenantId, table.caseId),
    index("external_observations_source_idx").on(table.sourceId),
  ],
);

export const commercialRules = pgTable(
  "commercial_rules",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    ruleType: varchar("rule_type", { length: 80 }).notNull(),
    version: varchar("version", { length: 40 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    effectiveFrom: timestamp("effective_from").notNull(),
    effectiveTo: timestamp("effective_to"),
    ruleDefinition: jsonb("rule_definition").notNull(),
    approved: boolean("approved").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("commercial_rules_tenant_type_idx").on(table.tenantId, table.ruleType),
  ],
);

export const currencyRates = pgTable(
  "currency_rates",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
    quoteCurrency: varchar("quote_currency", { length: 3 }).notNull(),
    rateDate: varchar("rate_date", { length: 10 }).notNull(),
    rate: decimal("rate", { precision: 20, scale: 10 }).notNull(),
    source: varchar("source", { length: 255 }).notNull(),
    version: varchar("version", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("currency_rates_tenant_pair_date_idx").on(
      table.tenantId,
      table.baseCurrency,
      table.quoteCurrency,
      table.rateDate,
    ),
  ],
);

export const forecastRuns = pgTable(
  "forecast_runs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }),
    seriesId: varchar("series_id", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    metric: varchar("metric", { length: 100 }).notNull(),
    engine: varchar("engine", { length: 50 }).notNull(),
    modelVersion: varchar("model_version", { length: 100 }).notNull(),
    frequency: varchar("frequency", { length: 30 }).notNull(),
    horizon: varchar("horizon", { length: 20 }).notNull(),
    generatedAt: timestamp("generated_at").notNull(),
    inputSnapshot: jsonb("input_snapshot").notNull(),
    output: jsonb("output").notNull(),
    limitations: jsonb("limitations"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("forecast_runs_tenant_case_idx").on(table.tenantId, table.caseId),
    index("forecast_runs_series_idx").on(table.seriesId),
  ],
);

export const forecastSignals = pgTable(
  "forecast_signals",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }),
    forecastRunId: varchar("forecast_run_id", { length: 64 }).notNull(),
    seriesId: varchar("series_id", { length: 255 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    metric: varchar("metric", { length: 100 }).notNull(),
    signalType: varchar("signal_type", { length: 50 }).notNull(),
    score: decimal("score", { precision: 5, scale: 4 }).notNull(),
    triggerThreshold: decimal("trigger_threshold", { precision: 20, scale: 6 }).notNull(),
    peakForecastValue: decimal("peak_forecast_value", { precision: 20, scale: 6 }).notNull(),
    peakUpperValue: decimal("peak_upper_value", { precision: 20, scale: 6 }),
    expectedAmountMinor: varchar("expected_amount_minor", { length: 40 }),
    currency: varchar("currency", { length: 3 }),
    horizonStart: timestamp("horizon_start").notNull(),
    horizonEnd: timestamp("horizon_end").notNull(),
    rationale: text("rationale").notNull(),
    provenance: varchar("provenance", { length: 30 }).default("INFERRED").notNull(),
    requiresInvestigation: boolean("requires_investigation").default(true).notNull(),
    status: varchar("status", { length: 30 }).default("NEW").notNull(),
    limitations: jsonb("limitations"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("forecast_signals_tenant_status_idx").on(table.tenantId, table.status),
    index("forecast_signals_case_idx").on(table.tenantId, table.caseId),
    index("forecast_signals_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const calculationRuns = pgTable(
  "calculation_runs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    ruleId: varchar("rule_id", { length: 64 }),
    ruleVersion: varchar("rule_version", { length: 50 }),
    formulaVersion: varchar("formula_version", { length: 50 }).notNull(),
    inputClaimIds: jsonb("input_claim_ids").notNull(),
    inputSnapshot: jsonb("input_snapshot").notNull(),
    result: jsonb("result").notNull(),
    assumptions: jsonb("assumptions"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("calculation_runs_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

export const recoveryAssessments = pgTable(
  "recovery_assessments",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    chargedAmountMinor: varchar("charged_amount_minor", { length: 40 }).notNull(),
    calculatedAmountMinor: varchar("calculated_amount_minor", { length: 40 }),
    evidenceSupportedAmountMinor: varchar("evidence_supported_amount_minor", { length: 40 }),
    potentialRecoveryAmountMinor: varchar("potential_recovery_amount_minor", { length: 40 }),
    recoveredAmountMinor: varchar("recovered_amount_minor", { length: 40 }),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: varchar("status", { length: 40 }).default("DRAFT").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("recovery_assessments_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

export const evidencePacks = pgTable(
  "evidence_packs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    status: varchar("status", { length: 30 }).default("DRAFT").notNull(),
    version: varchar("version", { length: 30 }).notNull(),
    contentHash: varchar("content_hash", { length: 64 }),
    generatedAt: timestamp("generated_at"),
    storageKey: text("storage_key"),
    contentBytes: bytea("content_bytes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("evidence_packs_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

export const approvals = pgTable(
  "investigation_approvals",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }).notNull(),
    evidencePackId: varchar("evidence_pack_id", { length: 64 }),
    reviewerUserId: varchar("reviewer_user_id", { length: 64 }).notNull(),
    decision: varchar("decision", { length: 30 }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("investigation_approvals_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);

export const investigationAuditEvents = pgTable(
  "investigation_audit_events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    caseId: varchar("case_id", { length: 64 }),
    actorUserId: varchar("actor_user_id", { length: 64 }),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 100 }),
    targetId: varchar("target_id", { length: 64 }),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("investigation_audit_tenant_case_idx").on(table.tenantId, table.caseId),
  ],
);
