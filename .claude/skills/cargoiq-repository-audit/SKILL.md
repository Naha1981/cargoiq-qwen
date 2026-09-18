---
name: cargoiq-repository-audit
description: Audit CargoIQ and God's Eye View before migration, refactoring or integration work.
---

# Repository audit

Inspect:
- app routes
- database
- auth
- tenant scope
- document processing
- financial logic
- tests
- background jobs
- external providers
- God’s Eye View layers
- voice actions
- source attribution
- secrets

Classify:
KEEP / REFACTOR / DEFER / REMOVE.

Do not delete code merely because it is unfamiliar.

Produce:
- architecture map
- feature inventory
- migration risks
- source/licence inventory
- security findings
