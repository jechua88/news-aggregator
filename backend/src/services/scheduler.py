from __future__ import annotations

import threading
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class RefreshScheduler:
    """Simple background scheduler to keep the news cache warm."""

    def __init__(
        self,
        refresh_fn,
        interval_seconds: int,
        initial_delay_seconds: int = 5,
    ) -> None:
        self._refresh = refresh_fn
        self._interval = max(interval_seconds, 0)
        self._initial_delay = max(initial_delay_seconds, 0)
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        if self._interval <= 0:
            logger.info("RefreshScheduler disabled (interval <= 0)")
            return
        if self._thread and self._thread.is_alive():
            return
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info("RefreshScheduler started with %ss interval", self._interval)

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=5)
            logger.info("RefreshScheduler stopped")

    def _run(self) -> None:
        if self._initial_delay:
            logger.debug("RefreshScheduler initial delay %ss", self._initial_delay)
            if self._stop_event.wait(self._initial_delay):
                return
        while not self._stop_event.wait(self._interval):
            try:
                self._refresh()
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.exception("Scheduled refresh failed: %s", exc)

