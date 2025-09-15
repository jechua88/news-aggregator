from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from .api import news_routes, sources_routes, status_routes, refresh_routes
from .core.settings import Settings
from typing import Optional
from .core.logging import setup_logging
from .core.metrics import metrics_response
from dotenv import load_dotenv
import logging
import time
import os


load_dotenv()

setup_logging()
logger = logging.getLogger(__name__)


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    settings = settings or Settings.from_env()

    app = FastAPI(
        title="Financial News Aggregator API",
        description="API for fetching and managing financial news headlines from multiple sources",
        version="1.0.0",
    )

    # Store settings and pre-create shared services
    app.state.settings = settings
    app.state.news_service = None  # created on first use via dependency

    # Include API routes
    app.include_router(news_routes.router, prefix="/api")
    app.include_router(sources_routes.router, prefix="/api")
    app.include_router(status_routes.router, prefix="/api")
    app.include_router(refresh_routes.router, prefix="/api")

    # Optionally serve frontend build (kept enabled by default to preserve behavior)
    if settings.serve_static:
        app.mount("/", StaticFiles(directory="static", html=True), name="static")

        @app.get("/{full_path:path}")
        async def frontend_catchall(full_path: str):
            index_path = os.path.join("static", "index.html")
            return FileResponse(index_path)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging
    import uuid
    from starlette.middleware.base import BaseHTTPMiddleware

    @app.middleware("http")
    async def log_requests(request, call_next):
        start = time.time()
        req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = req_id
        # Log request
        logger.info(
            "incoming",
            extra={"request_id": req_id, "method": request.method, "path": str(request.url.path)},
        )
        response = await call_next(request)
        duration = (time.time() - start) * 1000.0
        response.headers["X-Request-ID"] = req_id
        logger.info(
            "completed",
            extra={
                "request_id": req_id,
                "method": request.method,
                "path": str(request.url.path),
                "status": response.status_code,
                "duration_ms": round(duration, 2),
            },
        )
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
                "details": {"path": str(request.url)},
            },
        )

    # API Info endpoint (moved to /api to avoid static root conflicts)
    @app.get("/api")
    async def api_info():
        return {
            "message": "Welcome to News Aggregator API",
            "version": "1.0.0",
            "endpoints": {
                "news": "/api/news",
                "sources": "/api/sources",
                "source_status": "/api/sources/{source_name}/status",
                "refresh": "/api/refresh",
            },
            "documentation": "/docs",
        }

    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "service": "news-aggregator-api",
            "cache": {
                "last_refresh": getattr(app.state.news_service.cache, "last_refresh", None).isoformat()
                if getattr(app.state, "news_service", None) and app.state.news_service.cache.last_refresh
                else None,
                "cache_status": getattr(app.state.news_service.cache, "cache_status", None)
                if getattr(app.state, "news_service", None)
                else None,
                "total_sources": getattr(app.state.news_service.cache, "total_sources_count", None)
                if getattr(app.state, "news_service", None)
                else None,
                "active_sources": getattr(app.state.news_service.cache, "active_sources_count", None)
                if getattr(app.state, "news_service", None)
                else None,
            },
        }

    # Optional Prometheus metrics
    @app.get("/metrics")
    async def metrics():
        data = metrics_response()
        if data is None:
            return JSONResponse(status_code=404, content={"detail": "metrics disabled"})
        from fastapi import Response

        return Response(content=data, media_type="text/plain; version=0.0.4")

    return app


# Expose ASGI app for UVicorn/Gunicorn
app = create_app()
