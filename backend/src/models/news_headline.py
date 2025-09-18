from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class NewsHeadline(BaseModel):
    """Individual news article with metadata"""
    title: str = Field(..., description="Headline text")
    link: str = Field(..., description="URL to full article")
    published_at: datetime = Field(..., description="Publication timestamp")
    source: str = Field(..., description="Source name")
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="When this headline was fetched (UTC)")

    @field_validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        title = v.strip()
        if len(title) < 10:
            raise ValueError("Title must be at least 10 characters")
        if len(title) > 500:
            raise ValueError("Title cannot exceed 500 characters")
        return title

    @field_validator('link')
    def validate_link(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError("Link must be a valid HTTP/HTTPS URL")
        return v

    @field_validator('published_at')
    def validate_published_at(cls, v):
        # Use UTC now if tzinfo missing
        now = datetime.now(timezone.utc) if v.tzinfo is None else datetime.now(v.tzinfo)
        time_diff = now - v
        if time_diff.total_seconds() > 2592000:  # 30 days
            raise ValueError("Published date must be within the last 30 days")
        return v

    @field_validator('source')
    def validate_source(cls, v):
        if not v or not v.strip():
            raise ValueError("Source cannot be empty")
        return v.strip()


class NewsHeadlineResponse(BaseModel):
    """API response model for news headlines"""
    title: str
    link: str
    published_at: str  # ISO 8601 format
    source: str
