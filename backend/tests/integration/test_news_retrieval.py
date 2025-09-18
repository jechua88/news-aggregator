import pytest
from datetime import datetime, timedelta


@pytest.mark.asyncio
async def test_news_retrieval_from_all_sources(async_client):
    """Test that news retrieval works from all configured sources"""
    # This test will fail until we implement the news service
    response = await async_client.get("/api/news")
    
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Should have data from sources
    assert len(data["sources"]) > 0
    
    # At least some sources should be active
    assert data["active_sources"] > 0
    
    # Each active source should have headlines
    active_sources = [s for s in data["sources"] if s["status"] == "active"]
    active_with_headlines = [s for s in active_sources if len(s["headlines"]) > 0]
    assert len(active_with_headlines) > 0

    for source in active_with_headlines:
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
async def test_news_data_freshness(async_client):
    """Test that news data is reasonably fresh"""
    # This test will fail until we implement timestamp handling
    response = await async_client.get("/api/news")
    
    assert response.status_code == 200
    data = response.json()
    
    # Last updated should be recent (within 15 minutes)
    last_updated = datetime.fromisoformat(data["last_updated"].replace("Z", "+00:00"))
    now = datetime.now(last_updated.tzinfo)
    time_diff = now - last_updated
    
    # Data should be fresh or stale but not too old
    assert time_diff.total_seconds() < 1800  # 30 minutes max
    
    # Headlines should be from last 7 days
    for source in data["sources"]:
        for headline in source["headlines"]:
            pub_date = datetime.fromisoformat(headline["published_at"].replace("Z", "+00:00"))
            pub_diff = now - pub_date
            assert pub_diff.total_seconds() < 604800  # 7 days
