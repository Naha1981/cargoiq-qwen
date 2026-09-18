# 50-Business Pilot Readiness — Internal Engineering Report

## Scope

This document is an internal engineering record. It is not customer-facing.

The objective is to establish evidence for 50-business pilot capacity without weakening production authentication or tenant isolation.

## Verified

### CargoIQ application gate

The CargoIQ `main` branch passed:

- investigation unit checks;
- forecasting checks;
- investigation vertical checks;
- TimesFM syntax check;
- Drizzle schema export;
- migration syntax check;
- production build;
- production server startup;
- Playwright investigation browser flow.

Latest verified `main` commit:

`e43cd2932a1ff06b4063a97869c5e5ab353de08b`

### NahaLLM concurrency

NahaLLM now reuses a shared upstream HTTP client and has a dedicated 50-concurrency regression test.

The test successfully completed 50 simultaneous requests.

Merged `main` commit:

`0023a33132d7128a1c05d72387107492ec698786`

### Neon database concurrency

A disposable Neon branch was created for this benchmark:

- project: `CargoIQ-evo`
- branch: `cargoiq-50-business-benchmark`

The benchmark created 50 isolated test tenants and 50 case records.

Five concurrent write batches of 10 completed successfully: 50/50 writes.

Five concurrent read batches of 10 completed successfully: 50/50 reads. One connector-side 401 occurred during the first attempt of read batch 3; the identical workload was retried successfully with 10/10 results.

Final integrity query:

- tenant count: 50
- tenants with exactly one case: 50
- tenant/case anomalies: 0

The tenant-scoped benchmark index is present.

## What this does not yet certify

The above proves the 50-request orchestration, NahaLLM concurrency behavior, and PostgreSQL tenant-scoped workload on a disposable branch.

It does not yet constitute a full production certification of:

- 50 simultaneous authenticated CargoIQ HTTP sessions through the deployed application;
- 50 simultaneous real PDF uploads;
- 50 simultaneous ClamAV scans;
- 50 simultaneous Gemini PDF extractions;
- 50 simultaneous AIS/Sentinel corroboration requests;
- Vercel production deployment of the latest commit.

The reusable authenticated 50-business CargoIQ runner is merged and ready. A true end-to-end production/staging run requires a deployed test target plus 50 valid test authentication tokens.

## NahaLLM role

NahaLLM is suitable as CargoIQ's shared AI gateway for text/LLM traffic and has now passed the 50-concurrent gateway test.

CargoIQ's evidence extraction path currently calls Gemini through the Vercel AI SDK directly because that path requires document/multimodal handling and structured evidence extraction. NahaLLM should only replace that path after an equivalent multimodal + structured-output contract is tested.

## Engineering conclusion

The system is materially stronger than the previous 10-business-only assessment.

The current evidence supports proceeding with a controlled pilot while the final authenticated staging load test remains an engineering gate for formal 50-business certification.
