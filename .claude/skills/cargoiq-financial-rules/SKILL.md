---
name: cargoiq-financial-rules
description: Implement deterministic, versioned freight-dispute calculations and historical currency conversion.
---

# Financial rules

AI may extract candidate:
- dates
- rates
- currencies
- identifiers

AI must not own the final calculation.

Every result stores:
- rule ID
- rule version
- formula version
- input claim IDs
- charge start/end
- free time
- rate
- currency
- weekend/holiday rule
- assumptions
- unknowns
- result

Separate:
charged / calculated / evidence-supported / potential recovery / recovered.

Use integer minor units or decimal arithmetic, never floating-point money.
Historical FX requires an explicit rate date and source.
