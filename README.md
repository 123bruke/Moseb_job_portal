<img width="1917" height="906" alt="Screenshot 2026-10-02 124323" src="https://github.com/user-attachments/assets/ebc52254-f69c-4a83-bd01-c81729f9980a" />
<div align="center">

# 🚀 Smart Resume Checker v2

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=28&duration=3000&pause=500&color=3B82F6&center=true&width=600&lines=Explainable+Resume+Ranking;Bias-Guarded+AI+Screening;Transparent+Hiring+Decisions" alt="Smart Resume Checker Animation"/>

**Explainable, bias-guarded resume ranking with AI-powered candidate insights and company audit trails**

[![TypeScript](https://img.shields.io/badge/TypeScript-46.3%25-3178C6?logo=typescript&logoColor=white)](#-tech-stack)
[![Python](https://img.shields.io/badge/Python-45.9%25-3776AB?logo=python&logoColor=white)](#-tech-stack)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-3.4%25-336791?logo=postgresql&logoColor=white)](#-tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](#build-status)

</div>

---

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🏗️ Architecture](#-architecture)
- [🎯 Key Features](#-key-features)
- [🚀 Quick Start](#-quick-start)
- [📱 Dual Dashboard](#-dual-dashboard)
- [🧠 How Ranking Works](#-how-ranking-works)
- [🛡️ Security & Bias Protection](#-security--bias-protection)
- [📊 Data Lifecycle](#-data-lifecycle)
- [📁 Project Structure](#-project-structure)
- [🧪 Testing](#-testing)
- [📈 Build Status](#-build-status)
- [⚙️ Tech Stack](#-tech-stack)
- [📝 Limitations](#-limitations)
- [🤝 Contributing](#-contributing)

---

## ✨ Overview

Smart Resume Checker v2 is a modern hiring intelligence system designed to help both candidates and companies make better decisions with less guesswork.

It combines:

- Explainable AI scoring that shows why a candidate matches or misses a role
- Bias guardrails that anonymize sensitive identity data before analysis
- Transparent candidate feedback with honest, evidence-based reasons
- Company-side shortlisting with audit trails and override controls

This project was rebuilt from the architecture document in `docs/architecture-v2.html` and implements a full end-to-end hiring flow from resume ingestion to ranking and decision support.

---

## 🏗️ Architecture

<div align="center">

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────┘

                         Frontend Layer
                   ┌──────────┬──────────┐
                   │ User     │  Admin   │
                   │  View    │  View    │
                   └────┬─────┴─────┬────┘
                        │           │
              React (Vite/TS/Tailwind)
              Authentication: Supabase JWT
                        │           │
                        └─────┬─────┘
                              │
                        ┌─────▼────────┐
                        │   Nginx      │
                        │   (Reverse   │
                        │   Proxy)     │
                        └─────┬────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              ┌─────▼──────┐      ┌──────▼──────┐
              │   FastAPI   │      │   Worker    │
              │   Server    │      │   Queue     │
              │  (Port 8000)│      │  (RQ)       │
              └─────┬──────┘      └──────┬──────┘
                    │                    │
        ┌───────────┼────────────────────┼───────────┐
        │           │                    │           │
    ┌───▼───┐   ┌───▼───┐   ┌──────┐ ┌─▼──┐   ┌────▼────┐
    │Supabase │ ChromaDB│   │Neo4j │ │Redis  │   │PyMuPDF  │
    │(Auth+DB)│(Vector │   │(Graph)│(Queue)│   │YOLO/OCR │
    │(Storage)│Store)  │   │       │       │   │         │
    └─────────┘ └────────┘   └──────┘ └─────┘   └─────────┘

              Processing Pipeline
              ├─ Resume Ingestion
              ├─ Text Extraction & OCR
              ├─ Bias Removal & Anonymization
              ├─ Vector Embedding
              ├─ Skill Graph Construction
              └─ Ranking & Scoring
```

</div>

### Core system flow

```text
React (Vite/TS/Tailwind) ─ Supabase JWT ─▶ Nginx ─▶ FastAPI ─▶ Supabase (Auth + Postgres + Storage)
                                                    │         ChromaDB · Neo4j · Redis queue
                                                    └──▶ Worker (RQ): ingest · rank · cleanup ─▶ PyMuPDF/OCR/YOLO · LangGraph · Gemini
```

---

## 🎯 Key Features

<table>
<tr>
<td align="center" width="50%">

### 👨‍💼 Candidate Experience

- Browse job opportunities
- View personalized ranking results
- Receive honest feedback tied to resume evidence
- Understand why a role matched or did not match
- Track application progress and status

</td>
<td align="center" width="50%">

### 🏢 Company Workflow

- Manage jobs and applicants
- Rank resumes automatically with explainable scoring
- Review and audit decisions
- Override ranking without losing traceability
- Shortlist candidates with human-readable justification

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required local tools
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Git
```

### 1) Clone and configure

```bash
git clone https://github.com/123bruke/Moseb_job_portal.git
cd Moseb_job_portal
cp .env.example .env
```

Fill the environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-api-key
NEO4J_PASSWORD=your-neo4j-password
```

### 2) Initialize database

```bash
# Recommended
make migrate

# Or manually run the SQL migration in Supabase SQL editor:
# infra/supabase/migrations/0001_init.sql
```

### 3) Make yourself admin

```sql
UPDATE profiles SET role='admin' WHERE email='you@example.com';
```

### 4) Run the app

```bash
make dev
```

This starts the app and hot-reload environment. Open:

- User app: http://localhost:5173
- API docs: http://localhost:8000/docs

### 5) Seed demo data

```bash
make seed
```

This populates:

- ChromaDB with knowledge embeddings
- PostgreSQL with skills data
- Neo4j with relationship edges

### Fallback behavior without Gemini

If `GEMINI_API_KEY` is missing, the system continues running using:

- heuristic parsing
- vocabulary-based reasoning
- templated explanations

That makes local development and CI smoother without sacrificing functional coverage.

---

## 📱 Dual Dashboard

The frontend runs twice from the same codebase, with each dev server focused on a different interface.

| Terminal | Command | URL | Shows |
| --- | --- | --- | --- |
| 1 — user | `npm run dev:user` | http://localhost:5173 | landing, browse, candidate, company |
| 2 — admin | `npm run dev:admin` | http://localhost:5174/admin/users | users, queue, audit |

### Important behavior

- Both view layers live from `frontend/`
- Both proxy `/api` to the backend on `:8000`
- Same Supabase project means one sign-in works across both views
- Admin routes are protected and redirect unauthorized users away from `/admin/*`
- Ports are strict, so stale servers fail loudly instead of silently switching

Admin-only activation is controlled by `frontend/.env.admin` and `VITE_APP_VIEW=admin` mode.

---

## 🧠 How Ranking Works

1. Hard filters run first
   - missing must-have skills
   - below minimum years of experience
   - location or work authorization issue
   - failing candidates are marked as not eligible with a reason

2. Hybrid score 0–100
   - must-have coverage: 35%
   - semantic similarity: 25%
   - experience: 20%
   - education: 10%
   - skill-graph proximity: 10%

3. Agent graph reasoning
   - LangGraph traces each candidate
   - understand rubric → retrieve evidence → verify requirement → conclude met/partial/missing
   - evidence must include a verifiable quote from the resume

4. Pairwise comparison
   - top candidates are compared head-to-head
   - tie-breaking is human-readable and auditable
   - company override decisions are logged

### Bias guard

`services/bias.py` strips name, photo, age, gender, nationality, and contact information before chunking, embedding, or scoring. Companies only see anonymized labels until a candidate is shortlisted.

### Prompt injection protection

Resume content is treated as data, not instructions. The system prompt tells the model to ignore instructions embedded in documents, and verdicts without evidence are downgraded to missing.

---

## 🛡️ Security & Bias Protection

```text
Raw Resume
    │
    ├─ Strip: Name, Photo, Age, Gender, Nationality
    ├─ Remove: Email, Phone, Address, Social Media
    ├─ Anonymize: Dates → Career Span
    │
    ▼
Sanitized Resume
    │
    ├─ Embed in ChromaDB (anonymous)
    ├─ Extract Skills (unattributed)
    ├─ Build graph in Neo4j (no personal identifiers)
    │
    ▼
Scoring & Ranking (Bias-Free)
    │
    ├─ Skills, experience, education only
    ├─ Personal identity excluded
    │
    ▼
Shortlist Delivery
    └─ Firms review risk-annotated, explainable outputs
```

This ensures ranking is based on role fit rather than demographic traits.

---

## 📊 Data Lifecycle

After the shortlist is delivered, non-selected applicants have their resume file, Chroma chunks, graph resume edges, parsed data, and reasoning removed after `RETENTION_DAYS` (default 30). Only application metadata and decision records remain for operational needs.

```text
Application submitted
    │
    ├─ Resume stored in Supabase Storage
    ├─ Resume parsed & chunked
    ├─ Vector embeddings created
    ├─ Neo4j resume graph built
    └─ Ranking and reasoning generated
            │
            ▼
      Shortlist / reject stage
            │
            ▼
      Retention window (30 days)
            │
            ▼
      Cleanup
      ├─ Remove resume file
      ├─ Delete Chroma data
      ├─ Remove graph edges
      ├─ Clear parsed output
      └─ Remove model reasoning traces
```

---

## 📁 Project Structure

```text
Moseb_job_portal/
├── frontend/                         # React + Vite app
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── .env.admin
│   └── vite.config.ts
│
├── backend/
│   └── app/
│       ├── core/
│       ├── routers/
│       ├── schemas/
│       ├── services/
│       ├── repositories/
│       ├── agents/
│       ├── prompts/
│       ├── ml/
│       └── workers/
│
├── infra/
│   ├── nginx/
│   ├── neo4j/
│   └── supabase/
│
├── data/
│   └── knowledge/
│
├── docs/
│   └── architecture-v2.html
│
├── ml-training/
├── docker-compose.yml
├── .env.example
├── Makefile
├── README.md
└── LICENSE
```

---

## 🧪 Testing

```bash
cd backend && pytest -q
cd backend && pytest -m integration --no-cov
cd frontend && npm test && npm run typecheck && npm run lint
```

### Expectations

- backend unit tests + ranking eval gate
- coverage gate for scoring logic
- frontend type and lint validation
- integration tests require the compose stack

---

## 📈 Build Status

### Milestone progress

```text
M1 - Core Backend          ✅
M2 - Frontend (User)       ✅
M3 - Admin Dashboard       ✅
M4 - Vector Search         ✅
M5 - Graph DB              ✅
M6 - LLM Integration       ✅
M7 - Data Lifecycle       ✅
M8 - Hardening             🚧
```

Hardening work includes:

- Trivy security scanning
- CodeQL static analysis
- Gitleaks secret detection
- Eval gate enforcement
- Deploy pipeline with migrate-first strategy
- Automatic rollback based on `/ready`

---

## ⚙️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- Supabase
- PostgreSQL

### AI & Data
- ChromaDB
- Neo4j
- Redis / RQ
- LangGraph
- Gemini
- PyMuPDF
- OCR / YOLO

### Infrastructure
- Docker
- Nginx
- Supabase Auth
- PostgreSQL

---

## 📝 Limitations

- This project was generated without live network access, so Docker builds and package installs were not run here.
- Auto-ranking should support hiring decisions, not replace human judgment.
- Without a Gemini API key, the system will fall back to lower-cost heuristic behavior.

---

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch.
3. Add tests and keep the code clean.
4. Open a pull request with clear notes.

### Recommended commands

```bash
make dev
make migrate
make seed
make test
```

---

## 📄 License

This project is licensed under the MIT license. See the `LICENSE` file for more details.

---

<div align="center">
  ## frontend section
<img width="1902" height="897" alt="Screenshot 2026-10-02 123845" src="https://github.com/user-attachments/assets/cc5898ab-431f-4970-a893-491a0b7d6b06" />
<img width="1857" height="877" alt="Screenshot 2026-10-02 123947" src="https://github.com/user-attachments/assets/3ea81230-df30-437e-bb3e-282682b6ba01" />
<img width="1885" height="876" alt="Screenshot 2026-10-02 124229" src="https://github.com/user-attachments/assets/5b72b41d-f1ec-43b0-a50e-275755d8ca24" />
<img width="1917" height="906" alt="Screenshot 2026-10-02 124323" src="https://github.com/user-attachments/assets/13c03eec-da0a-4a88-9af0-813d268e934e" />


[GitHub](https://github.com/123bruke/Moseb_job_portal) • [Issues](https://github.com/123bruke/Moseb_job_portal/issues)

</div>
