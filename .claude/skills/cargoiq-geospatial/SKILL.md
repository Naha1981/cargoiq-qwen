---
name: cargoiq-geospatial
description: Integrate CargoIQ investigations with God’s Eye View and Cesium as a tenant-scoped visual evidence layer.
---

# Geospatial investigation

CargoIQ is the system of record.

God’s Eye View provides:
- Cesium globe
- camera/navigation
- geospatial layer rendering
- AIS/CCTV/traffic/context presentation
- voice action surface
- visual timeline interaction

Every map observation must expose:
- case
- event/observation ID
- time
- source
- provenance
- confidence
- financial effect when applicable
- evidence link
- limitations

Never treat AIS as container availability, satellite detection as cargo discharge, weather as responsibility, traffic as exact gate time, or a general port notice as shipment-specific proof.

Provider secrets stay server-side.
