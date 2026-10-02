.PHONY: dev up down test lint seed migrate
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
up:
	docker compose up -d --build
down:
	docker compose down
lint:
	cd backend && ruff check . && mypy app
	cd frontend && npm run lint && npm run typecheck
test:
	cd backend && pytest -q
	cd frontend && npm test
seed:
	docker compose exec backend python -m scripts.seed_knowledge
migrate:
	docker compose exec backend alembic upgrade head
