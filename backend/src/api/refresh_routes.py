from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.news_service import NewsService

router = APIRouter()
news_service = NewsService()


@router.post("/refresh")
async def refresh_news():
    """Manually trigger news refresh"""
    try:
        response = await news_service.refresh_news()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))