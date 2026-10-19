import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core import errors
from app.core.config import get_settings
from app.core.logging import request_id_var, setup_logging
from app.routers import admin, applications, assistant, auth, candidates, chat, companies, health, jobs, ranking

setup_logging()
app = FastAPI(title="Moseb Job Portal API", version="2.0.0")

# Allow local dev and production deployments (including Vercel previews and custom domains)
settings = get_settings()
cors_origins = settings.cors_list if settings.cors_list else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.render\.com|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
errors.install(app)


@app.middleware("http")
async def request_id(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    request_id_var.set(rid)
    resp = await call_next(request)
    resp.headers["x-request-id"] = rid
    return resp


@app.get("/")
@app.get("/api")
def root():
    return {
        "status": "ok",
        "service": "Moseb Job Portal API",
        "version": "2.0.0",
        "health": "/health",
        "docs": "/docs",
    }


# Include all routers both at root level AND under /api prefix
# This prevents 404s regardless of whether the frontend calls /api/* or /*
ALL_ROUTERS = (
    health.router,
    auth.router,
    candidates.router,
    companies.router,
    jobs.router,
    applications.router,
    ranking.router,
    chat.router,
    admin.router,
    assistant.router,
)

for r in ALL_ROUTERS:
    app.include_router(r)
    app.include_router(r, prefix="/api")
