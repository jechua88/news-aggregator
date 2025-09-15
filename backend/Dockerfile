# Stage 1: build frontend
FROM node:20 AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./         
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: backend
FROM python:3.11-slim
WORKDIR /app

# Install backend deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/src ./src
# (optional) COPY backend/tests ./tests

# Copy built frontend
COPY --from=frontend-build /frontend/build ./static

# Runtime best practices
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app \
    && chown -R app:app /app
USER app

EXPOSE 8000

# Basic healthcheck using Python stdlib (no curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
 CMD python - << 'PY' || exit 1
import sys, urllib.request
try:
    with urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3) as r:
        sys.exit(0 if r.status == 200 else 1)
except Exception:
    sys.exit(1)
PY

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "src.main:app", "--bind", "0.0.0.0:8000"]

