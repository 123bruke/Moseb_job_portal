# Moseb Job Portal

A full-stack hiring intelligence platform for matching candidates to jobs using explainable AI, structured resume analysis, and recruiter-friendly workflows.

Moseb brings together a candidate-facing job portal and an internal hiring dashboard so teams can review applicants, rank talent, and understand why a profile matches or misses a role.

## Overview

This project is designed for modern recruiting workflows where speed, transparency, and fairness matter. The platform combines:

- Candidate discovery and application flows
- Resume ingestion and parsing
- Job-to-candidate matching with skill and experience scoring
- Explainable feedback for candidates and recruiters
- Bias-aware handling of sensitive personal attributes
- Admin controls for review, override, and auditability

## Why this project exists

Recruitment often suffers from fragmented systems, opaque ranking logic, and inconsistent review workflows. Moseb aims to make hiring decisions more transparent and actionable by combining:

- Human-centered candidate experience
- Evidence-based ranking logic
- AI-assisted hiring support with accountability
- Modular services for frontend, backend, AI inference, and data storage

## Core features

- Job search and application experience for candidates
- Resume upload and parsing for recruitment pipelines
- Hybrid ranking based on skills, experience, education, and role fit
- Explainable recommendation reasons tied to resume evidence
- Sensitive-field anonymization before automated evaluation
- Admin dashboard for recruiter review and manual override
- Docker-based local development environment
- Support for vector search, graph reasoning, and background job processing

## Architecture

```text
Frontend (React + Vite)
    │
    ├── Candidate portal
    ├── Company dashboard
    └── Authenticated views
            │
            ▼
      Nginx / API gateway
            │
            ▼
       FastAPI backend
            │
            ├── Resume ingestion and parsing
            ├── Skill extraction and matching
            ├── Vector/graph retrieval
            ├── Explainable ranking pipeline
            └── Background worker tasks
            │
            ├── PostgreSQL / Supabase
            ├── ChromaDB
            ├── Neo4j
            ├── Redis / RQ
            └── AI inference (Gemini + fallback logic)
```

## Tech stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- PostgreSQL / Supabase
- SQLAlchemy and migration workflows

### AI and data
- ChromaDB
- Neo4j
- Redis / RQ
- LangGraph-style orchestration patterns
- Gemini integration
- PDF parsing and OCR-assisted extraction
- YOLO-based CV layout detection (optional ML pipeline)

### Infrastructure
- Docker
- Docker Compose
- Nginx
- Supabase Auth and storage integration

## Repository structure

```text
Moseb_job_portal/
├── backend/              # FastAPI application, schemas, services, workers
├── frontend/             # React + Vite frontend and admin interfaces
├── infra/                # Infrastructure config such as nginx and service setup
├── data/                 # Supporting knowledge and sample data
├── docs/                 # Project documentation and design references
├── ml-training/          # Model training assets for layout detection
├── .env.example          # Environment template
├── docker-compose.yml    # Main Docker stack
├── docker-compose.dev.yml# Local development stack config
├── Makefile              # Common developer commands
├── package.json          # Root package scripts
├── README.md             # Project documentation
├── LICENSE               # License
├── vercel.json           # Frontend deployment config
├── .github/              # CI and workflow configuration
└── .gitignore            # Git ignore rules
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- Python 3.10+
- Docker and Docker Compose
- Git
- A Supabase project
- A Gemini API key (optional if fallback logic is enabled)

## Getting started

### 1) Clone the repository

```bash
git clone https://github.com/123bruke/Moseb_job_portal.git
cd Moseb_job_portal
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

Update your `.env` file with the configuration for your local environment, including Supabase, database, AI, and Neo4j settings.

### 3) Start the app

```bash
make dev
```

This launches the project stack using Docker Compose.

Typical local endpoints:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

### 4) Initialize data and migrations

```bash
make migrate
make seed
```

## Useful commands

```bash
# Start the project stack
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Stop services
docker compose down

# Run DB migrations
docker compose exec backend alembic upgrade head

# Seed local data
docker compose exec backend python -m scripts.seed_knowledge

# Run backend tests
cd backend && pytest -q

# Run frontend checks
cd frontend && npm run lint && npm run typecheck
```

You can also use the root Makefile shortcuts:

```bash
make dev
make down
make migrate
make seed
make test
make lint
```

## Development notes

The application is structured to support both candidate-facing and recruiter/admin experiences from a shared frontend foundation.

The backend uses a modular service-oriented layout for:

- job and application logic
- resume processing
- ranking and explainability
- background workers
- data persistence and retrieval

This makes it easier to extend the platform with new hiring rules, new ranking features, or additional data sources.

## How ranking works

The platform’s matching flow is designed to be transparent and auditable:

1. Hard filters check required eligibility and role constraints
2. Skill, experience, and education signals are combined into a fit score
3. Semantic and graph-based matching improves relevance beyond keyword overlap
4. Explainable reasoning highlights why a candidate was recommended or rejected
5. Recruiters can review and override system suggestions with an audit trail

## Fairness and explainability

The system is intentionally designed with fairness-oriented safeguards:

- Sensitive personal information is stripped before automated analysis
- Evaluation focuses on role-relevant criteria
- Recommendation reasoning is grounded in resume evidence
- Human review remains part of the hiring workflow

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your change and add relevant tests if needed
4. Open a pull request with a clear description

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Status

Moseb Job Portal is structured as a production-style hiring platform with a modular architecture spanning frontend, backend, AI processing, and infrastructure.

It is designed to support both local development and future deployment into a real recruiting environment.
