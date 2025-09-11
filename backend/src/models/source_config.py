from typing import List, Dict, Any, Optional
from .news_source import NewsSource


class SourceConfig:
    """Configuration for news sources"""
    
    SOURCES: List[Dict[str, Any]] = [
        {
            "name": "Wall Street Journal",
            "rss_url": "https://feeds.wsj.com/rss/market_news",
            "fallback_url": "https://www.wsj.com/news/markets",
            "enabled": True,
            "max_stories": 10
        },
        {
            "name": "Bloomberg",
            "rss_url": "https://www.bloomberg.com/feed/rss/markets",
            "fallback_url": "https://www.bloomberg.com/markets",
            "enabled": True,
            "max_stories": 10
        },
        {
            "name": "CNBC",
            "rss_url": "https://www.cnbc.com/id/100003114/device/rss/rss.html",
            "fallback_url": "https://www.cnbc.com/markets/",
            "enabled": True,
            "max_stories": 10
        },
        {
            "name": "DealStreetAsia",
            "rss_url": "https://www.dealstreetasia.com/feed/",
            "fallback_url": "https://www.dealstreetasia.com/",
            "enabled": True,
            "max_stories": 8
        },
        {
            "name": "The Business Times (Singapore)",
            "rss_url": "https://www.businesstimes.com.sg/rss.xml",
            "fallback_url": "https://www.businesstimes.com.sg/",
            "enabled": True,
            "max_stories": 8
        },
        {
            "name": "The Edge (Malaysia)",
            "rss_url": "https://www.theedgemalaysia.com/rss.xml",
            "fallback_url": "https://www.theedgemalaysia.com/",
            "enabled": True,
            "max_stories": 8
        },
        {
            "name": "South China Morning Post",
            "rss_url": "https://www.scmp.com/rss/feeds/latest",
            "fallback_url": "https://www.scmp.com/",
            "enabled": True,
            "max_stories": 10
        }
    ]

    @classmethod
    def get_source_configs(cls) -> List[NewsSource]:
        """Get all source configurations as NewsSource objects"""
        return [NewsSource(**config) for config in cls.SOURCES]

    @classmethod
    def get_enabled_sources(cls) -> List[NewsSource]:
        """Get only enabled source configurations"""
        return [source for source in cls.get_source_configs() if source.enabled]

    @classmethod
    def get_source_by_name(cls, name: str) -> Optional[NewsSource]:
        """Get source configuration by name"""
        for source in cls.get_source_configs():
            if source.name == name:
                return source
        return None