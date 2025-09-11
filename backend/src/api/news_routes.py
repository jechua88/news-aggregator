from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.news_service import NewsService

router = APIRouter()
news_service = NewsService()


@router.get("/news")
async def get_news():
    """Get all news headlines from all sources"""
    try:
        response = await news_service.fetch_all_news()
        
        # Determine response status based on active sources
        total_sources = response["total_sources"]
        active_sources = response["active_sources"]
        
        if active_sources == 0:
            raise HTTPException(status_code=500, detail="No sources available")
        elif active_sources < total_sources:
            # Partial success - some sources failed
            return response
        else:
            # Full success
            return response
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))