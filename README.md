# Moseb Job Portal

**A hiring platform for discovering jobs, reviewing applicants, and making candidate matches easier to understand.**

Moseb Job Portal combines a React and TypeScript frontend with a Python/FastAPI backend. Its workflows bring together job applications, resume processing, candidate matching, and recruiter review, with an emphasis on explainable results and human oversight.

## What it does

- Supports candidate job discovery and applications
- Accepts resumes for parsing and recruitment workflows
- Helps compare candidates with role requirements using skills, experience, and education signals
- Presents reasons behind candidate matches to support review
- Provides recruiter/admin workflows for reviewing applicants and recommendations
- Uses background workers and search services for data processing and retrieval

> **Note:** Automated scores and recommendations are decision-support tools, not substitutes for human review.

## How it fits together

```text
React + TypeScript frontend
          │
          ▼
      Nginx gateway
          │
          ▼
    FastAPI backend ─────── Supabase / PostgreSQL
          │
          ├── Resume processing and matching
          ├── Redis / RQ background jobs
          ├── ChromaDB vector search
          ├── Neo4j graph data
          └── Optional AI inference
```

The repository also includes Docker Compose configuration for running the application and its supporting services locally.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Authentication and relational data | Supabase, PostgreSQL |
| Search and background jobs | ChromaDB, Neo4j, Redis, RQ |
| Infrastructure | Docker Compose, Nginx |
| Resume processing | PyMuPDF and OCR fallback; optional YOLO layout model |

## Repository layout

```text
.
├── backend/              # API, services, schemas, and workers
├── frontend/             # React application
├── infra/                # Nginx and supporting service configuration
├── data/                 # Supporting data
├── docs/                 # Project documentation
├── ml-training/          # Optional CV layout-model training instructions
├── docker-compose.yml    # Main service stack
├── docker-compose.dev.yml# Development overrides
├── Makefile              # Common development commands
└── .env.example          # Environment variable template
```

## Run locally

### Requirements

- Git
- Docker and Docker Compose
- Node.js 18+ and Python 3.10+ for running frontend or backend tools outside Docker
- Supabase project credentials

Some AI features may also require a provider API key. Check `.env.example` and the relevant service configuration for the variables used by your checkout.

### 1. Clone the repository

```bash
git clone https://github.com/123bruke/Moseb_job_portal.git
cd Moseb_job_portal
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in the values required by your local setup. Keep secrets in `.env`; do not commit them.

### 3. Start the development stack

```bash
make dev
```

The frontend is typically available at [http://localhost:5173](http://localhost:5173), and the API documentation at [http://localhost:8000/docs](http://localhost:8000/docs), depending on the development Compose configuration.

### 4. Apply migrations and seed data

After the services are running:

```bash
make migrate
make seed
```

## Common commands

| Command | Purpose |
| --- | --- |
| `make dev` | Build and start the development stack |
| `make up` | Build and start the main stack in the background |
| `make down` | Stop Compose services |
| `make migrate` | Apply database migrations |
| `make seed` | Seed knowledge data |
| `make test` | Run backend and frontend tests |
| `make lint` | Run backend and frontend lint/type checks |

The frontend can also be started independently from `frontend/` with `npm install` followed by `npm run dev`. See `frontend/package.json` for additional scripts.

## Matching and review

The matching workflow combines role requirements with candidate information such as skills, experience, and education. Semantic and graph-based retrieval can add context to matching. Recruiters should review the evidence and recommendation details before making decisions; the platform is intended to assist, not automate, hiring decisions.

## Resume layout model

The layout-detection model is optional. Resume processing can use text extraction and OCR fallback when the model is unavailable. Training notes and setup instructions are in [`ml-training/README.md`](ml-training/README.md).

## Contributing

Contributions are welcome. Fork the repository, create a focused branch, make and test your changes, then open a pull request describing the update.

## License

See [`LICENSE`](LICENSE) for license details.
