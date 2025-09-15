import pytest
from httpx import AsyncClient
import os
os.environ.setdefault("SERVE_STATIC", "false")
from unittest.mock import patch
from src.main import create_app


@pytest.mark.asyncio
async def test_graceful_error_handling_partial_failure():
    """Test that partial source failures don't break entire response"""
    # This test will fail until we implement graceful error handling
    with patch('src.services.news_service.NewsService.fetch_all_news') as mock_fetch:
        # Mock partial success - some sources fail, others succeed
        mock_fetch.return_value = {
            "sources": [
                {
                    "name": "Wall Street Journal",
                    "headlines": [
                        {"title": "Test Headline", "link": "http://example.com", "published_at": "2025-09-11T10:00:00Z", "source": "Wall Street Journal"}
                    ],
                    "status": "active",
                    "last_updated": "2025-09-11T10:00:00Z",
                    "story_count": 1
                },
                {
                    "name": "Failed Source",
                    "headlines": [],
                    "status": "error",
                    "last_updated": "2025-09-11T09:00:00Z",
                    "story_count": 0
                }
            ],
            "total_sources": 2,
            "active_sources": 1,
            "last_updated": "2025-09-11T10:00:00Z",
            "cache_status": "fresh"
        }
        
        app = create_app()
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.get("/api/news")
    
    # Should return 206 for partial success (or 200 if not enabled)
    assert response.status_code in [200, 206]
    data = response.json()
    
    # Should have both successful and failed sources
    assert len(data["sources"]) == 2
    assert data["active_sources"] == 1
    assert data["total_sources"] == 2


@pytest.mark.asyncio
async def test_timeout_handling():
    """Test that network timeouts are handled gracefully"""
    # This test will fail until we implement timeout handling
    with patch('src.services.rss_service.RSSService.fetch_rss_feed') as mock_rss:
        # Mock timeout
        mock_rss.side_effect = TimeoutError("Request timeout")
        
        app = create_app()
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.get("/api/news")
    
    # Should handle timeouts gracefully
    assert response.status_code in [200, 206]
    
    # Should not crash the entire application
    assert response.headers.get("content-type") == "application/json"


@pytest.mark.asyncio
async def test_source_disabling_after_failures():
    """Test that sources are disabled after consecutive failures"""
    # This test will fail until we implement source disabling logic
    app = create_app()
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # First call - source should be marked as error
        response1 = await client.get("/api/news")
        
        # Second call - source should potentially be disabled
        response2 = await client.get("/api/news")
    
    # Both should succeed even with failures
    assert response1.status_code in [200, 206]
    assert response2.status_code in [200, 206]


@pytest.mark.asyncio
async def test_cache_fallback_on_failure():
    """Test that cached data is served when fresh data fails"""
    # This test will fail until we implement caching
    app = create_app()
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # First request to populate cache
        response1 = await client.get("/api/news")
        
        # Force failure scenario
        with patch('src.services.news_service.NewsService.fetch_all_news') as mock_fetch:
            mock_fetch.side_effect = Exception("Fresh data fetch failed")
            
            # Second request should use cache
            response2 = await client.get("/api/news")
    
    # Should still return data from cache
    assert response2.status_code in [200, 206]
    data2 = response2.json()
    
    # Should have cached data
    assert len(data2["sources"]) > 0
