# CargoIQ TimesFM Runtime

This small service is the model runtime behind CargoIQ's server-side ForecastEngine adapter.

## Model

Default checkpoint:

`google/timesfm-2.5-200m-pytorch`

TimesFM 2.5 is the current open-weight baseline used by CargoIQ for commercial experimentation. CargoIQ does not load model weights inside the Next.js application.

## Run

Install the dependencies, then:

```bash
uvicorn app:app --host 0.0.0.0 --port 8001
```

CargoIQ then points to:

```
TIMESFM_BASE_URL=http://127.0.0.1:8001
```

## Input contract

CargoIQ sends at least 32 ordered historical observations for the series and asks for a bounded forecast horizon.

The runtime returns:
- median/point forecast
- q10 lower band
- q90 upper band
- model version
- explicit limitations

## Operational guardrails

- CPU-first; no GPU is assumed.
- Keep the model runtime separate from the web application.
- Do not expose this service publicly without authentication/network controls.
- Do not use forecasts as evidence.
- Review model-weight licensing before changing checkpoints.

## Source

https://github.com/google-research/timesfm
