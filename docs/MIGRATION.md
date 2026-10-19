# From v1 to v2: what happened to each old file

| v1 | v2 |
|---|---|
| `thinkingmodel/flask.py` (Flask) | Dropped. Every route is a FastAPI router in `backend/app/routers/` |
| `smart-control-dashboard/collection/st2/server.ts` (Express + SQLite + custom JWT, fallback secret `resucheck-secret-key`) | Supabase Auth; FastAPI only verifies the JWT (`core/security.py`) |
| `extraction/.../pdf.py` (imported itself, never ran) | `ml/pdf_reader/reader.py` (PyMuPDF, OCR fallback, DOCX/TXT, magic-byte sniffing) |
| `image_extraction/detect/*.py` | `ml/yolo/layout.py` (optional YOLO, heuristic fallback) |
| `Machine_Learning_model/full_langchain_system/djuge.py` (BART-MNLI PASS/FAIL, tokenizer never imported) | LangGraph agent graph in `app/agents/` with scored, evidenced reasoning. No local HF model needed |
| `saving.py` (all datasets as one giant string) | `services/knowledge.py` + `scripts/seed_knowledge.py`: role/skill chunks in Chroma, skills in Postgres, `RELATED_TO` edges in Neo4j |
| `storing/conn.py`, `collective/*.sql` (hard-coded hosts, broken SQL) | `repositories/pg.py` + `infra/supabase/migrations/0001_init.sql` (env config, RLS) |
| `MODEL DATA/*.json` | `data/knowledge/<domain>/` (5 of the 11 files are truncated/malformed JSON; the seeder reads them anyway) |
| `src/components/*.tsx` (Gemini called from the browser) | `frontend/src/` pages and components; Gemini is only called server-side |

**Security note:** v1 shipped a fallback JWT secret in source. If any real credential or `JWT_SECRET` from v1 was ever deployed, rotate it.
