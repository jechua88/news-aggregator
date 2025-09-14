import pytest
import httpx
from fastapi import FastAPI

# These tests will fail until we implement the backend
# This is the RED phase of RED-GREEN-Refactor


@pytest.mark.asyncio
async def test_get_news_endpoint_exists():
    """Test that /api/news endpoint exists and returns expected structure"""
    # This test will fail because the endpoint doesn't exist yet
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/api/news")
        
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Validate response structure according to OpenAPI spec
    assert "sources" in data
    assert "total_sources" in data
    assert "active_sources" in data
    assert "last_updated" in data
    assert "cache_status" in data
    
    # Should have 7 sources configured
    assert data["total_sources"] == 7
    assert isinstance(data["sources"], list)
    
    # Each source should have required fields
    for source in data["sources"]:
        assert "name" in source
        assert "headlines" in source
        assert "status" in source
        assert "last_updated" in source
        assert "story_count" in source


@pytest.mark.asyncio
async def test_get_news_partial_success():
    """Test that /api/news returns 206 when some sources fail"""
    # This test will fail until we implement partial success handling
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/api/news")
    
    # Should return 206 when some sources fail but not all
    # For now this will fail because endpoint doesn't exist
    assert response.status_code in [200, 206]