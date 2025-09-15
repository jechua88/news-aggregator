from functools import lru_cache
from fastapi import Request
from .settings import Settings
from ..services.news_service import NewsService


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()


def get_news_service(request: Request) -> NewsService:
    if not hasattr(request.app.state, "news_service") or request.app.state.news_service is None:
        # Instantiate with app settings so timeouts/TTL apply consistently
        settings = getattr(request.app.state, "settings", get_settings())
        request.app.state.news_service = NewsService(settings=settings)
    return request.app.state.news_service
