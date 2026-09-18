# CargoIQ

## Investigative Evidence Platform

CargoIQ is being rebuilt as a freight-payment and operational dispute investigation platform.

**Promise:** reconstruct what happened, connect material facts to evidence, calculate financial exposure deterministically, corroborate the timeline with permitted external observations, and produce a human-reviewed evidence pack.

### Core workflow

```
Documents + records + external observations
        ↓
Evidence claims
        ↓
Freight timeline
        ↓
Contradictions
        ↓
Commercial rules
        ↓
Deterministic money
        ↓
Human review
        ↓
Evidence pack
```

### Architecture

- **App:** Next.js App Router + TypeScript
- **Database:** Neon PostgreSQL + Drizzle
- **Auth / tenancy:** Clerk
- **AI extraction:** Vercel AI SDK + Google Gemini
- **Forecasting:** ForecastEngine + TimesFM HTTP adapter
- **Testing:** Playwright + investigation unit checks
- **Observability:** Sentry
- **Geospatial target:** PostGIS + God’s Eye View / Cesium
- **Document target:** Docling + OCRmyPDF + ClamAV
- **Spatial/ETL target:** GDAL + STAC + DuckDB + GeoParquet + H3

### Current investigation foundation

The repository now contains:

- tenant-scoped investigation cases;
- evidence/provenance types;
- deterministic demurrage calculation;
- investigation database tables;
- geospatial case API;
- source/licence register;
- purpose-built CargoIQ Claude Code skills;
- a repeatable investigation unit-test command;
- a replaceable ForecastEngine with persisted forecast runs/signals and inferred investigation triage.

### API foundation

```
GET  /api/v1/investigations
POST /api/v1/investigations
GET  /api/v1/investigations/{id}
GET  /api/v1/investigations/{id}/geospatial
POST /api/v1/forecasts/signals
```

The geospatial endpoint is the contract between CargoIQ and the God’s Eye View visual investigation surface.

The forecasting endpoint uses a server-side TimesFM adapter. Forecast signals are triage inputs only; they are stored as INFERRED and must be independently proven by the evidence engine.

### Important truthfulness rule

Public/independent observations are corroboration, not automatic shipment-specific proof. AIS, satellite, weather, traffic, CCTV and general port notices retain source-specific limitations.

### Run locally

```bash
npm install
npm run test:investigation
npm run test:forecasting
npm run dev
```

Database migrations are managed through Drizzle. No production migration should be run until the generated migration is reviewed.

### Product documents

- `PRD.md`
- `Plan.md`
- `Execution-Plan.md`
- `docs/SOURCE-LICENSE-REGISTER.md`

NahaLabs (Pty) Ltd | Confidential
