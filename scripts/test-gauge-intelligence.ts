import assert from "node:assert/strict"
import {
  confidenceStatus,
  confidenceToPercent,
  normalizeGaugeValue,
} from "../src/components/gauges/gauge-utils.ts"

assert.equal(normalizeGaugeValue(0, 0, 100), 0)
assert.equal(normalizeGaugeValue(50, 0, 100), 50)
assert.equal(normalizeGaugeValue(100, 0, 100), 100)
assert.equal(normalizeGaugeValue(-5, 0, 100), 0)
assert.equal(normalizeGaugeValue(105, 0, 100), 100)
assert.equal(normalizeGaugeValue("42.5", 0, 100), 42.5)
assert.equal(normalizeGaugeValue("not-a-number", 0, 100), null)
assert.equal(normalizeGaugeValue(50, 100, 0), null)

assert.equal(confidenceToPercent(0), 0)
assert.equal(confidenceToPercent("0.85"), 85)
assert.equal(confidenceToPercent(1), 100)
assert.equal(confidenceToPercent(null), null)
assert.equal(confidenceToPercent(""), null)
assert.equal(confidenceToPercent(1.1), null)
assert.equal(confidenceToPercent(-0.1), null)

assert.equal(confidenceStatus(95), "healthy")
assert.equal(confidenceStatus(80), "healthy")
assert.equal(confidenceStatus(60), "watch")
assert.equal(confidenceStatus(40), "attention")
assert.equal(confidenceStatus(0), "critical")
assert.equal(confidenceStatus(null), "critical")

console.log("Gauge intelligence checks passed.")
