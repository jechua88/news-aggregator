import feedparser
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import List
from datetime import datetime, timezone
import calendar
from email.utils import parsedate_to_datetime
from ..models.news_headline import NewsHeadline
from ..models.news_source import NewsSource
import logging

logger = logging.getLogger(__name__)


class RSSService:
    """Service for fetching RSS feeds with connection pooling and retries"""

    MAX_STORY_AGE_SECONDS = 2592000  # 30 days

    def __init__(self, timeout: int = 10, pool_maxsize: int = 100):
        self.timeout = timeout
        self.session = requests.Session()
        retries = Retry(
            total=2,
            backoff_factor=0.2,
            status_forcelist=[502, 503, 504],
            allowed_methods=["GET", "HEAD"],
        )
        adapter = HTTPAdapter(pool_connections=pool_maxsize, pool_maxsize=pool_maxsize, max_retries=retries)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'Accept-Language': 'en-US,en;q=0.9',
        }

    def fetch_rss_feed(self, source: NewsSource) -> List[NewsHeadline]:
        """Fetch and parse RSS feed for a given source"""
        try:
            logger.info(f"Fetching RSS feed for {source.name}: {source.rss_url}")

            # Fetch RSS feed using pooled session
            response = self.session.get(
                source.rss_url,
                timeout=(2, self.timeout),
                headers=self.headers,
            )
            response.raise_for_status()

            # Parse RSS feed (feedparser works directly on bytes)
            feed = feedparser.parse(response.content)

            headlines: List[NewsHeadline] = []
            # Process all entries first, then sort and limit
            for entry in feed.entries:
                try:
                    # Parse publication date
                    published_at = self._parse_published_date(entry)

                    # Skip stale headlines before model validation to reduce noise
                    now = datetime.now(timezone.utc)
                    if (now - published_at).total_seconds() > self.MAX_STORY_AGE_SECONDS:
                        logger.debug(
                            "Skipping stale headline for %s (published %s)",
                            source.name,
                            published_at.isoformat(),
                        )
                        continue

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
        """Parse publication date from RSS entry as UTC-aware datetime"""
        try:
            # Prefer parsed struct_time from feedparser (convert to UTC)
            if hasattr(entry, 'published_parsed') and getattr(entry, 'published_parsed'):
                ts = calendar.timegm(getattr(entry, 'published_parsed'))
                return datetime.fromtimestamp(ts, tz=timezone.utc)
            if hasattr(entry, 'updated_parsed') and getattr(entry, 'updated_parsed'):
                ts = calendar.timegm(getattr(entry, 'updated_parsed'))
                return datetime.fromtimestamp(ts, tz=timezone.utc)

            # Try string dates via RFC parser
            if hasattr(entry, 'published') and getattr(entry, 'published'):
                dt = parsedate_to_datetime(getattr(entry, 'published'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)
            if hasattr(entry, 'updated') and getattr(entry, 'updated'):
                dt = parsedate_to_datetime(getattr(entry, 'updated'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc)

            # Fallback to now in UTC
            logger.warning("No date found in RSS entry, using current time (UTC)")
            return datetime.now(timezone.utc)

        except Exception as e:
            logger.warning(f"Error parsing date from RSS entry: {e}, using current time (UTC)")
            return datetime.now(timezone.utc)
