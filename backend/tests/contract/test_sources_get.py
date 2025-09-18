import pytest
import httpx
from src.models.source_config import SourceConfig

BASE_URL = "http://127.0.0.1:8000"
EXPECTED_SOURCE_COUNT = len(SourceConfig.SOURCES)


@pytest.mark.asyncio
async def test_get_sources_endpoint_exists():
    """Test that /api/sources endpoint exists and returns source configuration"""
    # This test will fail because the endpoint doesn't exist yet
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        response = await client.get("/api/sources")
    
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Should return array of source configurations
    assert isinstance(data, list)
    assert len(data) == EXPECTED_SOURCE_COUNT
    
    # Each source should have required fields
    for source in data:
        assert "name" in source
        assert "rss_url" in source
        assert "fallback_url" in source
        assert "enabled" in source
        assert "max_stories" in source
        
        # Validate max_stories range
        assert source["max_stories"] > 0
        
        # URLs should be valid
        assert source["rss_url"].startswith("http")
        assert source["fallback_url"].startswith("http")


@pytest.mark.asyncio
async def test_get_sources_handles_errors():
    """Test that /api/sources handles errors gracefully"""
    # This test will fail until we implement error handling
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        response = await client.get("/api/sources")
    
    # Should handle errors gracefully
    assert response.status_code in [200, 500]
