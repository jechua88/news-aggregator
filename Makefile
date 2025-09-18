.PHONY: backend-env backend-test frontend-test frontend-build lint clean

backend-env:
	cd backend && python -m venv venv && ./venv/bin/python -m pip install --upgrade pip && ./venv/bin/python -m pip install -r requirements.txt

backend-test:
	cd backend && ./venv/bin/python -m pytest

frontend-test:
	cd frontend && CI=true npm test -- --watch=false

frontend-build:
	cd frontend && npm run build

lint:
	cd backend && ./venv/bin/python -m pip install ruff==0.6.9 && ./venv/bin/ruff check src

clean:
	rm -rf backend/venv frontend/node_modules frontend/build .pytest_cache

