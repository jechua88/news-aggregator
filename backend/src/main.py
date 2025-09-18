from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .api import news_routes, refresh_routes, sources_routes, status_routes
from .cache import InMemoryNewsCache
from .core.settings import Settings, get_settings
from .services.news_service import NewsService
from .services.scheduler import RefreshScheduler

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent.parent
STATIC_DIR = BASE_DIR.parent / "static"
STATIC_ASSETS_DIR = STATIC_DIR / "static"


def load_environment() -> None:
    for candidate in [REPO_ROOT / "config/app/backend.env", BASE_DIR.parent / ".env"]:
        if candidate.exists():
            load_dotenv(candidate, override=False)


load_environment()

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)


def _build_cache(settings: Settings) -> InMemoryNewsCache:
    from .cache import InMemoryNewsCache

    if settings.cache_backend.lower() == "redis" and settings.redis_url:
        try:
            from .cache.redis_cache import RedisNewsCache

            logger.info("Using RedisNewsCache backend")
            return RedisNewsCache(
                url=settings.redis_url,
                refresh_interval_minutes=settings.refresh_interval_minutes,
            )
        except Exception as exc:
            logger.warning("redis backend unavailable (%s); falling back to in-memory", exc)

    return InMemoryNewsCache(refresh_interval_minutes=settings.refresh_interval_minutes)


def _ensure_static_dir() -> None:
    STATIC_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    cache = _build_cache(settings)
    news_service = NewsService(cache=cache)

    scheduler = None
    if settings.scheduler_enabled and settings.refresh_interval_minutes > 0:
        scheduler = RefreshScheduler(
            refresh_fn=news_service.fetch_all_news,
            interval_seconds=settings.refresh_interval_minutes * 60,
            initial_delay_seconds=settings.scheduler_initial_delay_seconds,
        )
        scheduler.start()

    app.state.settings = settings
    app.state.news_service = news_service
    app.state.cache = cache
    app.state.scheduler = scheduler

    try:
        yield
    finally:
        if scheduler:
            scheduler.stop()


app = FastAPI(
    title="Financial News Aggregator API",
    description="API for fetching and managing financial news headlines from multiple sources",
    version="1.0.0",
    lifespan=lifespan,
)

# Include API routes
app.include_router(news_routes.router, prefix="/api")
app.include_router(sources_routes.router, prefix="/api")
app.include_router(status_routes.router, prefix="/api")
app.include_router(refresh_routes.router, prefix="/api")

_ensure_static_dir()
if STATIC_ASSETS_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_ASSETS_DIR)), name="frontend-static")
else:
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="frontend-static")

# Add CORS middleware for frontend communication
cors_origins = get_settings().cors_origin_list or ["https://news.jechua.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
    
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalError",
            "message": "An internal error occurred",
            "timestamp": time.time(),
            "details": {"path": str(request.url)}
        }
    )

@app.get("/", include_in_schema=False)
async def serve_frontend_root():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {
        "message": "Financial News Aggregator API",
        "documentation": "/docs",
    }


@app.get("/api")
async def api_index():
    return {
        "message": "Welcome to News Aggregator API",
        "version": "1.0.0",
        "endpoints": {
            "news": "/api/news",
            "sources": "/api/sources",
            "source_status": "/api/sources/{source_name}/status",
            "refresh": "/api/refresh",
            "health": "/health",
            "metrics": "/metrics",
        },
        "documentation": "/docs",
    }

# Health check endpoint
@app.get("/health")
async def health_check(request: Request):
    """Detailed health check endpoint."""
    cache = getattr(request.app.state, "cache", None)
    scheduler = getattr(request.app.state, "scheduler", None)

    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "news-aggregator-api",
        "cache": {
            "status": getattr(cache, "cache_status", "unknown"),
            "last_refresh": getattr(cache, "last_refresh", None).isoformat() if getattr(cache, "last_refresh", None) else None,
        },
        "scheduler": {
            "enabled": bool(scheduler),
            "interval_seconds": getattr(request.app.state.settings, "refresh_interval_minutes", 0) * 60,
        },
    }


@app.get("/metrics")
async def metrics(request: Request):
    """Expose lightweight service metrics."""
    news_service: NewsService = request.app.state.news_service
    data = news_service.fetch_all_news()
    return {
        "total_sources": data["total_sources"],
        "active_sources": data["active_sources"],
        "cache_status": data["cache_status"],
        "last_updated": data["last_updated"],
    }


# Optional: fallback so React Router works
@app.get("/favicon.ico", include_in_schema=False)
@app.get("/favicon.svg", include_in_schema=False)
async def favicon():
    for name in ("favicon.ico", "favicon.svg"):
        candidate = STATIC_DIR / name
        if candidate.exists():
            return FileResponse(candidate)
    raise HTTPException(status_code=404)


@app.get("/{full_path:path}", include_in_schema=False)
async def frontend_catchall(full_path: str):
    if full_path.startswith(("api", "health", "metrics")):
        raise HTTPException(status_code=404)
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    raise HTTPException(status_code=404)
