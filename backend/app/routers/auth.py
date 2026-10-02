from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, current_user
from app.repositories import pg
from app.schemas.models import MeUpdate

router = APIRouter(tags=["auth"])


@router.get("/me")
def me(user: CurrentUser = Depends(current_user)):
    row = pg.one("select id, role, full_name, email, nationality, phone, location, created_at from profiles where id=%s", (user.id,))
    return row


@router.patch("/me")
def update_me(body: MeUpdate, user: CurrentUser = Depends(current_user)):
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():  # keys come from the pydantic model, never from the client
        pg.run(f"update profiles set {k}=%s where id=%s", (v, user.id))
    return me(user)


@router.get("/notifications")
def notifications(user: CurrentUser = Depends(current_user)):
    return pg.all_("select id, type, payload, read, created_at from notifications where profile_id=%s order by id desc limit 50", (user.id,))


@router.post("/notifications/read")
def mark_read(user: CurrentUser = Depends(current_user)):
    pg.run("update notifications set read=true where profile_id=%s", (user.id,))
    return {"ok": True}


@router.delete("/me")
def delete_me(user: CurrentUser = Depends(current_user)):
    """'Delete my account and data'."""
    import httpx

    from app.core.config import get_settings
    from app.services.cleanup import delete_account_data
    delete_account_data(user.id)
    s = get_settings()
    httpx.delete(f"{s.supabase_url}/auth/v1/admin/users/{user.id}", timeout=20,
                 headers={"Authorization": f"Bearer {s.supabase_service_role_key}", "apikey": s.supabase_service_role_key})
    return {"deleted": True}
