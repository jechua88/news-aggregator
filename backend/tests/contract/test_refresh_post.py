import os
os.environ.setdefault("SERVE_STATIC", "false")
import pytest
from httpx import AsyncClient
from src.main import create_app


@pytest.mark.asyncio
async def test_post_refresh_endpoint_exists():
    """Test that /api/refresh endpoint exists and triggers refresh"""
    # This test will fail because the endpoint doesn't exist yet
    app = create_app()
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # Determine configured source count
        sources_resp = await client.get("/api/sources")
        sources_data = sources_resp.json()
        configured_count = len(sources_data)
        response = await client.post("/api/refresh")
    
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Validate response structure
    assert "message" in data
    assert "sources_to_refresh" in data
    
    # Should indicate refresh was triggered
    assert data["message"] == "Refresh triggered successfully"
    assert isinstance(data["sources_to_refresh"], int)
    assert data["sources_to_refresh"] == configured_count


@pytest.mark.asyncio
async def test_post_refresh_handles_errors():
    """Test that /api/refresh handles errors gracefully"""
    # This test will fail until we implement error handling
    app = create_app()
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post("/api/refresh")
    
    # Should handle errors gracefully
    assert response.status_code in [200, 500]
    
    if response.status_code == 500:
        data = response.json()
        assert "detail" in data
