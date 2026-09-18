# CargoIQ Investigative Evidence — PRD
Version 2.0 | 2026-09-18

## Promise

CargoIQ investigates freight-payment and operational disputes by reconstructing what happened, linking material facts to evidence, finding contradictions, calculating exposure deterministically, adding permitted external corroboration, and producing a human-reviewed evidence pack.

## Core loop

Source -> Evidence Claim -> Freight Event -> Timeline -> Contradiction -> Commercial Rule -> Calculation -> Human Review -> Evidence Pack -> Recovery/Dispute Outcome

## Primary users

- Freight-forwarder finance and claims teams
- Import/export finance teams
- Carrier-management and procurement teams
- Logistics operations teams
- Internal audit / recovery teams

## First dispute types

1. Demurrage
2. Detention
3. Storage
4. Truck waiting time
5. Accessorial charges
6. Carrier overcharges

## Evidence classes

CUSTOMER_PRIMARY, CONTRACTUAL, OFFICIAL_PUBLIC, LICENSED_COMMERCIAL, INDEPENDENT_OBSERVATION, DERIVED, INFERRED, DISPUTED, UNKNOWN.

Every material claim stores source, source location, observed/retrieved time, timezone, extraction method, model/version where applicable, confidence, provenance state, and human-review status.

## Product rules

- Original uploaded evidence is immutable and hashed.
- AI extracts candidate facts; it does not decide final financial results.
- No inference may silently become VERIFIED.
- Public data is corroboration unless the source actually proves the event.
- No legal-liability conclusion is automated.
- No external dispute/recovery action is final without human approval.
- Every customer-owned record is tenant scoped.
- Third-party data is shown only when licence/terms permit it.

## God’s Eye View role

God’s Eye View is the visual investigation surface.

CargoIQ remains the system of record for cases, evidence, events, contradictions, rules, calculations, approvals and audit history.

The investigation map consumes an authenticated case-scoped geospatial contract:
GET /api/v1/investigations/{caseId}/geospatial

The map must show source and provenance beside every material observation.

## MVP

A user must be able to:

1. Create an investigation.
2. Upload/attach source documents.
3. Create source-linked evidence claims.
4. Build a timeline.
5. Flag contradictions.
6. Run deterministic demurrage.
7. Attach external corroboration.
8. Open the investigation in God’s Eye View.
9. Review calculations and limitations.
10. Generate and approve an evidence pack.

## Non-goals for MVP

- Generic TMS replacement
- Autonomous legal decisions
- Autonomous negotiation
- Global CCTV coverage
- Multiple vector databases
- Graph database
- Every maritime/satellite provider
- Commercial redistribution of restricted provider data

## Technical foundation

Keep: Next.js, TypeScript, Drizzle, Neon/PostgreSQL, Clerk, Sentry, Playwright, existing tenant-resolution and deterministic rule patterns.

Add progressively: PostGIS, pgvector, Docling, OCRmyPDF, ClamAV, GDAL, STAC interfaces, DuckDB/GeoParquet, H3, pg-boss, OpenTelemetry, God’s Eye View/Cesium.

Defer: OpenSearch, Qdrant, Temporal, graph database, large-scale satellite tiling.

## Success criterion

A historical demurrage case can be reproduced from its stored evidence and rule inputs, with every material conclusion traceable to evidence or explicitly marked as derived/inferred/disputed/unknown.
