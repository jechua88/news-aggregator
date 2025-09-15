from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..services.news_service import NewsService
from ..core.deps import get_news_service
from ..core.deps import get_settings
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/news")
def get_news(
    news_service: NewsService = Depends(get_news_service),
    settings=Depends(get_settings),
):
    """Get all news headlines from all sources"""
    try:
        response = news_service.fetch_all_news()
        
        # Determine response status based on active sources
        total_sources = response["total_sources"]
        active_sources = response["active_sources"]
        
        if active_sources < total_sources and settings.partial_success_206:
            # Partial success - some sources failed, return 206 if enabled
            return JSONResponse(status_code=206, content=response)
        else:
            # Full success or partial with 200 default
            return response
    
    except Exception as e:
        # Attempt to serve cached data if available
        try:
            cached = getattr(news_service, "cache", None)
            if cached and cached.total_sources_count > 0:
                return news_service._format_response()  # type: ignore
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))
