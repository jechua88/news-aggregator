# Quick Start: Financial News Aggregator

**Date**: 2025-09-11  
**Feature**: Financial News Aggregator  

## Overview
This quickstart guide helps you validate the core functionality of the Financial News Aggregator. Follow these steps to ensure the system works as expected.

## Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Git installed

## Setup Instructions

### 1. Clone and Setup Backend
```bash
git clone <repository-url>
cd news-aggregator/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env if needed (default settings should work for development)
```

### 2. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env to point to backend API (default: http://localhost:8000)
```

### 3. Start Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start Frontend
```bash
cd frontend
npm start
```

## Validation Scenarios

### Scenario 1: Backend API Health Check
**Purpose**: Verify the backend API is running and responding

**Steps**:
1. Open browser or use curl
2. Visit `http://localhost:8000/`
3. Look for "Welcome to News Aggregator API" message

**Expected Result**: HTTP 200 with welcome message

### Scenario 2: News Data Retrieval
**Purpose**: Verify the API can fetch news from all sources

**Steps**:
1. Visit `http://localhost:8000/api/news`
2. Check response structure
3. Verify all 8 sources are present
4. Check that each source has 5-10 headlines

**Expected Result**: HTTP 200 with JSON response containing:
- `total_sources`: 8
- `active_sources`: 6-8 (some sources may fail)
- Each source has `headlines` array with 5-10 items
- Each headline has `title`, `link`, `published_at`, `source`

### Scenario 3: Frontend Interface Load
**Purpose**: Verify the frontend loads and displays news correctly

**Steps**:
1. Open browser to `http://localhost:3000`
2. Wait for all sections to load
3. Verify all 8 sources are displayed as separate sections
4. Check that headlines are visible with timestamps
5. Test clicking on headline links (should open in new tabs)

**Expected Result**:
- All 8 source sections visible
- Headlines displayed in clean, responsive layout
- Clicking links opens articles in new tabs
- Error handling for failed sources (graceful degradation)

### Scenario 4: Data Refresh Test
**Purpose**: Verify automatic data refresh functionality

**Steps**:
1. Note the timestamp on news data
2. Wait 15 minutes or manually trigger refresh:
   ```bash
   curl -X POST http://localhost:8000/api/refresh
   ```
3. Check API response again
4. Verify timestamps are updated

**Expected Result**: 
- New timestamps after refresh
- Fresh data loaded from sources
- Cache status updates to "fresh"

### Scenario 5: Error Handling Test
**Purpose**: Verify graceful handling of source failures

**Steps**:
1. Temporarily disable a source in configuration or mock a failure
2. Check API response
3. Verify frontend shows appropriate error messages

**Expected Result**:
- API returns partial success (HTTP 206) if some sources fail
- Failed sources marked as "error" status
- Frontend displays error message for failed sources
- Other sources continue to work normally

## Success Criteria

### Backend Success
- [ ] API responds on `/` with HTTP 200
- [ ] `/api/news` returns structured JSON with news data
- [ ] All 8 configured sources are present in response
- [ ] Each source has 5-10 valid headlines
- [ ] Data refresh works (manual or automatic)
- [ ] Error handling works for individual sources

### Frontend Success
- [ ] Application loads without errors
- [ ] All 8 source sections are displayed
- [ ] Headlines are readable and properly formatted
- [ ] Timestamps are human-readable
- [ ] Clicking headline links opens articles in new tabs
- [ ] Responsive design works on different screen sizes
- [ ] Error messages display for failed sources

### Integration Success
- [ ] Frontend successfully connects to backend API
- [ ] Data loads and displays in real-time
- [ ] Refresh mechanism updates UI automatically
- [ ] Network errors are handled gracefully

## Common Issues

### Backend Issues
- **Port already in use**: Change port in `uvicorn` command or kill existing process
- **Module not found**: Ensure virtual environment is activated
- **SSL errors**: Check if using HTTPS in production settings

### Frontend Issues
- **CORS errors**: Backend should allow frontend origin
- **API connection failed**: Check API URL in frontend environment
- **Build errors**: Run `npm install` to ensure all dependencies are installed

### Data Issues
- **No data from sources**: Check network connectivity and source URLs
- **Outdated data**: Verify refresh interval is working
- **Malformed data**: Check parsing logic for specific sources

## Troubleshooting

### Check Backend Logs
```bash
# View API server logs
tail -f backend/logs/app.log
```

### Test Individual Sources
```bash
# Test specific source
curl "http://localhost:8000/api/sources/wall-street-journal/status"
```

### Clear Cache
```bash
# Restart backend to clear in-memory cache
pkill -f "uvicorn main:app"
```

## Validation Complete ✅

If all scenarios pass, the Financial News Aggregator feature is working correctly and ready for production deployment.