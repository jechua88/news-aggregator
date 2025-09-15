from typing import List, Dict, Any, Optional
from .news_source import NewsSource
import json
import os


class SourceConfig:
    """Configuration for news sources"""
    
    SOURCES: List[Dict[str, Any]] = [
        {
            "name": "Bloomberg",
            "rss_url": "https://feeds.bloomberg.com/markets/news.rss",
            "fallback_url": "https://www.bloomberg.com/markets",
            "enabled": True,
            "max_stories": 50
        },
        {
            "name": "The Business Times (Singapore)",
            "rss_url": "https://www.businesstimes.com.sg/rss.xml",
            "fallback_url": "https://www.businesstimes.com.sg/",
            "enabled": True,
            "max_stories": 50
        },
        {
            "name": "CNBC",
            "rss_url": "https://www.cnbc.com/id/100003114/device/rss/rss.html",
            "fallback_url": "https://www.cnbc.com/markets/",
            "enabled": True,
            "max_stories": 50
        },
        {
            "name": "South China Morning Post",
            "rss_url": "https://www.scmp.com/rss/4/feed",
            "fallback_url": "https://www.scmp.com/business",
            "enabled": True,
            "max_stories": 50
        },
        {
            "name": "Financial Times",
            "rss_url": "https://www.ft.com/markets?format=rss",
            "fallback_url": "https://www.ft.com/markets",
            "enabled": True,
            "max_stories": 30
        },
        {
            "name": "Wall Street Journal",
            "rss_url": "https://feeds.content.dowjones.io/public/rss/mw_topstories",
            "fallback_url": "https://www.marketwatch.com/",
            "enabled": True,
            "max_stories": 30
        }
    ]

    @classmethod
    def get_source_configs(cls) -> List[NewsSource]:
        """Get all source configurations as NewsSource objects"""
        # Allow optional external config via env var SOURCES_CONFIG_PATH
        path = os.getenv("SOURCES_CONFIG_PATH")
        if path and os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict) and "sources" in data:
                    data = data["sources"]
                if isinstance(data, list):
                    return [NewsSource(**config) for config in data]
            except Exception:
                # Fallback to built-in config if external parsing fails
                pass
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
