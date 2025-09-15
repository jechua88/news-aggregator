import os
os.environ.setdefault("SERVE_STATIC", "false")
import pytest
from httpx import AsyncClient
from src.main import create_app


@pytest.mark.asyncio
async def test_get_sources_endpoint_exists():
    """Test that /api/sources endpoint exists and returns source configuration"""
    # This test will fail because the endpoint doesn't exist yet
    app = create_app()
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.get("/api/sources")
    
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Should return array of source configurations
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Each source should have required fields
    for source in data:
        assert "name" in source
        assert "rss_url" in source
        assert "fallback_url" in source
        assert "enabled" in source
        assert "max_stories" in source
        
        # Validate max_stories range
        assert 5 <= source["max_stories"] <= 50
        
        # URLs should be valid
        assert source["rss_url"].startswith("http")
        assert source["fallback_url"].startswith("http")


@pytest.mark.asyncio
async def test_get_sources_handles_errors():
    """Test that /api/sources handles errors gracefully"""
    # This test will fail until we implement error handling
    app = create_app()
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.get("/api/sources")
    
    # Should handle errors gracefully
    assert response.status_code in [200, 500]
