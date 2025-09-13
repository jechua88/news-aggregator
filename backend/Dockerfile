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

EXPOSE 8000
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "src.main:app", "--bind", "0.0.0.0:8000"]


