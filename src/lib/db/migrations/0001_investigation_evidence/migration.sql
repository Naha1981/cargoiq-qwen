-- CargoIQ investigative evidence additive migration.
-- Safe to run after a prior db:push; existing application tables are not modified.
-- Generated for the investigation/forecasting domain introduced in the investigative-evidence rebuild.

CREATE TABLE IF NOT EXISTS "investigation_cases" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "title" varchar(255) NOT NULL,
  "reference" varchar(255),
  "dispute_type" varchar(50) NOT NULL,
  "status" varchar(30) DEFAULT 'OPEN' NOT NULL,
  "base_currency" varchar(3) DEFAULT 'ZAR' NOT NULL,
  "notes" text,
  "origin_type" varchar(50),
  "origin_id" varchar(64),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "investigation_cases_tenant_idx" ON "investigation_cases" ("tenant_id");
CREATE INDEX IF NOT EXISTS "investigation_cases_status_idx" ON "investigation_cases" ("status");

CREATE TABLE IF NOT EXISTS "case_parties" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "role" varchar(80) NOT NULL,
  "external_ref" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "case_parties_tenant_case_idx" ON "case_parties" ("tenant_id","case_id");

CREATE TABLE IF NOT EXISTS "investigation_documents" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "mime_type" varchar(120) NOT NULL,
  "sha256" varchar(64) NOT NULL,
  "document_type" varchar(80),
  "source_label" varchar(255),
  "original_storage_key" text,
  "size_bytes" integer NOT NULL,
  "content_bytes" bytea NOT NULL,
  "immutable" boolean DEFAULT true NOT NULL,
  "malware_scan_status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "investigation_documents_tenant_case_idx" ON "investigation_documents" ("tenant_id","case_id");
CREATE INDEX IF NOT EXISTS "investigation_documents_sha256_idx" ON "investigation_documents" ("sha256");

CREATE TABLE IF NOT EXISTS "investigation_document_versions" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "document_id" varchar(64) NOT NULL,
  "version" varchar(30) NOT NULL,
  "extraction_status" varchar(30) DEFAULT 'PENDING' NOT NULL,
  "parser" varchar(100),
  "parser_version" varchar(100),
  "page_count" varchar(30),
  "extracted_text" text,
  "extracted_payload" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "investigation_doc_versions_tenant_document_idx" ON "investigation_document_versions" ("tenant_id","document_id");

CREATE TABLE IF NOT EXISTS "evidence_claims" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "source_id" varchar(64) NOT NULL,
  "claim_type" varchar(100) NOT NULL,
  "claim_text" text NOT NULL,
  "observed_at" timestamp,
  "timezone" varchar(80),
  "confidence" decimal(5,4),
  "provenance" varchar(30) NOT NULL,
  "source_type" varchar(50) NOT NULL,
  "location_ref" text,
  "source_quote" text,
  "page_number" integer,
  "normalized_value" jsonb,
  "document_version_id" varchar(64),
  "human_reviewed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "evidence_claims_tenant_case_idx" ON "evidence_claims" ("tenant_id","case_id");
CREATE INDEX IF NOT EXISTS "evidence_claims_source_idx" ON "evidence_claims" ("source_id");

CREATE TABLE IF NOT EXISTS "freight_events" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "event_type" varchar(100) NOT NULL,
  "event_time" timestamp,
  "timezone" varchar(80),
  "latitude" decimal(10,7),
  "longitude" decimal(10,7),
  "location_label" varchar(255),
  "provenance" varchar(30) NOT NULL,
  "source_id" varchar(64),
  "details" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "freight_events_tenant_case_idx" ON "freight_events" ("tenant_id","case_id");
CREATE INDEX IF NOT EXISTS "freight_events_time_idx" ON "freight_events" ("event_time");

CREATE TABLE IF NOT EXISTS "event_evidence_links" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "event_id" varchar(64) NOT NULL,
  "claim_id" varchar(64) NOT NULL,
  "relationship" varchar(40) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "event_evidence_links_tenant_event_idx" ON "event_evidence_links" ("tenant_id","event_id");

CREATE TABLE IF NOT EXISTS "contradictions" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "left_claim_id" varchar(64) NOT NULL,
  "right_claim_id" varchar(64) NOT NULL,
  "contradiction_type" varchar(80) NOT NULL,
  "explanation" text NOT NULL,
  "severity" varchar(30) DEFAULT 'MEDIUM' NOT NULL,
  "resolved" boolean DEFAULT false NOT NULL,
  "fingerprint" varchar(64),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "contradictions_tenant_case_idx" ON "contradictions" ("tenant_id","case_id");

CREATE TABLE IF NOT EXISTS "external_sources" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "source_type" varchar(60) NOT NULL,
  "official_url" text,
  "license_name" varchar(255),
  "commercial_use_status" varchar(60) DEFAULT 'REVIEW' NOT NULL,
  "attribution_required" boolean DEFAULT true NOT NULL,
  "retention_notes" text,
  "redistribution_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "external_observations" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "source_id" varchar(64) NOT NULL,
  "observation_type" varchar(100) NOT NULL,
  "observed_at" timestamp,
  "retrieved_at" timestamp DEFAULT now() NOT NULL,
  "latitude" decimal(10,7),
  "longitude" decimal(10,7),
  "provenance" varchar(30) NOT NULL,
  "confidence" decimal(5,4),
  "payload" jsonb,
  "limitation" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "external_observations_tenant_case_idx" ON "external_observations" ("tenant_id","case_id");
CREATE INDEX IF NOT EXISTS "external_observations_source_idx" ON "external_observations" ("source_id");

CREATE TABLE IF NOT EXISTS "commercial_rules" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "rule_type" varchar(80) NOT NULL,
  "version" varchar(40) NOT NULL,
  "name" varchar(255) NOT NULL,
  "currency" varchar(3) NOT NULL,
  "effective_from" timestamp NOT NULL,
  "effective_to" timestamp,
  "rule_definition" jsonb NOT NULL,
  "approved" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "commercial_rules_tenant_type_idx" ON "commercial_rules" ("tenant_id","rule_type");

CREATE TABLE IF NOT EXISTS "currency_rates" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "base_currency" varchar(3) NOT NULL,
  "quote_currency" varchar(3) NOT NULL,
  "rate_date" varchar(10) NOT NULL,
  "rate" decimal(20,10) NOT NULL,
  "source" varchar(255) NOT NULL,
  "version" varchar(50) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "currency_rates_tenant_pair_date_idx"
  ON "currency_rates" ("tenant_id","base_currency","quote_currency","rate_date");

CREATE TABLE IF NOT EXISTS "forecast_runs" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64),
  "series_id" varchar(255) NOT NULL,
  "entity_type" varchar(100) NOT NULL,
  "entity_id" varchar(255) NOT NULL,
  "metric" varchar(100) NOT NULL,
  "engine" varchar(50) NOT NULL,
  "model_version" varchar(100) NOT NULL,
  "frequency" varchar(30) NOT NULL,
  "horizon" varchar(20) NOT NULL,
  "generated_at" timestamp NOT NULL,
  "input_snapshot" jsonb NOT NULL,
  "output" jsonb NOT NULL,
  "limitations" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "forecast_runs_tenant_case_idx" ON "forecast_runs" ("tenant_id","case_id");
CREATE INDEX IF NOT EXISTS "forecast_runs_series_idx" ON "forecast_runs" ("series_id");

CREATE TABLE IF NOT EXISTS "forecast_signals" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64),
  "forecast_run_id" varchar(64) NOT NULL,
  "series_id" varchar(255) NOT NULL,
  "entity_type" varchar(100) NOT NULL,
  "entity_id" varchar(255) NOT NULL,
  "metric" varchar(100) NOT NULL,
  "signal_type" varchar(50) NOT NULL,
  "score" decimal(5,4) NOT NULL,
  "trigger_threshold" decimal(20,6) NOT NULL,
  "peak_forecast_value" decimal(20,6) NOT NULL,
  "peak_upper_value" decimal(20,6),
  "expected_amount_minor" varchar(40),
  "currency" varchar(3),
  "horizon_start" timestamp NOT NULL,
  "horizon_end" timestamp NOT NULL,
  "rationale" text NOT NULL,
  "provenance" varchar(30) DEFAULT 'INFERRED' NOT NULL,
  "requires_investigation" boolean DEFAULT true NOT NULL,
  "status" varchar(30) DEFAULT 'NEW' NOT NULL,
  "limitations" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "forecast_signals_tenant_status_idx" ON "forecast_signals" ("tenant_id","status");
CREATE INDEX IF NOT EXISTS "forecast_signals_case_idx" ON "forecast_signals" ("tenant_id","case_id");
CREATE INDEX IF NOT EXISTS "forecast_signals_entity_idx" ON "forecast_signals" ("entity_type","entity_id");

CREATE TABLE IF NOT EXISTS "calculation_runs" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "rule_id" varchar(64),
  "rule_version" varchar(50),
  "formula_version" varchar(50) NOT NULL,
  "input_claim_ids" jsonb NOT NULL,
  "input_snapshot" jsonb NOT NULL,
  "result" jsonb NOT NULL,
  "assumptions" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "calculation_runs_tenant_case_idx" ON "calculation_runs" ("tenant_id","case_id");

CREATE TABLE IF NOT EXISTS "recovery_assessments" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "charged_amount_minor" varchar(40) NOT NULL,
  "calculated_amount_minor" varchar(40),
  "evidence_supported_amount_minor" varchar(40),
  "potential_recovery_amount_minor" varchar(40),
  "recovered_amount_minor" varchar(40),
  "currency" varchar(3) NOT NULL,
  "status" varchar(40) DEFAULT 'DRAFT' NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "recovery_assessments_tenant_case_idx" ON "recovery_assessments" ("tenant_id","case_id");

CREATE TABLE IF NOT EXISTS "evidence_packs" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "status" varchar(30) DEFAULT 'DRAFT' NOT NULL,
  "version" varchar(30) NOT NULL,
  "content_hash" varchar(64),
  "generated_at" timestamp,
  "storage_key" text,
  "content_bytes" bytea,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "evidence_packs_tenant_case_idx" ON "evidence_packs" ("tenant_id","case_id");

CREATE TABLE IF NOT EXISTS "investigation_approvals" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64) NOT NULL,
  "evidence_pack_id" varchar(64),
  "reviewer_user_id" varchar(64) NOT NULL,
  "decision" varchar(30) NOT NULL,
  "reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "investigation_approvals_tenant_case_idx" ON "investigation_approvals" ("tenant_id","case_id");

CREATE TABLE IF NOT EXISTS "investigation_audit_events" (
  "id" varchar(64) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL,
  "case_id" varchar(64),
  "actor_user_id" varchar(64),
  "action" varchar(100) NOT NULL,
  "target_type" varchar(100),
  "target_id" varchar(64),
  "payload" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "investigation_audit_tenant_case_idx" ON "investigation_audit_events" ("tenant_id","case_id");
