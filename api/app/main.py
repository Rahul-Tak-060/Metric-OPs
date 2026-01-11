from __future__ import annotations

import json
from datetime import date
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .db import fetch_all, fetch_one
from .settings import settings

AllowedMetricKey = Literal["gross_sales", "orders_sold", "units_sold", "cancellation_rate"]
AllowedDimension = Literal["ship_state", "category", "fulfilment", "ship_service_level"]

app = FastAPI(
    title="MetricOps API",
    version="0.1.0",
    description="API over certified metrics, data quality, and why-changed explainability.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    # Also verifies DB connectivity
    row = fetch_one("select 1 as ok;")
    return {"status": "ok", "db": row["ok"] if row else None, "env": settings.APP_ENV}


@app.get("/metrics")
def metrics():
    rows = fetch_all(
        """
        select metric_key, metric_name, metric_type, source_relation, source_column, description
        from analytics.metrics_registry
        order by metric_key;
        """
    )
    return {"metrics": rows}


@app.get("/kpi-summary")
def kpi_summary(
    d1: Optional[date] = Query(default=None, description="Earlier date (YYYY-MM-DD)"),
    d2: Optional[date] = Query(default=None, description="Later date (YYYY-MM-DD)"),
):
    row = fetch_one(
        "select to_jsonb(t) as payload from analytics.get_kpi_delta_summary(%s, %s) t;",
        (d1, d2),
    )
    if not row:
        raise HTTPException(status_code=404, detail="No KPI summary returned.")
    return row["payload"]


@app.get("/why-changed")
def why_changed(
    metric_key: AllowedMetricKey = Query(...),
    dimension: AllowedDimension = Query(...),
    d1: Optional[date] = Query(default=None, description="Earlier date (YYYY-MM-DD)"),
    d2: Optional[date] = Query(default=None, description="Later date (YYYY-MM-DD)"),
    top_n: int = Query(default=25, ge=1, le=200),
):
    # metric_key and dimension already validated by Literal typing
    row = fetch_one(
        """
        select analytics.get_why_changed_payload(%s, %s, %s, %s, %s) as payload;
        """,
        (metric_key, dimension, d1, d2, top_n),
    )
    if not row:
        raise HTTPException(status_code=404, detail="No payload returned.")

    payload = row["payload"]

    # psycopg may return jsonb as dict already, or as string depending on setup
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse JSON payload: {e}")

    return payload


@app.get("/dq/latest")
def dq_latest():
    row = fetch_one(
        """
        with latest as (
          select max(run_id) as run_id
          from analytics.data_quality_runs
        )
        select
          r.run_id,
          r.run_ts,
          r.source,
          r.status,
          count(d.*) as checks_total,
          sum(case when d.passed then 1 else 0 end) as checks_passed,
          sum(case when not d.passed then 1 else 0 end) as checks_failed
        from latest
        join analytics.data_quality_runs r on r.run_id = latest.run_id
        join analytics.data_quality_results d on d.run_id = r.run_id
        group by r.run_id, r.run_ts, r.source, r.status;
        """
    )
    if not row:
        raise HTTPException(status_code=404, detail="No DQ runs found.")
    return row


@app.get("/dq/latest/failures")
def dq_latest_failures():
    rows = fetch_all(
        """
        with latest as (
          select max(run_id) as run_id
          from analytics.data_quality_runs
        )
        select
          d.severity,
          d.check_name,
          d.passed,
          d.metric_value,
          d.threshold_value,
          d.details,
          d.created_at
        from latest
        join analytics.data_quality_results d on d.run_id = latest.run_id
        where d.passed = false
        order by d.severity, d.check_name;
        """
    )
    return {"failures": rows}
