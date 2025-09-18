# Deployment Guide

This document describes how to deploy the Financial News Aggregator using the Docker/Traefik stack.

## Directory Layout

- `backend/`: FastAPI service.
- `frontend/`: React web UI build.
- `config/deploy/`: Deployment manifests (Docker Compose, Traefik, Nginx).
- `config/app/`: Application-level configuration templates.
- `scripts/`: Utility scripts, including `deploy-news.sh` for manual rollout.

## Prerequisites

- Docker Engine 24+
- Docker Compose v2 plug-in (if using Compose stacks)
- Traefik environment (managed separately under `/root/docker-compose.yml`)
- Domain DNS pointing to the server
- Optional: Redis instance if you enable the external cache backend (planned)

## Quick Manual Deploy

```bash
bash scripts/deploy-news.sh
```

This builds the backend multi-stage Docker image (which bundles the frontend build), replaces the running container, and writes the Nginx site config from `config/deploy/nginx/news.jechua.com.conf`. SSL issuance is skipped if Traefik already terminates TLS; adjust the script as needed.

## Compose Deploy

Use `config/deploy/docker-compose.local.yaml` as a starting point. Copy it into `/etc/news/docker-compose.yaml`, adjust environment variables, then run:

```bash
docker compose -f /etc/news/docker-compose.yaml up -d --build
```

Ensure the `news` service joins the Traefik network and carries the router labels defined in the compose file.

## Configuration

Backend environment variables: see `backend/.env.example`. Copy into `config/app/backend.env` and mount via Compose or pass to the deploy script.

Frontend build relies on `frontend/.env` (see `frontend/.env.example`). During the Docker build those values can be injected via build args if necessary.

## Post-Deploy Checks

- Visit `https://news.jechua.com/` to inspect the UI.
- `curl -sS https://news.jechua.com/api/news | jq '.active_sources'`
- `curl -sS http://127.0.0.1:8000/health`

## Rolling Back

Retag the previous image (e.g., `news-api:<timestamp>`) and rerun the Compose stack or `docker run` with that tag. Keep at least two recent tags available.

