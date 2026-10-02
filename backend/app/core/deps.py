"""FastAPI dependencies: auth, role enforcement, rate limiting."""
from dataclasses import dataclass
from typing import Callable

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.errors import AppError, forbidden
from app.core.security import verify_token
from app.repositories import pg
from app.repositories.redis_repo import get_redis

bearer = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    id: str
    role: str
    email: str
    full_name: str


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> CurrentUser:
    if creds is None:
        raise AppError(401, "unauthenticated", "Missing bearer token")
    claims = verify_token(creds.credentials)
    row = pg.one("select id, role, email, full_name from profiles where id = %s", (claims["sub"],))
    if not row:
        raise AppError(403, "no_profile", "Profile not created yet")
    return CurrentUser(id=str(row["id"]), role=row["role"], email=row["email"], full_name=row["full_name"])


def require_role(*roles: str) -> Callable[[CurrentUser], CurrentUser]:
    def dep(user: CurrentUser = Depends(current_user)) -> CurrentUser:
        if user.role not in roles:
            raise forbidden(f"requires role: {', '.join(roles)}")
        return user
    return dep


def rate_limit(name: str, limit: int, window_s: int = 60) -> Callable:
    """Fixed-window per-user limiter backed by Redis."""
    def dep(request: Request, user: CurrentUser = Depends(current_user)) -> None:
        key = f"rl:{name}:{user.id}"
        r = get_redis()
        n = r.incr(key)
        if n == 1:
            r.expire(key, window_s)
        if n > limit:
            raise AppError(429, "rate_limited", "Too many requests, slow down")
    return dep


def optional_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> CurrentUser | None:
    return current_user(creds) if creds else None


def owned_job(job_id: str, user: CurrentUser) -> dict:
    """The job row, only if the current company owns it (admins may read)."""
    row = pg.one("""select j.*, c.owner_profile_id from jobs j join companies c on c.id=j.company_id where j.id=%s""", (job_id,))
    if not row:
        raise AppError(404, "not_found", "job not found")
    if str(row["owner_profile_id"]) != user.id and user.role != "admin":
        raise forbidden("not your job")
    return row
