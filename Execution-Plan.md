# CargoIQ Investigative Evidence — Execution Plan
Version 2.0 | 2026-09-18

## Phase 0 — Baseline

- Freeze PRD / Plan / Execution Plan.
- Keep CargoIQ repo as source of truth.
- Maintain God’s Eye View as a separate reference codebase.
- No destructive migration.

## Phase 1 — Evidence domain

- Add investigation tables.
- Add tenant-scoped CRUD.
- Add audit events.
- Add deterministic provenance transitions.

STATUS: STARTED

## Phase 2 — Immutable documents

- Validate MIME/size.
- SHA-256 original.
- Malware scan.
- Persist immutable original.
- OCR/layout extraction.
- Create evidence claims with source locations.

## Phase 3 — Deterministic money

- Implement demurrage.
- Add rule versions.
- Add historical currency-rate records.
- Add reproducibility fixtures.
- Never let an LLM own final arithmetic.

STATUS: FOUNDATION IMPLEMENTED

## Forecasting status

STATUS: CONTRACT + TIMESFM ADAPTER IMPLEMENTED

## Phase 4 — Forecasting & Corroboration

- Add ForecastEngine contract.
- Add TimesFM HTTP adapter behind server-side credentials.
- Convert forecast threshold crossings into INFERRED investigation signals.
- Keep forecast results separate from evidence claims.
- Persist forecast runs/signals after the first contract slice is stable.
- Then implement one AIS adapter.

- Implement one AIS adapter.
- Implement Copernicus Sentinel discovery.
- Add weather context.
- Add OSM geography.
- Add approved port/terminal source.
- Add source/licence records.

## Phase 5 — God’s Eye View

- Connect case-scoped geospatial API.
- Reuse GEV Cesium/data-layer/voice architecture.
- Add case-event timeline synchronization.
- Add evidence/provenance panel.
- Keep provider secrets server-side.

## Phase 6 — Contradictions

- Compare event dates/times.
- Compare source assertions.
- Preserve both sides of a conflict.
- Require human resolution.

## Phase 7 — Evidence pack

- Generate source-linked report.
- Include timeline, contradictions, calculations, limitations, approvals.
- Hash the final pack.

## Phase 8 — Hardening

- Cross-tenant security tests.
- Upload security. Failed extraction must be retryable without mutating the immutable original PDF.
- Source freshness.
- Background job idempotency.
- Observability.
- Backup/restore.
- Dependency and licence checks.

## Phase 9 — Pilot

Use one historical South African port demurrage dispute.

The pilot is successful when a finance/claims reviewer can inspect the evidence pack and reproduce the calculation without trusting an LLM's unsupported conclusion.
