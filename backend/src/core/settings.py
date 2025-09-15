import os
from typing import List, Optional
from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Application settings loaded from environment variables.

    Uses simple os.getenv parsing to avoid extra dependencies.
    """

    cors_origins: List[str] = Field(default_factory=lambda: ["https://test1.jechua.com"])
    serve_static: bool = True
    partial_success_206: bool = False
    request_timeout_seconds: int = 10
    cache_ttl_minutes: int = 15
    max_headlines_per_source: int = 10
    sources_config_path: Optional[str] = None
    selectors_config_path: Optional[str] = None

    @classmethod
    def from_env(cls) -> "Settings":
        cors_raw = os.getenv("CORS_ORIGINS")
        cors_origins = (
            [o.strip() for o in cors_raw.split(",") if o.strip()]
            if cors_raw
            else ["https://test1.jechua.com"]
        )

        def to_bool(name: str, default: bool) -> bool:
            val = os.getenv(name)
            if val is None:
                return default
            return val.lower() in {"1", "true", "yes", "y", "on"}

        return cls(
            cors_origins=cors_origins,
            serve_static=to_bool("SERVE_STATIC", True),
            partial_success_206=to_bool("PARTIAL_SUCCESS_206", False),
            request_timeout_seconds=int(os.getenv("REQUEST_TIMEOUT_SECONDS", "10")),
            cache_ttl_minutes=int(os.getenv("CACHE_TTL_MINUTES", "15")),
            max_headlines_per_source=int(os.getenv("MAX_HEADLINES_PER_SOURCE", "10")),
            sources_config_path=os.getenv("SOURCES_CONFIG_PATH"),
            selectors_config_path=os.getenv("SELECTORS_CONFIG_PATH"),
        )
