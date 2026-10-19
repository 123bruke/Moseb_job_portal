"""Supabase Storage via REST (service-role key, backend/worker only)."""
import httpx

from app.core.config import get_settings


def _base() -> tuple[str, dict]:
    s = get_settings()
    return f"{s.supabase_url}/storage/v1", {"Authorization": f"Bearer {s.supabase_service_role_key}",
                                           "apikey": s.supabase_service_role_key}


def upload(path: str, data: bytes, content_type: str) -> str:
    base, h = _base()
    b = get_settings().storage_bucket
    r = httpx.post(f"{base}/object/{b}/{path}", content=data, timeout=60,
                   headers={**h, "Content-Type": content_type, "x-upsert": "true"})
    r.raise_for_status()
    return path


def download(path: str) -> bytes:
    base, h = _base()
    r = httpx.get(f"{base}/object/{get_settings().storage_bucket}/{path}", headers=h, timeout=60)
    r.raise_for_status()
    return r.content


def delete(paths: list[str]) -> None:
    if not paths:
        return
    base, h = _base()
    r = httpx.request("DELETE", f"{base}/object/{get_settings().storage_bucket}", headers=h,
                      json={"prefixes": paths}, timeout=60)
    r.raise_for_status()


def signed_url(path: str, expires_in: int = 300) -> str:
    base, h = _base()
    b = get_settings().storage_bucket
    r = httpx.post(f"{base}/object/sign/{b}/{path}", headers=h, json={"expiresIn": expires_in}, timeout=30)
    r.raise_for_status()
    return f"{get_settings().supabase_url}/storage/v1{r.json()['signedURL']}"
