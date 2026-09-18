# CargoIQ Investigative Evidence — Plan
Version 2.0 | 2026-09-18

## Repository decision

KEEP:
- Next.js App Router / TypeScript
- Neon + Drizzle
- Clerk tenant/auth infrastructure
- Rate-card and invoice primitives
- Existing deterministic compliance-rule approach
- Playwright and Sentry

REFACTOR:
- Shadow Audit into real investigation cases
- Document parsing into immutable evidence processing
- Rate cards into versioned commercial rules
- Invoice findings into evidence-linked charge investigations
- Domain events into audit + freight-event records

INTEGRATE:
- God's Eye View as the geospatial investigation surface

## Current evidence-core tables added

- investigation_cases
- case_parties
- investigation_documents
- investigation_document_versions
- evidence_claims
- freight_events
- event_evidence_links
- contradictions
- external_sources
- external_observations
- commercial_rules
- currency_rates
- calculation_runs
- recovery_assessments
- evidence_packs
- investigation_approvals
- investigation_audit_events

## Open-source stack

Now:
- PostgreSQL / Drizzle
- PostGIS
- pgvector
- Docling
- OCRmyPDF
- ClamAV
- GDAL
- STAC metadata contracts
- DuckDB / GeoParquet
- H3
- pg-boss
- OpenTelemetry
- Cesium / God's Eye View

Later only when measured requirements justify them:
- TiTiler
- OpenSearch
- Qdrant
- Temporal

## Data-source strategy

Initial source families:
- AIS
- Sentinel-1 / Sentinel-2
- official port/terminal notices
- weather
- OSM geography
- lawful public camera sources

Provider adapters must normalize to an external-observation contract before case linkage.

## Forecasting engine\n\n- Forecast operational series such as dwell time, free-time utilisation, waiting time, and dispute exposure indicators.\n- Treat forecasts as INFERRED prioritisation signals only.\n- Never convert a forecast into evidence or a financial fact.\n- Keep the model provider behind a ForecastEngine interface.\n- Use TimesFM 2.5 or another commercially permitted model for production; review model-weight licensing before enabling any newer checkpoint.\n- The investigation agent may create a triage candidate from a signal, but human review remains required for the evidence case.\n\n## Financial engine

Start with demurrage only.

Financial results must preserve:
- charged amount
- calculated amount
- evidence-supported amount
- potential recovery
- recovered amount
- currency
- rule version
- input claim IDs
- assumptions

Historical FX must be stored with source, rate date, rate version and formula.

## Security

All case/evidence/observation/calculation records are tenant-scoped.

Every retrieval path must verify tenant membership server-side.

Add negative cross-tenant tests for:
- case reads
- documents
- observations
- search
- reports
- background jobs
- signed URLs

## Definition of done

A vertical slice is only complete when real stored data drives the result, tests pass, source/licence constraints are recorded, and the founder can verify the live flow.
