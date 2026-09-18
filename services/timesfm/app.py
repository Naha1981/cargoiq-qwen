from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Literal

import numpy as np
import timesfm
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from timesfm.timesfm_2p5.timesfm_2p5_torch import TimesFM_2p5_200M_torch


Frequency = Literal["DAILY", "WEEKLY", "MONTHLY", "INTRADAY"]


class HistoryPoint(BaseModel):
    timestamp: str
    value: float


class ForecastRequest(BaseModel):
    seriesId: str
    entityType: str
    entityId: str
    metric: str
    unit: str
    frequency: Frequency
    history: list[HistoryPoint] = Field(min_length=32, max_length=16384)
    horizon: int = Field(ge=1, le=1000)
    metadata: dict[str, object] | None = None


class ForecastPoint(BaseModel):
    timestamp: str
    value: float
    lower: float
    upper: float


class ForecastResponse(BaseModel):
    modelVersion: str
    points: list[ForecastPoint]
    limitations: list[str]


app = FastAPI(title="CargoIQ TimesFM Runtime", version="1.0.0")

_model: TimesFM_2p5_200M_torch | None = None


def load_model() -> TimesFM_2p5_200M_torch:
    global _model
    if _model is not None:
        return _model

    model_id = os.getenv(
        "TIMESFM_MODEL_ID",
        "google/timesfm-2.5-200m-pytorch",
    )

    model = TimesFM_2p5_200M_torch.from_pretrained(
        model_id,
        torch_compile=False,
    )
    model.compile(
        timesfm.ForecastConfig(
            max_context=16384,
            max_horizon=1000,
            normalize_inputs=True,
            use_continuous_quantile_head=True,
            force_flip_invariance=True,
            infer_is_positive=True,
            fix_quantile_crossing=True,
        )
    )
    _model = model
    return model


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": "timesfm-2.5-200m-pytorch"}


def _next_timestamp(value: datetime, frequency: Frequency) -> datetime:
    if frequency == "DAILY":
        return value + timedelta(days=1)
    if frequency == "WEEKLY":
        return value + timedelta(days=7)
    if frequency == "INTRADAY":
        raise ValueError("INTRADAY_STEP_NOT_CONFIGURED")
    # Monthly stepping without an extra dependency.
    month = value.month + 1
    year = value.year
    if month == 13:
        month = 1
        year += 1
    day = min(
        value.day,
        [31, 29 if year % 4 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1],
    )
    return value.replace(year=year, month=month, day=day)


def _to_iso(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


@app.post("/v1/forecast", response_model=ForecastResponse)
def forecast(request: ForecastRequest) -> ForecastResponse:
    timestamps = [datetime.fromisoformat(item.timestamp.replace("Z", "+00:00")) for item in request.history]
    values = np.asarray([item.value for item in request.history], dtype=np.float32)

    if len(values) < 32:
        raise HTTPException(status_code=400, detail="TIMESFM_MIN_CONTEXT_32")
    if not np.isfinite(values).all():
        raise HTTPException(status_code=400, detail="TIMESFM_NONFINITE_INPUT")
    if any(timestamps[i] >= timestamps[i + 1] for i in range(len(timestamps) - 1)):
        raise HTTPException(status_code=400, detail="TIMESFM_HISTORY_NOT_SORTED")

    if request.frequency == "INTRADAY":
        step_minutes = int((request.metadata or {}).get("stepMinutes", 0))
        if step_minutes <= 0:
            raise HTTPException(status_code=400, detail="INTRADAY_STEP_NOT_CONFIGURED")
        step = timedelta(minutes=step_minutes)
    else:
        step = None

    try:
        model = load_model()
        point_fc, quantile_fc = model.forecast(
            horizon=request.horizon,
            inputs=[values],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"TIMESFM_INFERENCE_FAILED:{exc}") from exc

    point_row = np.asarray(point_fc[0], dtype=float)
    quantile_row = np.asarray(quantile_fc[0], dtype=float)

    points: list[ForecastPoint] = []
    cursor = timestamps[-1]
    for index in range(request.horizon):
        cursor = (
            cursor + step
            if step is not None
            else _next_timestamp(cursor, request.frequency)
        )

        # TimesFM 2.5 quantile indices: 0=mean, 1=q10, 5=q50, 9=q90.
        mean_value = float(quantile_row[index, 0])
        q10 = float(quantile_row[index, 1])
        q50 = float(quantile_row[index, 5])
        q90 = float(quantile_row[index, 9])
        point_value = float(point_row[index])

        points.append(
            ForecastPoint(
                timestamp=_to_iso(cursor),
                value=q50 if np.isfinite(q50) else point_value,
                lower=q10 if np.isfinite(q10) else mean_value,
                upper=q90 if np.isfinite(q90) else point_value,
            )
        )

    return ForecastResponse(
        modelVersion="2.5-200M",
        points=points,
        limitations=[
            "TimesFM forecasts are predictive signals, not evidence.",
            "Forecast bands are model outputs and are not guarantees of operational outcomes.",
            "CargoIQ must independently verify events, contractual entitlement, and charges from evidence.",
        ],
    )
