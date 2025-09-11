from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..services.news_service import NewsService

router = APIRouter()
news_service = NewsService()


@router.get("/sources")
def get_sources():
    """Get all configured news sources"""
    try:
        sources = news_service.get_sources_config()
        return sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))