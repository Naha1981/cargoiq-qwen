import assert from "node:assert/strict";
import { calculateDemurrage } from "../src/modules/investigation/demurrage.ts";
import { canTransitionProvenance } from "../src/modules/investigation/provenance.ts";

const result = calculateDemurrage({
  chargeStart: "2026-09-01",
  chargeEnd: "2026-09-07",
  freeDays: 2,
  dailyRateMinor: 185000,
  currency: "ZAR",
  weekendBillable: false,
});

assert.equal(result.totalDays, 7);
assert.equal(result.freeDaysApplied, 2);
assert.equal(result.chargeableDays, 3);
assert.equal(result.amountMinor, 555000);
assert.deepEqual(result.chargeableDates, [
  "2026-09-03",
  "2026-09-04",
  "2026-09-07",
]);

assert.equal(
  canTransitionProvenance("INFERRED", "VERIFIED"),
  false,
);
assert.equal(
  canTransitionProvenance("INFERRED", "VERIFIED", true),
  true,
);
assert.equal(
  canTransitionProvenance("DISPUTED", "INFERRED"),
  true,
);

console.log("CargoIQ investigation unit checks: PASS");
