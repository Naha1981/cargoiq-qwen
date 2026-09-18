# CargoIQ ↔ God's Eye View Integration

## System boundary

CargoIQ is the system of record.

God's Eye View is the 3D investigation surface.

CargoIQ owns:
- cases
- shipments
- containers
- evidence
- claims
- freight events
- contradictions
- commercial rules
- calculations
- approvals
- audit

God's Eye View supplies:
- Cesium globe
- camera movement
- map/entity rendering
- live contextual layers
- voice/action interaction
- visual timeline

## Current contract

```
GET /api/v1/investigations/{caseId}/geospatial
```

The response contains case-scoped observation entities with:
- entityId
- observationType
- observedAt
- retrievedAt
- latitude
- longitude
- provenance
- confidence
- sourceId
- limitation
- provider payload

## Integration sequence

1. CargoIQ authenticates the investigator.
2. CargoIQ resolves tenant membership.
3. CargoIQ returns only observations for that tenant/case.
4. God’s Eye View renders the observations.
5. Selecting an observation links back to its source/provenance.
6. Timeline navigation focuses the globe.
7. Provider secrets remain server-side.

## First target scene

Durban port / container terminal investigation.

The first useful scene should be able to show:
- case location
- freight events
- vessel movement
- permitted satellite observation
- weather context
- public port/terminal context
- source/provenance state
- financial effect

## Rendering truth

Use visual states consistently:

- VERIFIED: verified label + solid visual treatment
- DERIVED: derived label
- INFERRED: inferred label
- DISPUTED: disputed label
- UNKNOWN: unknown label

Do not use colour alone.

## Data-source rule

God’s Eye View already has server-side provider boundaries and source attribution. CargoIQ must preserve those boundaries rather than calling external provider APIs directly from the browser.

## Next implementation

Build a dedicated CargoIQ GEV adapter that reads this case endpoint and converts the observations into the existing GEV source/layer contract.

Do not copy the whole GEV repository into CargoIQ.
