# Financial News Aggregator

A modern web application that aggregates recent headlines from leading financial and business news sources, with a clean, responsive UI.

## Features

- Real-time aggregation from multiple sources
- RSS first, scraping fallback
- Automatic refresh and in-memory caching
- Responsive UI built with React + Tailwind
- Graceful error handling and source health status

## Architecture

### Backend (FastAPI)
- Framework: FastAPI
- Data fetching: `feedparser` (RSS) and `BeautifulSoup` (scraping)
- Caching: in-memory with configurable TTL
- API: REST endpoints with OpenAPI docs
- Tests: pytest (contract and integration)

### Frontend (React + TypeScript)
- Framework: React 18 + TypeScript
- Styling: Tailwind CSS
- HTTP: Axios
- Tests: React Testing Library

## Tech Stack

### Backend
- Python 3.11+, FastAPI, Uvicorn/Gunicorn
- Pydantic, requests, feedparser, beautifulsoup4

### Frontend
- React 18, TypeScript, Tailwind, CRA

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Clone Repository
```bash
git clone <repository-url>
cd news-aggregator
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env  # or copy manually on Windows
```

### Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

## Running the Application

### Start Backend (dev)
```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (dev)
```bash
cd frontend
npm start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

- GET `/api/news` — all headlines from all sources
- GET `/api/sources` — configured sources
- GET `/api/sources/{source}/status` — per‑source status
- POST `/api/refresh` — trigger refresh

Example `GET /api/news` response:
```json
{
  "sources": [
    {
      "name": "Wall Street Journal",
      "headlines": [
        {
          "title": "Market Rally on Economic Data",
          "link": "https://www.wsj.com/articles/...",
          "published_at": "2025-09-11T09:45:00Z",
          "source": "Wall Street Journal"
        }
      ],
      "status": "active",
      "last_updated": "2025-09-11T10:25:00Z",
      "story_count": 8
    }
  ],
  "total_sources": 8,
  "active_sources": 6,
  "last_updated": "2025-09-11T10:30:00Z",
  "cache_status": "fresh"
}
```

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Configuration

Backend `.env` highlights:
- `CORS_ORIGINS` — CSV of allowed origins
- `SERVE_STATIC` — whether FastAPI serves built assets
- `PARTIAL_SUCCESS_206` — opt‑in to 206 on partial success
- `CACHE_TTL_MINUTES`, `REQUEST_TIMEOUT_SECONDS`
- `SOURCES_CONFIG_PATH` — optional JSON path for sources
- `SELECTORS_CONFIG_PATH` — optional JSON for scraping selectors
- `LOG_JSON` — output logs in JSON
- `ENABLE_METRICS` — expose Prometheus `/metrics`

## Project Structure

```
news-aggregator/
  backend/
    src/
      api/
      models/
      services/
      core/
    requirements.txt
  frontend/
    src/
      components/
      pages/
      services/
    package.json
  specs/
```
