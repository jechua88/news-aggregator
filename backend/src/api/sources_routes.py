from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..services.news_service import NewsService
from ..core.deps import get_news_service

router = APIRouter()


@router.get("/sources")
def get_sources(news_service: NewsService = Depends(get_news_service)):
    """Get all configured news sources"""
    try:
        sources = news_service.get_sources_config()
        return sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
