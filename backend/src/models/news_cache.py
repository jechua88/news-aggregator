from datetime import datetime, timedelta
from typing import Dict, Optional
from threading import Lock
from .news_source import NewsSource


class NewsCache:
    """In-memory cache for news data (thread-safe)."""

    def __init__(self, refresh_interval_minutes: int = 15):
        self._lock = Lock()
        self.sources: Dict[str, NewsSource] = {}
        self.last_refresh: datetime = datetime.now() - timedelta(minutes=refresh_interval_minutes + 1)
        self._refresh_interval: int = refresh_interval_minutes  # minutes

    @property
    def is_fresh(self) -> bool:
        """Check if cache data is fresh"""
        time_diff = datetime.now() - self.last_refresh
        return time_diff.total_seconds() < (self._refresh_interval * 60)

    @property
    def cache_status(self) -> str:
        """Get cache status"""
        return "fresh" if self.is_fresh else "stale"

    def update_source(self, source: NewsSource):
        """Update a source in the cache"""
        with self._lock:
            self.sources[source.name] = source
            # Do not update global last_refresh here to avoid marking cache fresh mid-refresh

    def get_source(self, name: str) -> Optional[NewsSource]:
        """Get a source from cache"""
        with self._lock:
            return self.sources.get(name)

    def get_all_sources(self) -> Dict[str, NewsSource]:
        """Get all sources from cache"""
        with self._lock:
            return self.sources.copy()

    def refresh(self):
        """Mark cache as refreshed"""
        with self._lock:
            self.last_refresh = datetime.now()

    def clear(self):
        """Clear all cached data"""
        with self._lock:
            self.sources.clear()
            self.last_refresh = datetime.now() - timedelta(minutes=self._refresh_interval + 1)

    @property
    def active_sources_count(self) -> int:
        """Count of active sources"""
        with self._lock:
            return sum(1 for source in self.sources.values() if source.status == "active")

    @property
    def total_sources_count(self) -> int:
        """Total number of sources"""
        with self._lock:
            return len(self.sources)
