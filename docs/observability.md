# Observability Notes

## Logging

- Structured logging is configured at application start (`src/main.py`).
- Scheduler activity is logged on start/stop and on refresh failures.
- HTTP middleware logs request method, URL, and response time.

## Health & Metrics

- `GET /health`: returns service status, cache state (status + last refresh), and scheduler details.
- `GET /metrics`: lightweight JSON snapshot of total/active sources and cache status (intended for scraping by external monitoring).

## Recommended Monitoring

- Add uptime checking for `https://news.jechua.com/health`.
- Scrape `/metrics` on an interval (e.g., Prometheus `json_exporter`).
- Alert if `active_sources` drops below configured threshold or cache status becomes `stale` for extended periods.

## Future Enhancements

- Expose Prometheus metrics via `prometheus_client`.
- Integrate structured logging transport (e.g., Logfmt/JSON) with log aggregation.
- Emit notifications when individual sources remain in error state over multiple refresh cycles.

