# Tasks: Financial News Aggregator

**Input**: Design documents from `/specs/001-build-a-simple/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract validation scenarios
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, API endpoints
   → Integration: RSS fetching, caching, error handling
   → Polish: frontend components, responsive design, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
   → All user stories covered?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/` (per plan.md structure)
- Backend: Python FastAPI with Pydantic models
- Frontend: React + TypeScript + Tailwind CSS

## Phase 3.1: Setup
- [ ] T001 Create backend project structure: backend/, backend/src/models/, backend/src/services/, backend/src/api/, backend/tests/
- [ ] T002 Create frontend project structure: frontend/, frontend/src/components/, frontend/src/pages/, frontend/src/services/, frontend/tests/
- [ ] T003 [P] Initialize Python backend with FastAPI, pydantic, feedparser, requests, uvicorn
- [ ] T004 [P] Initialize React frontend with TypeScript, Tailwind CSS, axios
- [ ] T005 [P] Configure backend linting: flake8, black, pytest
- [ ] T006 [P] Configure frontend linting: ESLint, Prettier, TypeScript

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T007 [P] Contract test GET /api/news in backend/tests/contract/test_news_get.py
- [ ] T008 [P] Contract test GET /api/sources in backend/tests/contract/test_sources_get.py
- [ ] T009 [P] Contract test GET /api/sources/{source_name}/status in backend/tests/contract/test_source_status_get.py
- [ ] T010 [P] Contract test POST /api/refresh in backend/tests/contract/test_refresh_post.py
- [ ] T011 [P] Integration test news retrieval from all sources in backend/tests/integration/test_news_retrieval.py
- [ ] T012 [P] Integration test RSS fallback scraping in backend/tests/integration/test_rss_scraping.py
- [ ] T013 [P] Integration test graceful error handling in backend/tests/integration/test_error_handling.py
- [ ] T014 [P] Frontend test news source component rendering in frontend/tests/components/NewsSource.test.tsx
- [ ] T015 [P] Frontend test API integration in frontend/tests/services/api.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
### Backend Models
- [ ] T016 [P] NewsSource model in backend/src/models/news_source.py
- [ ] T017 [P] NewsHeadline model in backend/src/models/news_headline.py
- [ ] T018 [P] NewsCache model in backend/src/models/news_cache.py
- [ ] T019 [P] SourceConfig model in backend/src/models/source_config.py

### Backend Services
- [ ] T020 [P] RSS fetching service in backend/src/services/rss_service.py
- [ ] T021 [P] Web scraping service in backend/src/services/scraping_service.py
- [ ] T022 [P] News caching service in backend/src/services/cache_service.py
- [ ] T023 [P] Source management service in backend/src/services/source_service.py
- [ ] T024 [P] Error handling service in backend/src/services/error_service.py

### Backend API Endpoints
- [ ] T025 GET /api/news endpoint implementation
- [ ] T026 GET /api/sources endpoint implementation
- [ ] T027 GET /api/sources/{source_name}/status endpoint implementation
- [ ] T028 POST /api/refresh endpoint implementation
- [ ] T029 Input validation and sanitization
- [ ] T030 Error handling middleware

## Phase 3.4: Integration
- [ ] T031 [P] Connect RSS service to external feeds with timeout handling
- [ ] T032 [P] Connect scraping service with BeautifulSoup
- [ ] T033 [P] Integrate caching with 15-minute refresh cycle
- [ ] T034 [P] Connect frontend to backend API with axios
- [ ] T035 [P] Add structured logging for debugging
- [ ] T036 [P] Add CORS configuration for frontend-backend communication
- [ ] T037 Async task scheduling for regular refreshes

## Phase 3.5: Frontend Implementation
### Components
- [ ] T038 [P] NewsSource component in frontend/src/components/NewsSource.tsx
- [ ] T039 [P] HeadlineItem component in frontend/src/components/HeadlineItem.tsx
- [ ] T040 [P] LoadingSpinner component in frontend/src/components/LoadingSpinner.tsx
- [ ] T041 [P] ErrorMessage component in frontend/src/components/ErrorMessage.tsx

### Pages and Services
- [ ] T042 Main dashboard page in frontend/src/pages/Dashboard.tsx
- [ ] T043 API service in frontend/src/services/api.ts
- [ ] T044 [P] Responsive design with Tailwind CSS classes
- [ ] T045 [P] Click handlers for article links (open in new tab)

## Phase 3.6: Polish
- [ ] T046 [P] Unit tests for data validation in backend/tests/unit/test_validation.py
- [ ] T047 [P] Unit tests for cache logic in backend/tests/unit/test_cache.py
- [ ] T048 Performance tests (<2s API response, <500ms frontend render)
- [ ] T049 [P] Update README with setup instructions
- [ ] T050 [P] Create configuration management system
- [ ] T051 Manual testing using quickstart.md scenarios
- [ ] T052 Optimize bundle size and loading times
- [ ] T053 Add error boundaries and loading states

## Dependencies
- Tests (T007-T015) before implementation (T016-T030)
- Models (T016-T018) before services (T020-T024)
- Services (T020-T024) before API endpoints (T025-T030)
- Backend endpoints before frontend integration (T034-T045)
- All core before polish (T046-T053)

## Parallel Examples

### Phase 3.2: Contract Tests (T007-T010)
```
# Launch T007-T010 together:
Task: "Contract test GET /api/news in backend/tests/contract/test_news_get.py"
Task: "Contract test GET /api/sources in backend/tests/contract/test_sources_get.py"
Task: "Contract test GET /api/sources/{source_name}/status in backend/tests/contract/test_source_status_get.py"
Task: "Contract test POST /api/refresh in backend/tests/contract/test_refresh_post.py"
```

### Phase 3.2: Integration Tests (T011-T013)
```
# Launch T011-T013 together:
Task: "Integration test news retrieval from all sources in backend/tests/integration/test_news_retrieval.py"
Task: "Integration test RSS fallback scraping in backend/tests/integration/test_rss_scraping.py"
Task: "Integration test graceful error handling in backend/tests/integration/test_error_handling.py"
```

### Phase 3.3: Backend Models (T016-T018)
```
# Launch T016-T018 together:
Task: "NewsSource model in backend/src/models/news_source.py"
Task: "NewsHeadline model in backend/src/models/news_headline.py"
Task: "NewsCache model in backend/src/models/news_cache.py"
```

### Phase 3.3: Backend Services (T020-T024)
```
# Launch T020-T024 together:
Task: "RSS fetching service in backend/src/services/rss_service.py"
Task: "Web scraping service in backend/src/services/scraping_service.py"
Task: "News caching service in backend/src/services/cache_service.py"
Task: "Source management service in backend/src/services/source_service.py"
Task: "Error handling service in backend/src/services/error_service.py"
```

### Phase 3.5: Frontend Components (T038-T041)
```
# Launch T038-T041 together:
Task: "NewsSource component in frontend/src/components/NewsSource.tsx"
Task: "HeadlineItem component in frontend/src/components/HeadlineItem.tsx"
Task: "LoadingSpinner component in frontend/src/components/LoadingSpinner.tsx"
Task: "ErrorMessage component in frontend/src/components/ErrorMessage.tsx"
```

### Phase 3.6: Polish Tasks (T046-T049)
```
# Launch T046-T049 together:
Task: "Unit tests for data validation in backend/tests/unit/test_validation.py"
Task: "Unit tests for cache logic in backend/tests/unit/test_cache.py"
Task: "Update README with setup instructions"
Task: "Create configuration management system"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Follow RED-GREEN-Refactor cycle strictly
- Use actual RSS feeds for testing (not mocks)

## Task Generation Rules Applied

1. **From Contracts** (T007-T010, T028):
   - Each endpoint → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model** (T016-T018):
   - Each entity → model creation task [P]
   - Services follow models (T020-T024)
   
3. **From User Stories** (T011-T013, T038-T045):
   - Each acceptance scenario → integration test [P]
   - Quickstart scenarios → validation tasks (T051)

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T007-T010)
- [x] All entities have model tasks (T016-T018)
- [x] All tests come before implementation (T007-T015 before T016+)
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] All user stories covered by integration tests
- [x] Quickstart validation scenarios included