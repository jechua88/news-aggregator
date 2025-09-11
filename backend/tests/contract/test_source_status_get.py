import pytest
import httpx


@pytest.mark.asyncio
async def test_get_source_status_endpoint_exists():
    """Test that /api/sources/{source_name}/status endpoint exists"""
    # This test will fail because the endpoint doesn't exist yet
    source_name = "Wall Street Journal"
    
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get(f"/api/sources/{source_name}/status")
    
    # These assertions should fail until implementation
    assert response.status_code == 200
    data = response.json()
    
    # Validate response structure
    assert "source" in data
    assert "status" in data
    assert "last_attempt" in data
    
    # Should return the requested source
    assert data["source"] == source_name
    
    # Status should be one of expected values
    assert data["status"] in ["active", "error", "disabled"]


@pytest.mark.asyncio
async def test_get_source_status_not_found():
    """Test that /api/sources/{source_name}/status returns 404 for invalid source"""
    # This test will fail until we implement proper error handling
    invalid_source = "Nonexistent Source"
    
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get(f"/api/sources/{invalid_source}/status")
    
    # Should return 404 for invalid source
    assert response.status_code == 404
    data = response.json()
    
    # Should have error structure
    assert "error" in data
    assert "message" in data