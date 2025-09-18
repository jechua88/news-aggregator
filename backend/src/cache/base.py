from __future__ import annotations

from datetime import datetime
from typing import Dict, Optional, Protocol

from ..models.news_source import NewsSource


class NewsCacheBackend(Protocol):
    """Protocol that all news cache backends must implement."""

    last_refresh: datetime

    @property
    def is_fresh(self) -> bool: ...

    @property
    def cache_status(self) -> str: ...

    def update_source(self, source: NewsSource) -> None: ...

    def get_source(self, name: str) -> Optional[NewsSource]: ...

    def get_all_sources(self) -> Dict[str, NewsSource]: ...

    def refresh(self) -> None: ...

    def clear(self) -> None: ...

    @property
    def active_sources_count(self) -> int: ...

    @property
    def total_sources_count(self) -> int: ...

