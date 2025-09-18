from __future__ import annotations

from functools import lru_cache
import json
from pathlib import Path
from typing import List, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent


def _safe_json_loads(value: str):
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


class Settings(BaseSettings):
    """Application configuration loaded from environment."""

    environment: str = Field(default="local", alias="ENVIRONMENT")
    cors_origins: Union[str, List[str]] = Field(
        default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS"
    )
    refresh_interval_minutes: int = Field(default=15, alias="REFRESH_INTERVAL_MINUTES")
    cache_ttl_minutes: int = Field(default=15, alias="CACHE_TTL_MINUTES")
    cache_backend: str = Field(default="memory", alias="CACHE_BACKEND")
    redis_url: str | None = Field(default=None, alias="REDIS_URL")
    scheduler_enabled: bool = Field(default=True, alias="SCHEDULER_ENABLED")
    scheduler_initial_delay_seconds: int = Field(default=5, alias="SCHEDULER_INITIAL_DELAY_SECONDS")

    model_config = SettingsConfigDict(env_file=None, case_sensitive=False)

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",") if origin]
        return [origin.strip() for origin in self.cors_origins if origin]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin]
        return value


def _env_files() -> List[Path]:
    """Discover candidate env files in priority order."""
    candidates = [
        REPO_ROOT / "config" / "app" / "backend.env",
        BASE_DIR / ".env",
    ]
    return [path for path in candidates if path.exists()]


@lru_cache
def get_settings() -> Settings:
    env_files = _env_files()
    if env_files:
        return Settings(_env_file=env_files[0])
    return Settings()
