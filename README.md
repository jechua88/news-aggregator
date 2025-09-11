# Financial News Aggregator

A modern web application that aggregates recent headlines from leading financial and business news sources, providing a clean, responsive interface for staying updated on market developments.

## 🚀 Features

- **Real-time News Aggregation**: Fetches headlines from 8 major financial news sources
- **Multiple Data Sources**: Uses RSS feeds with fallback to web scraping
- **Automatic Refresh**: Updates data every 15 minutes to ensure freshness
- **Clean Interface**: Responsive design with separate sections for each publication
- **Error Handling**: Graceful handling of unavailable sources
- **Fast Performance**: <2s API response time, <500ms frontend render
- **No Authentication**: Public access to all news content

## 📰 Supported News Sources

- **Wall Street Journal** - Market and business news
- **Bloomberg** - Financial markets and economics
- **CNBC** - Business and technology news
- **DealStreetAsia** - Asian business and startup news
- **The Business Times (Singapore)** - Singapore and Asian business news
- **The Edge (Malaysia)** - Malaysian business news
- **South China Morning Post** - Asian and Chinese business news

## 🏗️ Architecture

### Backend (Python FastAPI)
- **Framework**: FastAPI with async support
- **Data Fetching**: feedparser for RSS, BeautifulSoup for scraping
- **Caching**: In-memory cache with 15-minute refresh cycle
- **API**: RESTful endpoints with OpenAPI documentation
- **Testing**: pytest with contract and integration tests

### Frontend (React + TypeScript)
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Data Fetching**: Axios for API communication
- **Testing**: React Testing Library
- **Build**: Modern React with optimized bundle sizes

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Data Validation**: Pydantic
- **HTTP Client**: requests
- **RSS Parsing**: feedparser
- **HTML Parsing**: BeautifulSoup
- **Testing**: pytest
- **Code Quality**: flake8, black

### Frontend
- **Language**: TypeScript
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **HTTP Client**: axios
- **Testing**: React Testing Library
- **Code Quality**: ESLint, Prettier

## 📦 Installation

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
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env if needed (default settings should work for development)
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env to point to backend API (default: http://localhost:8000)
```

## 🚀 Running the Application

### Start Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
cd frontend
npm start
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔌 API Endpoints

### GET /api/news
Retrieve all news headlines from all sources.

**Response**:
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

### GET /api/sources
Get all configured news sources and their status.

### GET /api/sources/{source_name}/status
Get detailed status information for a specific source.

### POST /api/refresh
Manually trigger a refresh of news data from all sources.

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run specific test categories
pytest tests/contract/
pytest tests/integration/
pytest tests/unit/
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Manual Testing
Follow the [Quick Start Guide](specs/001-build-a-simple/quickstart.md) for comprehensive validation scenarios.

## 📊 Performance Targets

- **API Response Time**: <2 seconds
- **Frontend Render Time**: <500ms
- **Cache Refresh Interval**: 15 minutes
- **Max Stories per Source**: 5-10
- **Individual Source Timeout**: 10 seconds

## 🔒 Security Considerations

- All external requests use HTTPS
- Input validation and sanitization
- Graceful error handling to prevent information leakage
- No user authentication required (public data)
- Rate limiting considerations for external sources

## 🚨 Error Handling

- **Graceful Degradation**: Individual source failures don't break the entire application
- **Caching**: Serves stale data when sources are temporarily unavailable
- **Timeouts**: Prevents hanging requests from slow sources
- **Retry Logic**: Automatic fallback from RSS to scraping
- **Status Monitoring**: Tracks source availability and health

## 📁 Project Structure

```
news-aggregator/
├── backend/
│   ├── src/
│   │   ├── models/          # Pydantic data models
│   │   ├── services/        # Business logic services
│   │   └── api/             # API endpoints and middleware
│   ├── tests/
│   │   ├── contract/        # Contract tests
│   │   ├── integration/     # Integration tests
│   │   └── unit/           # Unit tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   └── services/        # API services
│   ├── tests/              # Frontend tests
│   └── package.json
├── specs/
│   └── 001-build-a-simple/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── research.md      # Research findings
│       ├── data-model.md    # Data models
│       ├── contracts/       # API contracts
│       ├── quickstart.md    # Quick start guide
│       └── tasks.md        # Implementation tasks
└── README.md
```

## 🔄 Data Flow

1. **Configuration Loading**: Load source configuration from environment
2. **RSS Fetching**: Attempt RSS feed retrieval for each enabled source
3. **Fallback Scraping**: If RSS fails, attempt web scraping with BeautifulSoup
4. **Data Validation**: Parse and validate headline data using Pydantic models
5. **Caching**: Store validated data in in-memory cache with timestamps
6. **API Response**: Serve cached data via REST API endpoints
7. **Frontend Display**: React frontend consumes API and renders responsive UI

## 📈 Monitoring

- **Structured Logging**: Comprehensive logging for debugging and monitoring
- **Source Health Tracking**: Monitor individual source availability
- **Performance Metrics**: Track API response times and cache efficiency
- **Error Tracking**: Log and categorize errors for continuous improvement

## 🤝 Contributing

This project follows Spec-Driven Development principles:

1. **Specification**: Define clear requirements and acceptance criteria
2. **Planning**: Create detailed implementation plans and data models
3. **Task Generation**: Break down into executable tasks with TDD
4. **Implementation**: Follow RED-GREEN-Refactor cycle strictly
5. **Validation**: Test thoroughly and validate against requirements

### Development Workflow

1. Review feature specification in `specs/001-build-a-simple/spec.md`
2. Follow implementation plan in `specs/001-build-a-simple/plan.md`
3. Execute tasks from `specs/001-build-a-simple/tasks.md`
4. Run tests after each task
5. Commit changes with descriptive messages
6. Validate against quickstart scenarios

## 📚 Documentation

- **Feature Specification**: [specs/001-build-a-simple/spec.md](specs/001-build-a-simple/spec.md)
- **Implementation Plan**: [specs/001-build-a-simple/plan.md](specs/001-build-a-simple/plan.md)
- **Research Findings**: [specs/001-build-a-simple/research.md](specs/001-build-a-simple/research.md)
- **Data Models**: [specs/001-build-a-simple/data-model.md](specs/001-build-a-simple/data-model.md)
- **API Contracts**: [specs/001-build-a-simple/contracts/](specs/001-build-a-simple/contracts/)
- **Quick Start Guide**: [specs/001-build-a-simple/quickstart.md](specs/001-build-a-simple/quickstart.md)
- **Implementation Tasks**: [specs/001-build-a-simple/tasks.md](specs/001-build-a-simple/tasks.md)

## 🏛️ Constitution

This project follows a strict constitution that emphasizes:
- **Testing First**: All tests must be written and fail before implementation
- **Simplicity**: Avoid unnecessary complexity and design patterns
- **Documentation**: Comprehensive documentation and clear specifications
- **Quality**: High code standards with linting and formatting
- **Observability**: Structured logging and error handling

## 📄 License

[Add your license information here]

## 🙋‍♂️ Support

For support, questions, or contributions:
- Create an issue in the repository
- Follow the development workflow outlined above
- Test thoroughly before submitting changes

---

Built with ❤️ using modern web technologies and Spec-Driven Development principles.