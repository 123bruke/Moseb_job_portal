# Moseb Job Portal

A full-stack hiring intelligence platform for matching candidates to jobs with explainable AI, bias-aware screening, and transparent recruiter workflows.

This project combines a candidate-facing job portal with an admin/company dashboard for managing applications, ranking resumes, and reviewing AI-generated recommendations with auditability.

## Why this project

- Candidate experience: browse jobs, review rankings, and understand why they matched or missed a role
- Company workflow: manage applicants, assess fit, and shortlist with evidence-backed reasoning
- Explainable ranking: AI scoring tied to resume evidence and requirement checks
- Bias-conscious processing: anonymizes sensitive personal details before scoring
- Modern stack: React + FastAPI + Postgres + vector/graph data stores + Docker

## Architecture overview

```text
Frontend (React + Vite)
    │
    ├─ Candidate portal
    ├─ Company/admin dashboard
    └─ Authenticated views via Supabase
            │
            ▼
      Nginx / API gateway
            │
            ▼
      FastAPI backend
            │
            ├─ Resume parsing and ingestion
            ├─ Skill extraction and scoring
            ├─ Graph/vector retrieval
            ├─ Explainable ranking pipeline
            └─ Background workers
            │
            ├── Supabase / PostgreSQL
            ├── ChromaDB
            ├── Neo4j
            ├── Redis / RQ
            └── AI inference (Gemini / fallback heuristics)
```

## Key features

- Job discovery and application flow for candidates
- Resume upload and parsing for recruitment workflows
- Hybrid ranking logic: hard filters + semantic fit + experience + education + graph reasoning
- Explainable candidate feedback with evidence-backed reasons
- Bias guardrails that strip identity-related fields before analysis
- Admin audit trails and override controls for recruiters
- Docker-based local development environment

## Repository structure

```text
Moseb_job_portal/
├── backend/                 # FastAPI app, services, workers, schemas
├── frontend/                # React + Vite user/admin dashboards
├── infra/                   # Nginx, Neo4j, Supabase-related infrastructure
├── data/                    # Knowledge and supporting data files
├── docs/                    # Project docs and architecture references
├── ml-training/             # CV layout model / YOLO training assets
├── .env.example             # Environment template
├── docker-compose.yml       # Main Docker stack
├── docker-compose.dev.yml   # Local dev config
├── Makefile                 # Dev, seed, migrate, test commands
├── package.json             # Root scripts
├── README.md                # Project documentation
├── LICENSE                  # License
├── vercel.json              # Frontend deployment config
└── .github/                 # CI/workflows
```

## Prerequisites

Before starting the project, make sure you have:

- Node.js 18+
- Python 3.10+
- Docker and Docker Compose
- Git
- A Supabase project
- A Gemini API key (optional; the app can fall back to heuristic behavior)

## Quick start

### 1) Clone the repository

```bash
git clone https://github.com/123bruke/Moseb_job_portal.git
cd Moseb_job_portal
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

Update `.env` with your local configuration. Typical values include:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-api-key
NEO4J_PASSWORD=your-neo4j-password
```

### 3) Run the app

```bash
make dev
```

This starts the full local stack. The app is usually available at:

- User app: http://localhost:5173
- API docs: http://localhost:8000/docs

### 4) Initialize database and seed data

```bash
make migrate
make seed
```

## Useful commands

```bash
# start all services
make dev

# bring services down
make down

# run database migrations
make migrate

# populate seed data
make seed

# run backend tests
make test

# run linting checks
make lint
```

## Local development notes

The project supports both user and admin views from the same frontend codebase:

- User view: http://localhost:5173
- Admin view: http://localhost:5174/admin/users

The backend API proxies are configured to work with the local Docker stack and Supabase environment.

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
- SQLAlchemy / Alembic patterns

### AI and data
- ChromaDB
- Neo4j
- Redis / RQ
- LangGraph
- Gemini
- PyMuPDF
- OCR / YOLO-based parsing

### Infrastructure
- Docker
- Nginx
- Supabase Auth
- PostgreSQL

## How ranking works

The application uses a multi-stage hiring evaluation flow:

1. Hard filters check required eligibility criteria
2. A hybrid score blends required skills, experience, and education
3. Semantic and graph-based retrieval helps match candidates to role concepts
4. Explainable reasoning generates evidence-based feedback
5. Recruiters can review and override AI suggestions with an audit trail

## Security and fairness

The system is designed to reduce bias and keep decisions transparent:

- sensitive personal identity data is stripped before analysis
- only role-relevant criteria are evaluated for ranking
- candidate reasoning is grounded in resume evidence
- decisions can be reviewed and explained to users

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Add or update tests where relevant
4. Open a pull request with a clear description of the change

## License

This project is licensed under the MIT License. See the `LICENSE` file for full details.

## Status

This repository is structured as a production-style platform with a working development setup and modular services for frontend, backend, AI processing, and infrastructure.

----

If you want, I can also turn this into a more polished GitHub-style README with badges, screenshots, and a stronger product pitch.
