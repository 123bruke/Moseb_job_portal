# Smart Resume Checker v2

Explainable, bias-guarded resume ranking. Candidates get a ranked job feed and honest AI feedback; companies get a shortlist
with reasoning they can audit and override. Rebuilt from the `Smart Resume Checker v2: Full Architecture` document
(`docs/architecture-v2.html`).

```
React (Vite/TS/Tailwind) ─ Supabase JWT ─▶ Nginx ─▶ FastAPI ─▶ Supabase (Auth + Postgres + Storage)
                                                    │         ChromaDB · Neo4j · Redis queue
                                                    └──▶ Worker (RQ): ingest · rank · cleanup ─▶ PyMuPDF/OCR/YOLO · LangGraph · Gemini
```

## Quick start

```bash
cp .env.example .env            # fill SUPABASE_*, GEMINI_API_KEY, NEO4J_PASSWORD
# 1) Supabase: run infra/supabase/migrations/0001_init.sql (SQL editor, `supabase db push`, or `make migrate`)
# 2) Make yourself admin once:  update profiles set role='admin' where email='you@example.com';
make dev                        # compose + hot reload  → http://localhost:5173 (API :8000)
make seed                       # knowledge → Chroma, skills → Postgres, RELATED_TO → Neo4j
```

Without `GEMINI_API_KEY` the system still runs on its fallbacks (heuristic parser, vocabulary-based rubric, templated explanations),
which is handy for local development and CI.

## Two terminals: user view and admin view

The frontend runs twice from the same code, each dev server locked to one face of the app.

| Terminal | Command | URL | Shows |
| --- | --- | --- | --- |
| 1 — user | `npm run dev:user` | http://localhost:5173 | landing, browse, candidate, company |
| 2 — admin | `npm run dev:admin` | http://localhost:5174/admin/users | users, queue, audit |

Both run from `frontend/`, both proxy `/api` to the backend on `:8000`, and both talk to the same
Supabase project, so signing in once on either terminal signs in on both. On the admin server the
nav is admin-only and any URL outside `/admin/*` redirects to `/admin/users`; `/admin/*` is still
role-guarded in the browser and by the API, so a non-admin account gets bounced. Ports are
`strictPort`, so a stale server on 5173/5174 fails loudly instead of silently drifting.

The switch is one variable: `frontend/.env.admin` sets `VITE_APP_VIEW=admin`, which `vite --mode admin`
injects. `npm run dev` and `npm run build` stay on the user view.

Sign-in to seed the admin account once: `update profiles set role='admin' where email='you@example.com';`

## How ranking works

1. **Hard filters** run first: missing must-have, below minimum years, location or work-authorization. A failing candidate is marked *not eligible with a reason*, never silently dropped.
2. **Hybrid score 0-100** (weights editable per job): must-have coverage 35 · semantic similarity 25 · experience 20 · education 10 · skill-graph proximity 10 (`services/scoring.py`, pure and unit-tested).
3. **Agent graph** (LangGraph) writes a visible trace per candidate: understand rubric → retrieve evidence → verify each requirement (met/partial/missing **with a quote that must exist in the resume**) → score → bias/hallucination self-check → explanation.
4. **Pairwise comparison** of the top ~10 breaks near-ties and writes the head-to-head text. The company can override the order; every override is audited.

**Bias guard:** `services/bias.py` strips name, photo, age, gender, nationality and contact data before chunking, embedding or scoring. Companies see anonymous labels until a candidate is shortlisted.
**Prompt injection:** resume text is wrapped as data, the system prompt tells Gemini to ignore instructions inside documents, and LLM verdicts without a verifiable quote are downgraded to *missing*.

## Data lifecycle
After the shortlist is delivered, non-selected applicants lose their resume file, Chroma chunks, graph resume edges, parsed data and reasoning after `RETENTION_DAYS` (default 30); only `(application id, status, timestamps)` remains. Candidates consent at apply time and can use **Delete my account and data**.

## Layout
`backend/app/{core,routers,schemas,services,repositories,agents,prompts,ml,workers}` · `frontend/src/{app,components,pages,hooks,lib,styles}` · `infra/{nginx,neo4j,supabase}` · `data/knowledge` · `.github/workflows/{ci,cd,security}.yml` · `docs/`

## Tests
```bash
cd backend && pytest -q          # unit + ranking eval gate (≥95% on labelled pairs) + coverage gate
cd backend && pytest -m integration --no-cov   # needs the compose stack
cd frontend && npm test && npm run typecheck && npm run lint
```

## Build status vs the milestone plan
M1-M7 are implemented. M8 (hardening) is scaffolded: CI with Trivy, CodeQL, gitleaks, an eval gate and a CD pipeline with migrate-first deploy and automatic rollback on `/ready`. Still yours to do: real Supabase project + secrets, YOLO training data (`ml-training/`), a larger labelled eval set, and a load test.

## Honest limits
- This was generated without network access, so Docker images, `pip install` and `npm ci` were **not** run here. What was run: Python compile of every module, the pure-logic tests (scoring, normalisation, bias guard, agent pipeline with fake retrieval, parser, knowledge extraction on your real data), YAML validation of compose and workflows, and a syntax-level TypeScript pass. Expect to fix small dependency or type issues on first `npm ci` / `pytest`.
- Auto-ranking supports hiring decisions; it should not make them alone.
