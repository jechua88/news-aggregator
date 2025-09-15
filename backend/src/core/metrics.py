from __future__ import annotations

import os
from typing import Optional

try:
    from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
except Exception:  # pragma: no cover
    Counter = None  # type: ignore
    Histogram = None  # type: ignore
    generate_latest = None  # type: ignore
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"  # type: ignore


def _enabled() -> bool:
    return os.getenv("ENABLE_METRICS", "false").lower() in {"1", "true", "yes", "on"}


if _enabled() and Counter is not None and Histogram is not None:
    NEWS_FETCH_SUCCESS = Counter(
        "news_fetch_success_total", "Successful fetches", ["source", "method"]
    )
    NEWS_FETCH_FAILURE = Counter(
        "news_fetch_failure_total", "Failed fetches", ["source", "method"]
    )
    NEWS_CACHE_HIT = Counter("news_cache_hit_total", "Cache hits")
    FETCH_LATENCY = Histogram(
        "news_fetch_latency_seconds",
        "Fetch latency in seconds",
        ["source", "method"],
        buckets=(0.1, 0.3, 0.5, 1, 2, 5, 10),
    )
else:
    NEWS_FETCH_SUCCESS = None
    NEWS_FETCH_FAILURE = None
    NEWS_CACHE_HIT = None
    FETCH_LATENCY = None


def inc_success(source: str, method: str) -> None:
    if NEWS_FETCH_SUCCESS:
        NEWS_FETCH_SUCCESS.labels(source=source, method=method).inc()


def inc_failure(source: str, method: str) -> None:
    if NEWS_FETCH_FAILURE:
        NEWS_FETCH_FAILURE.labels(source=source, method=method).inc()


def inc_cache_hit() -> None:
    if NEWS_CACHE_HIT:
        NEWS_CACHE_HIT.inc()


def observe_latency(source: str, method: str, seconds: float) -> None:
    if FETCH_LATENCY:
        FETCH_LATENCY.labels(source=source, method=method).observe(seconds)


def metrics_response() -> Optional[bytes]:
    if not _enabled() or not generate_latest:
        return None
    return generate_latest()  # bytes

