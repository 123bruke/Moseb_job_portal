from datetime import date

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_role
from app.repositories import pg
from app.repositories.redis_repo import get_redis, queue
from app.schemas.models import RoleIn

router = APIRouter(prefix="/admin", tags=["admin"])
adm = require_role("admin")


@router.get("/jobs-queue")
def jobs_queue(_: CurrentUser = Depends(adm)):
    qs = {n: {"queued": len(queue(n)), "failed": queue(n).failed_job_registry.count} for n in ("ingest", "rank", "default")}
    calls = int(get_redis().get(f"gemini:calls:{date.today().isoformat()}") or 0)
    by_status = pg.all_("select status, count(*) as n from jobs group by status")
    apps = pg.all_("select status, count(*) as n from applications group by status")
    return {"queues": qs, "gemini_calls_today": calls, "jobs": by_status, "applications": apps}


@router.get("/audit")
def audit(limit: int = 100, _: CurrentUser = Depends(adm)):
    return pg.all_("select id, actor, action, entity, entity_id, detail, at from audit_log order by id desc limit %s", (min(limit, 500),))


@router.get("/users")
def users(_: CurrentUser = Depends(adm)):
    return pg.all_("select id, role, full_name, email, created_at from profiles order by created_at desc limit 500")


@router.post("/users/{user_id}/role")
def set_role(user_id: str, body: RoleIn, admin: CurrentUser = Depends(adm)):
    pg.run("update profiles set role=%s where id=%s", (body.role, user_id))
    pg.audit(admin.id, "set_role", "profile", user_id, {"role": body.role})
    return {"ok": True}
