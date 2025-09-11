from datetime import datetime, timedelta
from typing import Dict, Optional
from .news_source import NewsSource


class NewsCache:
    """In-memory cache for news data"""
    
    def __init__(self):
        self.sources: Dict[str, NewsSource] = {}
        self.last_refresh: datetime = datetime.now() - timedelta(minutes=16)  # Start stale
        self._refresh_interval: int = 15  # minutes

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
        self.sources[source.name] = source
        self.last_refresh = datetime.now()

    def get_source(self, name: str) -> Optional[NewsSource]:
        """Get a source from cache"""
        return self.sources.get(name)

    def get_all_sources(self) -> Dict[str, NewsSource]:
        """Get all sources from cache"""
        return self.sources.copy()

    def refresh(self):
        """Mark cache as refreshed"""
        self.last_refresh = datetime.now()

    def clear(self):
        """Clear all cached data"""
        self.sources.clear()
        self.last_refresh = datetime.now() - timedelta(minutes=16)  # Mark as stale

    @property
    def active_sources_count(self) -> int:
        """Count of active sources"""
        return sum(1 for source in self.sources.values() if source.status == "active")

    @property
    def total_sources_count(self) -> int:
        """Total number of sources"""
        return len(self.sources)