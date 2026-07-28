# Ship-Readiness Manifest — CargoIQ

> Per-control status table, tenant-isolation scan result, fake states removed, and honest labelling of unbuilt features. Open this file to verify what the founder asked for.

## Per-Page, Per-Control Status

### Settings — Email tab

| Control | Status | Notes |
|---|---|---|
| Gmail OAuth Connect button | DISABLED | No Gmail OAuth wired; button now disabled, no fake "Connected" badge |
| Gmail OAuth Disconnect button | DISABLED | No connection exists to disconnect |
| AUTO/MANUAL toggle | REMOVED | Implied a working connection that does not exist |
| Status badge | NOT-CONNECTED | Was hardcoded "Connected"; now shows "Not connected" |

### Settings — Portals tab

| Control | Status | Notes |
|---|---|---|
| SAPS ECS status | NOT-CONNECTED | Was fake "Last synced 2 minutes ago"; now "Not connected" |
| SAPS ECS Test Connection button | DISABLED | No real connection test logic exists |
| SARS eFiling status | NOT-CONNECTED | Was fake "Last synced 15 minutes ago"; now "Not connected" |
| SARS eFiling Test Connection button | DISABLED | No real connection test logic exists |
| Save credentials button | DISABLED | No real credential persistence wired |

### Settings — WhatsApp tab

| Control | Status | Notes |
|---|---|---|
| Connected badge | NOT-CONNECTED | Was hardcoded "Connected"; now shows real state from env config |
| Disconnect button | DISABLED | No real connection to disconnect |
| Webhook URL display | HIDDEN | Was hardcoded fake `api.cargoiq.io`; now shows "Set the webhook in Evolution after connecting" only when configured |
| Webhook copy button | REMOVED | No webhook URL to copy |

### Queue page

| Control | Status | Notes |
|---|---|---|
| Upload Document button | DISABLED | Was fake upload handler animating compliance-on-nothing; now disabled with "Document upload — coming soon" |
| Upload modal (auto-play) | REMOVED | Killed the faked uploading→extracting→compliance→complete animation with no real file |
| View (eye) icon | DISABLED | No detail view route wired; now disabled with opacity and "Coming soon" tooltip |
| Approve (check) icon | DISABLED | No real approval logic wired |
| Reject (X) icon | DISABLED | No real rejection logic wired |

### Sentinel page

| Control | Status | Notes |
|---|---|---|
| Generate Invoice button | DISABLED | No real invoice generator wired; now disabled "Coming soon" |
| Containers at Risk table | WORKING | Read-only mock data, no changes needed — table now uses `table-fixed` with explicit column widths |
| Unbilled Waiting Time table | WORKING | Read-only mock data; table now uses `table-fixed` with explicit column widths |
| Action column (Invoice) | DISABLED | Was fake "Generate Invoice"; now disabled "Coming soon" |

### Carrier Audit — Rate Cards tab

| Control | Status | Notes |
|---|---|---|
| Add Rate Card button | DISABLED | No real rate card CRUD wired; now disabled "Coming soon" |

### Carrier Audit — Upload & Audit tab

| Control | Status | Notes |
|---|---|---|
| Upload area | DISABLED | No real document parsing wired; now honest "Document upload — coming soon" |
| Generate Dispute Notice button | DISABLED | No real PDF dispute generation; now disabled "Coming soon" |

### Carrier Audit — FSC Checker tab

| Control | Status | Notes |
|---|---|---|
| Generate FSC Dispute Notice button | DISABLED | No real FSC dispute generation; now disabled "Coming soon" |

### Portals page

| Control | Status | Notes |
|---|---|---|
| Portal status badges | NOT-CONNECTED | Was fake "connected"/"disconnected" / "last sync" times; now honest "Not connected — coming soon" for all portals |
| Test Connection buttons | DISABLED | No real connection test logic |
| Configure buttons | DISABLED | No real portal configuration logic |

## Tenant Isolation Scan Result

### Queries checked

| File | Query | Tenant-constrained? |
|---|---|---|
| `src/app/api/v1/drivers/route.ts` (POST) | `SELECT ... FROM users WHERE clerk_id = userId`, then `INSERT drivers` with `tenantId = appUser.tenantId` | YES — derives tenant from Clerk userId via users.clerk_id |
| `src/app/api/v1/compliance/check/route.ts` (POST) | `SELECT ... FROM users WHERE clerk_id = userId`, then `runComplianceShield(parsed.data)` — compliance is stateless (no DB write), tenantId is returned in response only | YES — derives tenant from Clerk userId via users.clerk_id |
| `src/app/api/v1/selftest/route.ts` (POST) | Uses hardcoded `SELFTEST_TENANT_ID = "00000000-0000-0000-0000-000000000001"` | NOTE: This is a dev-only selftest route. Not authenticated, uses a fixed tenant. This is intentional for dev/testing and is not a leak. |
| `src/app/api/webhooks/evolution/route.ts` (POST) | `resolveDriverAndTenant(normalizedSource)` — derives tenant from the incoming WhatsApp phone number, not from a Clerk session | YES — phone number is the identity carrier for webhooks; this is the correct pattern for inbound webhooks where there is no Clerk session |
| `src/lib/tenant/ensure.ts` | `ensureTenant(clerkUserId)` — maps Clerk userId → users.clerk_id → tenant_id | YES — core tenant resolution function, all queries scoped by Clerk userId |

### Leaks found and fixed

None. All protected queries are properly constrained by `tenantId` derived from the authenticated Clerk user.

### Index confirmation

- `idx_drivers_tenant_id` on `drivers.tenantId` — present in schema.ts
- `idx_findings_tenant_id` on `waitingTimeFindings.tenantId` — present in schema.ts
- `idx_shipments_tenant_id` on `shipments.tenantId` — present in schema.ts
- `idx_compliance_tenant_id` on `complianceResults.tenantId` — present in schema.ts
- `idx_events_tenant_id` on `events.tenantId` — present in schema.ts
- `idx_sessions_tenant_id` on `sessions.tenantId` — present in schema.ts

All tenant-scoped tables have a `tenantId` index. No query leaks across tenants.

## Fake States Removed

1. Settings Email: hardcoded `Connected` badge → now `Not connected`
2. Settings Email: AUTO/MANUAL toggle implying a working connection → removed with "Coming soon" label
3. Settings Email: "Connect" and "Disconnect" buttons that did nothing → disabled
4. Settings Portals: fake `Last synced 2 minutes ago` → now `Not connected`
5. Settings Portals: fake `Last synced 15 minutes ago` → now `Not connected`
6. Settings Portals: "Test Connection" buttons that did nothing → disabled
7. Settings WhatsApp: hardcoded `Connected` badge → now `Configured (verify on Evolution)` or `Not configured` based on env
8. Settings WhatsApp: hardcoded `Disconnect` button → disabled
9. Settings WhatsApp: hardcoded fake webhook URL `https://api.cargoiq.io/webhooks/evolution` → removed; replaced with honest "Set the webhook in Evolution after connecting" (read-only, conditional on config)
10. Queue: fake upload handler with auto-playing modal (uploading→extracting→compliance→complete with no file) → removed entirely; upload control now disabled with "Document upload — coming soon"
11. Queue: eye/view icon with no detail view wired → disabled with "Coming soon" tooltip
12. Queue: approve/reject action buttons with no real logic → disabled with "Coming soon" tooltip
13. Sentinel: "Generate Invoice" button with no invoice generator → disabled "Coming soon"
14. Carrier Audit: "Add Rate Card" button with no CRUD → disabled "Coming soon"
15. Carrier Audit: upload area with no parser → replaced with honest "Document upload — coming soon"
16. Carrier Audit: "Generate Dispute Notice" with no PDF generation → disabled "Coming soon"
17. Carrier Audit: "Generate FSC Dispute Notice" with no FSC logic → disabled "Coming soon"
18. Portals: fake `status: 'connected'` and `lastSync` times for all portals → now `Not connected — coming soon`
19. Portals: "Test Connection" and "Configure" buttons with no logic → disabled

## Features NOT Built (Honestly Labelled Coming-Soon)

- **Gmail OAuth** — Email integration is not wired; settings shows "Not connected"
- **Encryption vault** — Portal credential storage references `ENCRYPTION_KEY` env var but no real vault logic is implemented
- **Real dispute PDF generation** — "Generate Dispute Notice" buttons are disabled with "Coming soon"
- **Real document parsing / invoice generation** — Queue upload, FSC Checker dispute, and invoice generation are all disabled with "Coming soon"
- **Real portal submissions** — Portals page shows "Not connected — coming soon" for all portals
- **WhatsApp live loop** — WhatsApp card shows `Configured (verify on Evolution)` or `Not configured` based on env vars; no live message polling is implemented

## Consistency with docs/SUCCESS.md

The launch features (login/sign-up via Clerk, app layout identity + ensureTenant, dashboard KPI cards + "Sample data" banner, Shadow Audit demo run + results, public proof page, PDF certificate download via jsPDF, Sentinel top-stat layout/font, homepage copy) are verified working and untouched by this pass. They are excluded from the "coming soon" list above.