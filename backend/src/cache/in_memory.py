from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from ..models.news_source import NewsSource


class InMemoryNewsCache:
    """In-memory cache for news data."""

    def __init__(self, refresh_interval_minutes: int = 15):
        self.sources: Dict[str, NewsSource] = {}
        self.last_refresh: datetime = datetime.now(timezone.utc) - timedelta(minutes=refresh_interval_minutes + 1)
        self._refresh_interval: int = refresh_interval_minutes

    @property
    def is_fresh(self) -> bool:
        """Check if cache data is fresh"""
        time_diff = datetime.now(timezone.utc) - self.last_refresh
        return time_diff.total_seconds() < (self._refresh_interval * 60)

    @property
    def cache_status(self) -> str:
        """Get cache status"""
        return "fresh" if self.is_fresh else "stale"

    def update_source(self, source: NewsSource):
        """Update a source in the cache"""
        self.sources[source.name] = source
        self.last_refresh = datetime.now(timezone.utc)

    def get_source(self, name: str) -> Optional[NewsSource]:
        """Get a source from cache"""
        return self.sources.get(name)

    def get_all_sources(self) -> Dict[str, NewsSource]:
        """Get all sources from cache"""
        return self.sources.copy()

    def refresh(self):
        """Mark cache as refreshed"""
        self.last_refresh = datetime.now(timezone.utc)

    def clear(self):
        """Clear all cached data"""
        self.sources.clear()
        self.last_refresh = datetime.now(timezone.utc) - timedelta(minutes=16)  # Mark as stale

    @property
    def active_sources_count(self) -> int:
        """Count of active sources"""
        return sum(1 for source in self.sources.values() if source.status == "active")

    @property
    def total_sources_count(self) -> int:
        """Total number of sources"""
        return len(self.sources)
