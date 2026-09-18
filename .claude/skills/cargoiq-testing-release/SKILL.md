---
name: cargoiq-testing-release
description: Verify CargoIQ investigation workflows, security, financial reproducibility, source honesty and production readiness.
---

# Testing and release

A feature is incomplete until:
- positive path passes;
- negative path passes;
- failure path passes;
- unknown state is handled;
- tenant boundary is tested;
- source/licence state is recorded;
- real persisted data drives the result.

Financial tests must prove deterministic repeatability.

Release blockers:
- cross-tenant access
- leaked secrets
- fake live states
- unsupported verified claims
- irreproducible money
- missing evidence links
- unreviewed commercial-data restrictions
