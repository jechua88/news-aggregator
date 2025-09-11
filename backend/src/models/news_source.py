from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from .news_headline import NewsHeadline


class NewsSource(BaseModel):
    """Represents a financial news publication that provides headlines"""
    name: str = Field(..., description="Display name of the news source")
    rss_url: str = Field(..., description="Primary RSS feed URL")
    fallback_url: str = Field(..., description="Fallback scraping URL")
    enabled: bool = Field(True, description="Whether the source is active")
    max_stories: int = Field(8, description="Maximum stories to fetch (5-10)")
    last_updated: Optional[datetime] = Field(None, description="Last successful fetch time")
    status: str = Field("active", description="Current status")
    headlines: List[NewsHeadline] = Field(default_factory=list, description="List of headlines from this source")

    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @validator('rss_url')
    def validate_rss_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError("RSS URL must be a valid HTTP/HTTPS URL")
        return v

    @validator('fallback_url')
    def validate_fallback_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError("Fallback URL must be a valid HTTP/HTTPS URL")
        return v

    @validator('max_stories')
    def validate_max_stories(cls, v):
        if not 5 <= v <= 10:
            raise ValueError("max_stories must be between 5 and 10")
        return v

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['active', 'error', 'disabled']
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")
        return v