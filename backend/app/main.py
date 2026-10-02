import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core import errors
from app.core.config import get_settings
from app.core.logging import request_id_var, setup_logging
from app.routers import admin, applications, auth, candidates, chat, companies, health, jobs, ranking

setup_logging()
app = FastAPI(title="Smart Resume Checker v2", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_list, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
errors.install(app)


@app.middleware("http")
async def request_id(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    request_id_var.set(rid)
    resp = await call_next(request)
    resp.headers["x-request-id"] = rid
    return resp


for r in (health.router, auth.router, candidates.router, companies.router, jobs.router,
          applications.router, ranking.router, chat.router, admin.router):
    app.include_router(r)
