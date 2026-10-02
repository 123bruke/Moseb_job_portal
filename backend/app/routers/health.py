from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/ready")
def ready():
    """Dependencies reachable? Used by CD for rollback decisions."""
    checks: dict[str, str] = {}
    from app.repositories import chroma_repo, neo4j_repo, pg
    from app.repositories.redis_repo import get_redis
    probes = {"postgres": lambda: pg.one("select 1 as ok"), "redis": lambda: get_redis().ping(),
              "chroma": lambda: chroma_repo.client().heartbeat(), "neo4j": lambda: neo4j_repo.run("RETURN 1 AS ok")}
    for name, fn in probes.items():
        try:
            fn()
            checks[name] = "ok"
        except Exception:
            checks[name] = "down"
    ok = all(v == "ok" for v in checks.values())
    return JSONResponse(status_code=200 if ok else 503, content={"ready": ok, "checks": checks})
