#!/usr/bin/env bash
set -euo pipefail

# Deploy news backend in Docker (127.0.0.1:8000), serve frontend via Nginx, add SSL.

APP_DIR="/var/www/news"
DOMAIN="news.jechua.com"
IMAGE_NAME="news-api:latest"
CONTAINER_NAME="news_api"
HOST_BIND="127.0.0.1:8000"

echo "[1/6] Ensure prerequisites (docker, nginx)"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker first." >&2
  exit 1
fi
if ! command -v nginx >/dev/null 2>&1; then
  echo "Installing Nginx..."
  sudo apt update && sudo apt install -y nginx
fi

echo "[2/6] Build backend image"
# Build with repo root as context so Dockerfile can COPY both backend/ and frontend/
cd "$APP_DIR"
sudo docker build -t "$IMAGE_NAME" -f backend/Dockerfile .

echo "[3/6] Run/replace container on $HOST_BIND"
sudo docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
sudo docker run -d --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$APP_DIR/backend/.env" \
  -p "$HOST_BIND:8000" \
  "$IMAGE_NAME"

echo "[4/6] Build frontend and configure Nginx"
cd "$APP_DIR/frontend"
if ! command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js 18 (for build)..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Prefer existing installed deps to avoid peer-conflict churn
if [ -d node_modules ]; then
  echo "Using existing node_modules (skipping install)"
else
  echo "Installing dependencies (legacy peer deps)"
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
fi

npm run build

sudo tee "/etc/nginx/sites-available/${DOMAIN}" >/dev/null <<NGINX
$(sed 's/.*/&/g' "$APP_DIR/nginx/news.jechua.com.conf")
NGINX

sudo ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
sudo nginx -t
sudo systemctl reload nginx

echo "[5/6] Open firewall (if UFW enabled)"
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 80/tcp || true
  sudo ufw allow 443/tcp || true
fi

echo "[6/6] Obtain SSL via Certbot"
if ! command -v certbot >/dev/null 2>&1; then
  sudo apt update && sudo apt install -y certbot python3-certbot-nginx
fi
sudo certbot --nginx -d "$DOMAIN" --redirect --hsts -m you@example.com --agree-tos -n || true
sudo certbot renew --dry-run || true

echo "Done. Verify: https://${DOMAIN} and https://${DOMAIN}/health"
