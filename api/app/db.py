from __future__ import annotations

from typing import Any, Optional

import psycopg
from psycopg.rows import dict_row

from .settings import settings


def get_conn() -> psycopg.Connection:
    # short-lived connections are fine for Day 8 MVP
    # later we can add pooling (psycopg_pool)
    return psycopg.connect(settings.db_dsn, row_factory=dict_row)


def fetch_one(sql: str, params: Optional[tuple[Any, ...]] = None) -> dict[str, Any] | None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            row = cur.fetchone()
            return row


def fetch_all(sql: str, params: Optional[tuple[Any, ...]] = None) -> list[dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            rows = cur.fetchall()
            return list(rows)
