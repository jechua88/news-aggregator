# Research: Financial News Aggregator

**Date**: 2025-09-11  
**Feature**: Financial News Aggregator  
**Status**: Complete

## Research Findings

### RSS Feed Research
**Decision**: Use RSS feeds as primary method, fallback to scraping
**Rationale**: RSS feeds are more reliable, easier to parse, and less likely to break than website scraping. Provides structured data with built-in metadata like publication dates.
**Alternatives considered**: Web scraping-only approach (rejected due to maintenance overhead), dedicated news APIs (costly for 8 sources).

### Python RSS Libraries
**Decision**: Use `feedparser` as primary, `requests` for fallback scraping
**Rationale**: `feedparser` is mature, well-maintained, and specifically designed for RSS parsing. `requests` handles HTTP connections gracefully with error handling.
**Alternatives considered**: `BeautifulSoup` (better for scraping, weaker for RSS), `lxml` (faster but more complex).

### Frontend Stack
**Decision**: React 18+ with TypeScript, Tailwind CSS
**Rationale**: React provides excellent component architecture for responsive layouts. TypeScript adds type safety. Tailwind CSS enables rapid styling with utility-first approach.
**Alternatives considered**: Vue.js (smaller ecosystem), Svelte (less mature), plain CSS (more development time).

### Backend Architecture
**Decision**: FastAPI with async/await, scheduled tasks
**Rationale**: FastAPI provides automatic API documentation, async support for concurrent requests, and built-in validation. Scheduled tasks handle 15-minute refresh cycles.
**Alternatives considered**: Flask (less async support), Django (heavier framework), plain HTTP server (more manual work).

### Error Handling Strategy
**Decision**: Graceful degradation with caching
**Rationale**: Network failures should not break the entire application. Cache data during successful fetches to continue serving stale data during outages.
**Alternatives considered**: Strict error handling (would cause complete failures), infinite retries (could cause cascading failures).

### Data Storage
**Decision**: In-memory cache with simple data structures
**Rationale**: News data is transient and doesn't require persistent storage. In-memory cache provides fastest access times for the web interface.
**Alternatives considered**: SQLite (overkill for transient data), Redis (external dependency complexity), database (unnecessary complexity).

### Refresh Cycle
**Decision**: 15-minute intervals with jitter
**Rationale**: Regular updates ensure fresh data while avoiding excessive requests. Jitter prevents thundering herd problems when all sources refresh simultaneously.
**Alternatives considered**: 5-minute intervals (more frequent requests, may trigger rate limits), 30-minute intervals (stale data).

### Testing Strategy
**Decision**: pytest for backend, React Testing Library for frontend
**Rationale**: Comprehensive testing framework coverage with good mocking capabilities. React Testing Library focuses on user behavior rather than implementation details.
**Alternatives considered**: Jest (React-focused but less integration), unittest (built-in but less feature-rich), Cypress (E2E only).

## Technology Dependencies

### Backend Dependencies
- **fastapi**: Web framework with automatic documentation
- **uvicorn**: ASGI server for FastAPI
- **feedparser**: RSS feed parsing
- **requests**: HTTP client for fallback scraping
- **pydantic**: Data validation and serialization
- **python-dotenv**: Environment variable management

### Frontend Dependencies
- **react**: UI library for building components
- **react-dom**: DOM rendering for React
- **typescript**: Type safety for JavaScript
- **tailwindcss**: Utility-first CSS framework
- **axios**: HTTP client for API calls

### Development Dependencies
- **pytest**: Python testing framework
- **react-testing-library**: React component testing
- **typescript**: TypeScript compiler
- **prettier**: Code formatting

## Implementation Patterns

### RSS Fetching Pattern
1. Try RSS feed URL first
2. Fall back to scraping if RSS fails
3. Parse with feedparser for RSS, BeautifulSoup for scraping
4. Extract headline, link, publication date
5. Validate and sanitize data
6. Cache results

### Error Handling Pattern
1. Try operation with timeout
2. Catch specific exceptions
3. Log error with context
4. Return cached data if available
5. Skip source if both RSS and scraping fail
6. Continue with other sources

### Frontend Component Pattern
1. Create reusable NewsSource component
2. Props: source name, headlines array, loading state, error state
3. Handle click events for article links
4. Responsive design with Tailwind CSS
5. Loading states and error handling

## API Endpoints

### GET /api/news
**Purpose**: Retrieve all news headlines from all sources
**Response**: JSON array of news sources with their headlines
**Status**: 200 on success, 206 if some sources failed

### Source Configuration
Each source will have:
- name: Display name
- rss_url: Primary RSS feed URL
- fallback_url: Fallback scraping URL
- enabled: Boolean to enable/disable source
- max_stories: Maximum number of stories to fetch (5-10)

## Data Structures

### NewsHeadline
```typescript
interface NewsHeadline {
  title: string;
  link: string;
  published_at: string; // ISO 8601 format
  source: string;
}
```

### NewsSource
```typescript
interface NewsSource {
  name: string;
  headlines: NewsHeadline[];
  status: 'active' | 'error' | 'disabled';
  last_updated: string;
}
```

## Performance Considerations

- API response time target: <2 seconds
- Frontend render time: <500ms
- Cache invalidation on successful fetch
- Parallel fetching of all sources
- Timeout for individual source requests (10 seconds)

## Security Considerations

- Validate all RSS feed content
- Sanitize scraped content
- Use HTTPS for all external requests
- Handle rate limiting gracefully
- No user authentication required (public data)

## Research Complete ✅

All NEEDS CLARIFICATION have been resolved. The technology stack and implementation patterns are well-defined. Ready for Phase 1 (Design & Contracts).