# TimesFM Integration Policy

## Role in CargoIQ

TimesFM is a ForecastEngine, not an evidence engine.

The forecast layer may identify:
- elevated future dwell-time conditions
- likely free-time breaches
- future waiting-time pressure
- unusual operational patterns
- forecasted financial-exposure conditions

A forecast can create an **INFERRED investigation signal**. It cannot establish that an operational event happened, that a carrier charge is valid/invalid, or that money is recoverable.

## Architecture

Operational series -> ForecastEngine -> ForecastResult -> deterministic thresholding -> ForecastSignal -> investigation queue -> evidence investigation

The provider is replaceable:

- TimesFM
- Statistical forecast engine
- Another commercially licensed forecasting model

CargoIQ's evidence domain remains independent of the forecasting provider.

## Current TimesFM licensing guardrail

As of September 18, 2026, the upstream TimesFM repository documents TimesFM 3.0 as the latest model, but states that its default pretrained weights are currently under a separate non-commercial license and are restricted from commercial/production use.

The same upstream repository documents TimesFM 2.5 weights as Apache-2.0.

Therefore CargoIQ must not enable TimesFM 3.0 default pretrained weights for commercial production unless the applicable licensing terms are changed or a commercially licensed checkpoint is used.

Source:
https://github.com/google-research/timesfm

## Runtime boundary

The Next.js application does not load the forecasting model directly.

Instead:

CargoIQ Next.js
-> server-side ForecastEngine adapter
-> TIMESFM_BASE_URL
-> dedicated forecasting runtime

This keeps Python/model dependencies, compute requirements, and provider credentials outside the core CargoIQ web process.

## Investigation rule

The agent may say:

> "This series crossed the configured forecast threshold; investigate container ABC123."

The agent must not say:

> "Container ABC123 incurred demurrage."

The second statement requires evidence from the investigation engine.

## Required metadata

Every persisted forecast run must retain:
- engine
- model version
- generation time
- input series reference
- horizon
- forecast points
- quantile/band metadata when supplied
- limitations
- source-data snapshot/hash
- thresholding policy version

Forecast output must remain distinguishable from evidence claims.
