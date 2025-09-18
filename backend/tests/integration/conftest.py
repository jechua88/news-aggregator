from pathlib import Path

import httpx
import pytest


# Ensure the static directory exists so FastAPI's StaticFiles mount does not fail during tests.
BACKEND_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = BACKEND_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

from src.main import app


@pytest.fixture
async def async_client():
    """Provide an HTTPX async client bound to the FastAPI app with startup/shutdown lifecycle."""
    await app.router.startup()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
    await app.router.shutdown()
