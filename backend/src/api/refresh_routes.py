from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from ..services.news_service import NewsService
from ..core.deps import get_news_service

router = APIRouter()


@router.post("/refresh")
async def refresh_news(news_service: NewsService = Depends(get_news_service)):
    """Manually trigger news refresh"""
    try:
        response = news_service.refresh_news()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
