---
name: cargoiq-evidence-model
description: Build CargoIQ's case, evidence, provenance, freight-event, contradiction and audit model.
---

# Evidence model

Every material claim needs:
- tenant
- case
- source
- source type
- source URL/document ID
- source location
- observed/retrieved time
- timezone
- extraction method
- model/version when AI is involved
- confidence
- provenance
- review state

Allowed provenance:
VERIFIED / DERIVED / INFERRED / DISPUTED / UNKNOWN.

An inferred or disputed claim must not silently become verified.

External observations are corroboration unless the source directly establishes the shipment-specific event.

Every correction creates an audit event.
