from __future__ import annotations

import json
import logging
import os
from typing import Optional


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname,
            "name": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        # Common extras
        for key in ("request_id", "method", "path", "status", "duration_ms"):
            val = getattr(record, key, None)
            if val is not None:
                payload[key] = val
        return json.dumps(payload, separators=(",", ":"))


def setup_logging(json_logs: Optional[bool] = None, level: Optional[str] = None) -> None:
    if json_logs is None:
        val = os.getenv("LOG_JSON", "true").lower()
        json_logs = val in {"1", "true", "yes", "on"}
    lvl = (level or os.getenv("LOG_LEVEL", "INFO")).upper()

    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(getattr(logging, lvl, logging.INFO))

    handler = logging.StreamHandler()
    if json_logs:
        handler.setFormatter(JsonFormatter())
    else:
        formatter = logging.Formatter(
            fmt="%(asctime)s %(levelname)s %(name)s: %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
        handler.setFormatter(formatter)
    root.addHandler(handler)

