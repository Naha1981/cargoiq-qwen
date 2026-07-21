# CargoIQ Playwright Test Report

**Date/Time:** 2026-07-21 23:57 UTC+2  
**Base URL:** http://localhost:3000 (local dev server)  
**OS:** win32

## Summary

| Status | Count |
|--------|-------|
| Passed | 8 |
| Failed | 1 |
| Skipped | 0 |

**Verdict:** 1 ISSUE FOUND — see below

## Results

| Test Name | Status | Duration |
|-----------|--------|----------|
| API health › health endpoint returns healthy | ✅ | 1.8s |
| Homepage › hero shows the real number (not R0) | ✅ | 17.1s |
| Homepage › no forbidden claims anywhere | ✅ | 12.1s |
| Homepage › corrected copy is present | ✅ | 9.5s |
| Homepage › pricing tiers render | ✅ | 9.4s |
| Homepage › how-it-works names real checks | ✅ | 12.5s |
| Proof page › public proof page needs no login | ❌ | 12.4s |
| Queue page › queue loads and shows shipments | ✅ | 30.5s |
| Shadow Audit › demo audit runs and shows results | ✅ | 19.3s |

## Failure Details

### Proof page › public proof page needs no login

- **Test file:** e2e/proof-page.spec.ts:4
- **Expected:** Page shows R88,400 exposure, findings detail, and no 404.
- **Actual:** Page renders "Proof not found / This proof link is invalid or has expired." and contains a Next.js 404 error page in the HTML.
- **Root cause:** `src/app/proof/[token]/page.tsx` accesses `params.token` synchronously. Next.js 15+ requires `params` to be awaited because it is a Promise. This runtime error prevents the demo token from resolving, so the page falls back to the "Proof not found" state.
- **Screenshot:** `test-results/proof-page-Proof-page-public-proof-page-needs-no-login/test-failed-1.png`
- **Trace:** `test-results/proof-page-Proof-page-public-proof-page-needs-no-login/trace.zip`

## Other Notes

- `npm run build` fails pre-existingly due to `normalizePhoneNumber` missing from `src/lib/utils.ts` (used by `src/app/api/v1/drivers/route.ts` and `src/app/api/v1/selftest/route.ts`). This is unrelated to Playwright.
- Playwright HTML report generated at: `playwright-report/index.html`

## Screenshot Paths

- `test-results/proof-page-Proof-page-public-proof-page-needs-no-login/test-failed-1.png`
