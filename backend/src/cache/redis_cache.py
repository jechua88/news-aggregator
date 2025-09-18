from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

try:
    import redis  # type: ignore
except ImportError as exc:  # pragma: no cover - redis optional
    redis = None  # type: ignore

from ..models.news_source import NewsSource

logger = logging.getLogger(__name__)


class RedisNewsCache:
    """Redis-backed cache for news data."""

    def __init__(
        self,
        url: str,
        namespace: str = "news_cache",
        refresh_interval_minutes: int = 15,
    ) -> None:
        if redis is None:
            raise RuntimeError("redis package is required for RedisNewsCache")

        self.client = redis.Redis.from_url(url, decode_responses=True)
        self.namespace = namespace.rstrip(":")
        self._refresh_interval = refresh_interval_minutes

    # Keys -----------------------------------------------------------------
    @property
    def _sources_key(self) -> str:
        return f"{self.namespace}:sources"

    @property
    def _timestamp_key(self) -> str:
        return f"{self.namespace}:last_refresh"

    # Helpers ---------------------------------------------------------------
    def _load_sources(self) -> Dict[str, NewsSource]:
        payload = self.client.get(self._sources_key)
        if not payload:
            return {}
        data = json.loads(payload)
        return {name: NewsSource.model_validate(model) for name, model in data.items()}

    def _store_sources(self, sources: Dict[str, NewsSource]) -> None:
        payload = {name: source.model_dump() for name, source in sources.items()}
        self.client.set(self._sources_key, json.dumps(payload))

    def _get_last_refresh(self) -> datetime:
        value = self.client.get(self._timestamp_key)
        if value:
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                logger.warning("Invalid last_refresh timestamp in redis: %s", value)
        return datetime.now(timezone.utc) - timedelta(minutes=self._refresh_interval + 1)

    def _set_last_refresh(self, ts: datetime) -> None:
        self.client.set(self._timestamp_key, ts.isoformat())

    # Protocol implementation ----------------------------------------------
    @property
    def last_refresh(self) -> datetime:
        return self._get_last_refresh()

    @property
    def is_fresh(self) -> bool:
        return datetime.now(timezone.utc) - self.last_refresh < timedelta(minutes=self._refresh_interval)

    @property
    def cache_status(self) -> str:
        return "fresh" if self.is_fresh else "stale"

    def update_source(self, source: NewsSource) -> None:
        sources = self._load_sources()
        sources[source.name] = source
        self._store_sources(sources)
        self._set_last_refresh(datetime.now(timezone.utc))

    def get_source(self, name: str) -> Optional[NewsSource]:
        sources = self._load_sources()
        return sources.get(name)

    def get_all_sources(self) -> Dict[str, NewsSource]:
        return self._load_sources()

    def refresh(self) -> None:
        self._set_last_refresh(datetime.now(timezone.utc))

    def clear(self) -> None:
        self.client.delete(self._sources_key)
        self.client.delete(self._timestamp_key)

    @property
    def active_sources_count(self) -> int:
        return sum(1 for source in self._load_sources().values() if source.status == "active")

    @property
    def total_sources_count(self) -> int:
        return len(self._load_sources())

