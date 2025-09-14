from fastapi import APIRouter, HTTPException, Path
from typing import Dict, Any
from ..services.news_service import NewsService

router = APIRouter()
news_service = NewsService()


@router.get("/sources/{source_name}/status")
async def get_source_status(source_name: str = Path(..., description="Name of the news source")):
    """Get status of a specific news source"""
    try:
        # Decode URL-encoded source name
        import urllib.parse
        decoded_source_name = urllib.parse.unquote(source_name)
        
        status = news_service.get_source_status(decoded_source_name)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))