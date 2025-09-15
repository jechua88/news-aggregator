import feedparser
import requests
from ..core.http_client import get_shared_session
from typing import List, Optional
from datetime import datetime
from ..models.news_headline import NewsHeadline
from ..models.news_source import NewsSource
import logging

logger = logging.getLogger(__name__)


class RSSService:
    """Service for fetching RSS feeds"""

    def __init__(self, timeout: int = 10, retries: int = 2, backoff: float = 0.3):
        self.timeout = timeout
        # Use shared session for efficiency; retries/backoff configured centrally
        self.session = get_shared_session()

    def fetch_rss_feed(self, source: NewsSource) -> List[NewsHeadline]:
        """Fetch and parse RSS feed for a given source"""
        try:
            logger.info(f"Fetching RSS feed for {source.name}: {source.rss_url}")
            
            # Fetch RSS feed
            response = self.session.get(
                source.rss_url, 
                timeout=self.timeout,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/rss+xml, application/xml, text/xml',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            )
            response.raise_for_status()
            
            # Parse RSS feed
            feed = feedparser.parse(response.content)
            
            headlines = []
            # Process all entries first, then sort and limit
            for entry in feed.entries:
                try:
                    # Parse publication date
                    published_at = self._parse_published_date(entry)
                    
                    headline = NewsHeadline(
                        title=entry.get('title', 'No title'),
                        link=entry.get('link', ''),
                        published_at=published_at,
                        source=source.name
                    )
                    headlines.append(headline)
                    
                except Exception as e:
                    logger.warning(f"Error parsing entry for {source.name}: {e}")
                    continue
            
            # Sort by publication date (most recent first) and limit
            headlines.sort(key=lambda x: x.published_at, reverse=True)
            headlines = headlines[:source.max_stories]
            
            logger.info(f"Successfully fetched {len(headlines)} headlines from {source.name} (sorted by freshness)")
            return headlines
            
        except requests.Timeout:
            logger.error(f"Timeout fetching RSS feed for {source.name}")
            raise Exception(f"Timeout fetching RSS feed for {source.name}")
        except requests.RequestException as e:
            logger.error(f"Error fetching RSS feed for {source.name}: {e}")
            raise Exception(f"Error fetching RSS feed for {source.name}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error fetching RSS feed for {source.name}: {e}")
            raise Exception(f"Unexpected error fetching RSS feed for {source.name}: {e}")

    def _parse_published_date(self, entry) -> datetime:
        """Parse publication date from RSS entry"""
        try:
            # Try different date fields
            date_fields = ['published_parsed', 'updated_parsed']
            
            for field in date_fields:
                if hasattr(entry, field):
                    time_struct = getattr(entry, field)
                    if time_struct:
                        return datetime(*time_struct[:6])
            
            # Fallback to current time
            logger.warning("No date found in RSS entry, using current time")
            return datetime.now()
            
        except Exception as e:
            logger.warning(f"Error parsing date from RSS entry: {e}, using current time")
            return datetime.now()
