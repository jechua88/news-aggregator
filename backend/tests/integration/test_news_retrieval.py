import pytest
import httpx
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_news_retrieval_from_all_sources():
    """Test that news retrieval works from all configured sources"""
    # This test will fail until we implement the news service
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/api/news")
    
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Should have data from sources
    assert len(data["sources"]) > 0
    
    # At least some sources should be active
    assert data["active_sources"] > 0
    
    # Each active source should have headlines
    active_sources = [s for s in data["sources"] if s["status"] == "active"]
    for source in active_sources:
        assert len(source["headlines"]) > 0
        assert len(source["headlines"]) <= source["max_stories"]
        
        # Each headline should have required fields
        for headline in source["headlines"]:
            assert "title" in headline
            assert "link" in headline
            assert "published_at" in headline
            assert "source" in headline
            
            # Validate headline data
            assert len(headline["title"]) > 0
            assert headline["link"].startswith("http")
            assert headline["source"] == source["name"]


@pytest.mark.asyncio
async def test_news_data_freshness():
    """Test that news data is reasonably fresh"""
    # This test will fail until we implement timestamp handling
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/api/news")
    
    assert response.status_code == 200
    data = response.json()
    
    # Last updated should be recent (within 15 minutes)
    last_updated = datetime.fromisoformat(data["last_updated"])
    now = datetime.now(last_updated.tzinfo)
    time_diff = now - last_updated
    
    # Data should be fresh or stale but not too old
    assert time_diff.total_seconds() < 1800  # 30 minutes max
    
    # Headlines should be from last 7 days
    for source in data["sources"]:
        for headline in source["headlines"]:
            pub_date = datetime.fromisoformat(headline["published_at"])
            pub_diff = now - pub_date
            assert pub_diff.total_seconds() < 604800  # 7 days