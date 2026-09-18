# CargoIQ → God’s Eye View adapter

CargoIQ now exposes a signed, case-scoped scene endpoint:

`GET /api/v1/investigations/{caseId}/scene?token={short-lived-token}`

The scene payload contains:
- case metadata;
- source-linked evidence claims;
- contradiction records;
- deterministic calculation result;
- AIS observations;
- Sentinel scene metadata;
- source/provenance/limitation fields.

## Intended GEV adapter

The GEV adapter should be a small source/layer integration. It should not copy CargoIQ's database or investigation logic.

### Browser contract

CargoIQ opens:

`{GEV_URL}/?cargoiqCase={caseId}&cargoiqToken={token}&cargoiqApi={CargoIQ origin}`

The GEV application should:
1. detect these query parameters during startup;
2. fetch the signed CargoIQ scene payload server-side or through the browser using the short-lived token;
3. render case observation points in the existing Cesium scene;
4. enable the existing AIS vessel layer for live context when appropriate;
5. show a CargoIQ evidence/provenance panel;
6. preserve the distinction between evidence claims and external corroboration.

### Recommended GEV layer

Use a dedicated layer ID:

`cargoiq-investigation`

Layer record contract:
- `entityId`
- `caseId`
- `observationType`
- `observedAt`
- `latitude`
- `longitude`
- `provenance`
- `sourceId`
- `limitation`
- `payload`

This is deliberately compatible with the existing GEV layer lifecycle (`init`, `enable`, `update`, `disable`, `destroy`).

### Existing GEV reuse

The upstream GEV repository already has:
- a modular layer catalog;
- an AIS live-vessels layer;
- source attribution infrastructure;
- Cesium scene/camera ownership;
- evidence-focused vessel seams.

CargoIQ should feed case observations into a dedicated layer rather than altering the AIS source of truth.

### Current repository limitation

The connected GitHub integration has read access to `bilawalsidhu/gods-eye-view` but does not have push permission. Therefore this adapter specification is committed here and the CargoIQ scene endpoint is complete; the upstream GEV code change remains a separate repository change.

Do not treat an unmodified GEV checkout as already integrated.
