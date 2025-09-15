from __future__ import annotations

from typing import List, Dict
import json
import os


DEFAULT_GENERIC_SELECTORS: List[str] = [
    "h1 a",
    "h2 a",
    "h3 a",
    ".headline a",
    ".title a",
    "article a",
    ".story-headline a",
    ".news-title a",
    ".article-title a",
]


DEFAULT_SOURCE_SELECTORS: Dict[str, List[str]] = {
    "Wall Street Journal": [".WSJTheme--headline--7xZ5j39U a"],
    "Bloomberg": [".headline__text", "h3 a"],
    "CNBC": [".Card-title", "h3 a"],
    "DealStreetAsia": ["h3 a"],
}


def _load_external_selectors() -> Dict[str, List[str]]:
    path = os.getenv("SELECTORS_CONFIG_PATH")
    if not path:
        return {}
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Expecting shape { "sources": { "Name": [".selector", ...] }, "generic": ["...", ...] }
        sources = data.get("sources", {}) if isinstance(data, dict) else {}
        if not isinstance(sources, dict):
            sources = {}
        return {k: v for k, v in sources.items() if isinstance(v, list)}
    except Exception:
        return {}


def get_selectors_for_source(source_name: str) -> List[str]:
    external = _load_external_selectors()
    if source_name in external:
        return external[source_name]
    if source_name in DEFAULT_SOURCE_SELECTORS:
        return DEFAULT_SOURCE_SELECTORS[source_name]
    return DEFAULT_GENERIC_SELECTORS

