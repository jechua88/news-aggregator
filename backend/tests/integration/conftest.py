import os
from datetime import datetime, timezone
from pathlib import Path

import httpx
import pytest

os.environ.setdefault("SCHEDULER_ENABLED", "false")


# Ensure the static directory exists so FastAPI's StaticFiles mount does not fail during tests.
BACKEND_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = BACKEND_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

from src.main import app
from src.models.news_headline import NewsHeadline
from src.services.rss_service import RSSService
from src.services.scraping_service import ScrapingService


@pytest.fixture(autouse=True)
def stub_external_fetch(monkeypatch):
    """Prevent network access during tests by returning deterministic headlines."""

    def _fake_fetch(self, source):
        return [
            NewsHeadline(
                title=f"{source.name} sample headline",
                link="https://example.com/article",
                published_at=datetime.now(timezone.utc),
                source=source.name,
            )
        ]

    monkeypatch.setattr(RSSService, "fetch_rss_feed", _fake_fetch)
    monkeypatch.setattr(ScrapingService, "scrape_headlines", _fake_fetch)
    yield


@pytest.fixture
async def async_client():
    """Provide an HTTPX async client bound to the FastAPI app with startup/shutdown lifecycle."""
    lifespan = app.router.lifespan_context(app)
    await lifespan.__aenter__()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
    await lifespan.__aexit__(None, None, None)
