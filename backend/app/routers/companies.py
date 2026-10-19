from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, require_role
from app.core.errors import AppError, not_found
from app.repositories import pg
from app.schemas.models import CompanyIn

router = APIRouter(prefix="/companies", tags=["companies"])
comp = require_role("company")


@router.post("", status_code=201)
def create(body: CompanyIn, user: CurrentUser = Depends(comp)):
    if pg.one("select 1 from companies where owner_profile_id=%s", (user.id,)):
        raise AppError(409, "exists", "Company profile already exists")
    row = pg.one("""insert into companies (owner_profile_id, name, industry, website, size, logo_url, brand_color)
                    values (%s,%s,%s,%s,%s,%s,%s) returning *""",
                 (user.id, body.name, body.industry, body.website, body.size, body.logo_url, body.brand_color))
    return row


@router.get("/me")
def mine(user: CurrentUser = Depends(comp)):
    row = pg.one("select * from companies where owner_profile_id=%s", (user.id,))
    if not row:
        raise not_found("company")
    return row


@router.patch("/me")
def update(body: CompanyIn, user: CurrentUser = Depends(comp)):
    row = pg.one("""update companies set name=%s, industry=%s, website=%s, size=%s, logo_url=%s, brand_color=%s
                    where owner_profile_id=%s returning *""",
                 (body.name, body.industry, body.website, body.size, body.logo_url, body.brand_color, user.id))
    if not row:
        raise not_found("company")
    return row
