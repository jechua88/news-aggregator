from typing import List, Dict, Any
from ..cache.base import NewsCacheBackend
from ..cache.in_memory import InMemoryNewsCache
from ..models.news_source import NewsSource
from ..models.news_headline import NewsHeadline, NewsHeadlineResponse
from ..models.source_config import SourceConfig
from .rss_service import RSSService
from .scraping_service import ScrapingService
import logging
from datetime import timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

logger = logging.getLogger(__name__)


class NewsService:
    """Service for aggregating news from multiple sources"""

    def __init__(
        self,
        cache: NewsCacheBackend | None = None,
        rss_service: RSSService | None = None,
        scraping_service: ScrapingService | None = None,
    ) -> None:
        self.cache: NewsCacheBackend = cache or InMemoryNewsCache()
        self._lock = threading.Lock()
        self.rss_service = rss_service or RSSService()
        self.scraping_service = scraping_service or ScrapingService()

    def fetch_all_news(self) -> Dict[str, Any]:
        """Fetch news from all sources"""
        try:
            # Check if cache is fresh
            if self.cache.is_fresh and self.cache.total_sources_count > 0:
                logger.info("Returning fresh cached data")
                return self._format_response()
            
            # Fetch fresh data
            logger.info("Fetching fresh data from all sources")
            self._refresh_all_sources()
            
            return self._format_response()
            
        except Exception as e:
            logger.error(f"Error in fetch_all_news: {e}")
            # Return cached data if available, otherwise empty response
            if self.cache.total_sources_count > 0:
                logger.info("Returning cached data due to error")
                return self._format_response()
            else:
                return {
                    "sources": [],
                    "total_sources": 0,
                    "active_sources": 0,
                    "last_updated": "2025-09-11T00:00:00Z",
                    "cache_status": "error"
                }

    def _refresh_all_sources(self):
        """Refresh data from all enabled sources in parallel"""
        sources = SourceConfig.get_enabled_sources()

        max_workers = min(8, max(1, len(sources)))
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(self._refresh_source, source): source for source in sources}
            for fut in as_completed(futures):
                src_obj = futures[fut]
                try:
                    fut.result()
                except Exception as e:
                    logger.error(f"Error refreshing source {src_obj.name}: {e}")
                    continue

        # Mark cache as refreshed
        self.cache.refresh()

    def _refresh_source(self, source: NewsSource):
        """Refresh data from a single source"""
        try:
            # Try RSS first
            headlines = self.rss_service.fetch_rss_feed(source)
            source.status = "active"
            source.last_updated = headlines[0].fetched_at if headlines else None
            
        except Exception as rss_error:
            logger.warning(f"RSS failed for {source.name}, trying scraping: {rss_error}")
            
            try:
                # Fallback to scraping
                headlines = self.scraping_service.scrape_headlines(source)
                source.status = "active"
                source.last_updated = headlines[0].fetched_at if headlines else None
                
            except Exception as scrape_error:
                logger.error(f"Both RSS and scraping failed for {source.name}: {scrape_error}")
                source.status = "error"
                headlines = []
        
        # Update source with headlines
        source.headlines = headlines
        source_with_headlines = source
        
        # Update cache (thread-safe)
        with self._lock:
            self.cache.update_source(source_with_headlines)

    def _format_response(self) -> Dict[str, Any]:
        """Format cached data for API response"""
        cached_sources = self.cache.get_all_sources()
        sources_response = []

        for source in cached_sources.values():
            source_response = {
                "name": source.name,
                "headlines": [
                    NewsHeadlineResponse(
                        title=headline.title,
                        link=headline.link,
                        published_at=headline.published_at.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z'),
                        source=headline.source
                    ).model_dump() for headline in source.headlines
                ],
                "status": source.status,
                "last_updated": (source.last_updated.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z') if source.last_updated else None),
                "story_count": len(source.headlines)
            }
            sources_response.append(source_response)
        
        total_sources = len(cached_sources)
        active_sources = sum(1 for src in cached_sources.values() if src.status == "active")

        return {
            "sources": sources_response,
            "total_sources": total_sources,
            "active_sources": active_sources,
            "last_updated": self.cache.last_refresh.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z'),
            "cache_status": self.cache.cache_status
        }

    def get_sources_config(self) -> List[Dict[str, Any]]:
        """Get source configuration"""
        sources = SourceConfig.get_source_configs()
        return [
            {
                "name": source.name,
                "rss_url": source.rss_url,
                "fallback_url": source.fallback_url,
                "enabled": source.enabled,
                "max_stories": source.max_stories
            }
            for source in sources
        ]

    def get_source_status(self, source_name: str) -> Dict[str, Any]:
        """Get status of a specific source"""
        # First check if source exists in configuration
        config_source = SourceConfig.get_source_by_name(source_name)
        if not config_source:
            raise ValueError(f"Source '{source_name}' not found")
        
        # Get cached status if available, otherwise use config
        cached_source = self.cache.get_source(source_name)
        source = cached_source if cached_source else config_source
        
        return {
            "source": source.name,
            "status": source.status,
            "error": None if source.status == "active" else f"Source has status: {source.status}",
            "last_attempt": self.cache.last_refresh.isoformat(),
            "last_success": source.last_updated.isoformat() if source.last_updated else None
        }

    def refresh_news(self) -> Dict[str, Any]:
        """Manually trigger news refresh"""
        try:
            sources = SourceConfig.get_enabled_sources()
            
            # Clear cache to force fresh fetch
            self.cache.clear()
            
            # Fetch fresh data
            self._refresh_all_sources()
            
            return {
                "message": "Refresh triggered successfully",
                "sources_to_refresh": len(sources)
            }
            
        except Exception as e:
            logger.error(f"Error in refresh_news: {e}")
            raise Exception(f"Error refreshing news: {e}")
