import assert from "node:assert/strict";
import { buildForecastSignal } from "../src/modules/forecasting/risk.ts";
import type { ForecastResult } from "../src/modules/forecasting/types.ts";

const result: ForecastResult = {
  engine: "TIMESFM",
  modelVersion: "2.5-test",
  seriesId: "container-dwell-ABC123",
  generatedAt: "2026-09-18T07:00:00.000Z",
  points: [
    { timestamp: "2026-09-19", value: 4.2, lower: 3.6, upper: 4.8 },
    { timestamp: "2026-09-20", value: 7.1, lower: 5.8, upper: 8.4 },
  ],
  limitations: ["Synthetic test forecast."],
};

const signal = buildForecastSignal(result, {
  entityType: "CONTAINER",
  entityId: "ABC123",
  threshold: {
    metric: "dwell_days",
    threshold: 6,
    scale: 4,
    signalType: "EXPOSURE_RISK",
    horizonStart: "2026-09-19T00:00:00.000Z",
    horizonEnd: "2026-09-20T23:59:59.999Z",
    expectedAmountMinor: "925000",
    currency: "ZAR",
  },
});

assert.ok(signal);
assert.equal(signal.peakForecastValue, 7.1);
assert.equal(signal.peakUpperValue, 8.4);
assert.equal(signal.provenance, "INFERRED");
assert.equal(signal.requiresInvestigation, true);
assert.equal(signal.score, 0.6);

const noSignal = buildForecastSignal(result, {
  entityType: "CONTAINER",
  entityId: "ABC123",
  threshold: {
    metric: "dwell_days",
    threshold: 10,
    scale: 4,
    signalType: "DELAY_RISK",
    horizonStart: "2026-09-19T00:00:00.000Z",
    horizonEnd: "2026-09-20T23:59:59.999Z",
  },
});

assert.equal(noSignal, null);

console.log("CargoIQ forecasting unit checks: PASS");
