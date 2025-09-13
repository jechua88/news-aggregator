from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .api import news_routes, sources_routes, status_routes, refresh_routes
import logging
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Financial News Aggregator API",
    description="API for fetching and managing financial news headlines from multiple sources",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
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

# Include API routes
app.include_router(news_routes.router, prefix="/api")
app.include_router(sources_routes.router, prefix="/api")
app.include_router(status_routes.router, prefix="/api")
app.include_router(refresh_routes.router, prefix="/api")

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

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to News Aggregator API",
        "version": "1.0.0",
        "endpoints": {
            "news": "/api/news",
            "sources": "/api/sources",
            "source_status": "/api/sources/{source_name}/status",
            "refresh": "/api/refresh"
        },
        "documentation": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "news-aggregator-api"
    }