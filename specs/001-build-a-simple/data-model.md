# Data Model: Financial News Aggregator

**Date**: 2025-09-11  
**Feature**: Financial News Aggregator  

## Core Entities

### NewsSource
**Purpose**: Represents a financial news publication that provides headlines
```python
class NewsSource:
    name: str                   # Display name (e.g., "Wall Street Journal")
    rss_url: str                # Primary RSS feed URL
    fallback_url: str           # Fallback scraping URL
    enabled: bool               # Whether source is active
    max_stories: int           # Maximum stories to fetch (5-10)
    last_updated: datetime      # Last successful fetch time
    status: str                # Current status: 'active', 'error', 'disabled'
```

**Validation Rules**:
- `name` must be non-empty and unique
- `rss_url` must be valid URL if enabled
- `max_stories` must be between 5 and 10
- `enabled` defaults to True

### NewsHeadline
**Purpose**: Individual news article with metadata
```python
class NewsHeadline:
    title: str                 # Headline text
    link: str                  # URL to full article
    published_at: datetime     # Publication timestamp
    source: str               # Source name (reference to NewsSource)
    fetched_at: datetime      # When this headline was fetched
```

**Validation Rules**:
- `title` must be non-empty and reasonably sized (< 500 chars)
- `link` must be valid URL
- `published_at` must be recent (< 7 days ago)
- `source` must match existing NewsSource.name

### NewsCache
**Purpose**: In-memory cache for news data
```python
class NewsCache:
    sources: dict[str, NewsSource]  # Map of source name to NewsSource
    last_refresh: datetime          # When cache was last updated
    is_fresh: bool                 # Whether data is within refresh interval
```

**State Transitions**:
- `is_fresh` becomes False after 15 minutes from `last_refresh`
- Cache is invalidated on successful fetch

## API Data Models

### NewsHeadlineResponse
```python
class NewsHeadlineResponse:
    title: str
    link: str
    published_at: str  # ISO 8601 format
    source: str
```

### NewsSourceResponse
```python
class NewsSourceResponse:
    name: str
    headlines: list[NewsHeadlineResponse]
    status: str
    last_updated: str  # ISO 8601 format
    story_count: int
```

### NewsAggregatorResponse
```python
class NewsAggregatorResponse:
    sources: list[NewsSourceResponse]
    total_sources: int
    active_sources: int
    last_updated: str  # ISO 8601 format
    cache_status: str
```

## Configuration Model

### SourceConfig
```python
class SourceConfig:
    SOURCES = [
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
```

## Error Handling Models

### ErrorResponse
```python
class ErrorResponse:
    error: str
    message: str
    timestamp: str
    details: dict = {}
```

### SourceStatusResponse
```python
class SourceStatusResponse:
    source: str
    status: str
    error: str = None
    last_attempt: str
    last_success: str = None
```

## Database Schema (if needed in future)

### news_sources table
```sql
CREATE TABLE news_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    rss_url VARCHAR(500) NOT NULL,
    fallback_url VARCHAR(500),
    enabled BOOLEAN DEFAULT true,
    max_stories INTEGER DEFAULT 8 CHECK (max_stories >= 5 AND max_stories <= 10),
    last_updated TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
```

### news_headlines table
```sql
CREATE TABLE news_headlines (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) REFERENCES news_sources(name),
    title TEXT NOT NULL,
    link VARCHAR(500) NOT NULL,
    published_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Data Flow

1. **Configuration Loading**: Load SourceConfig from environment/file
2. **RSS Fetching**: Try RSS URL for each enabled source
3. **Fallback Scraping**: If RSS fails, try fallback URL with BeautifulSoup
4. **Data Validation**: Parse and validate NewsHeadline objects
5. **Caching**: Store in NewsCache with timestamp
6. **API Response**: Return structured data via endpoints
7. **Error Handling**: Log errors and continue with other sources

## Performance Considerations

- Use Pydantic for fast validation and serialization
- In-memory cache for millisecond access times
- Async operations for concurrent source fetching
- Lazy loading of headlines when requested
- Cache invalidation on successful refresh

## Data Quality Rules

- Headlines must have titles > 10 characters and < 500 characters
- Links must use HTTPS protocol
- Published dates must be within last 7 days
- Duplicate headlines (same title + source) must be deduplicated
- Sources failing 3 consecutive times are automatically disabled