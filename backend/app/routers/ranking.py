from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, current_user, owned_job, require_role
from app.core.errors import bad_request, not_found
from app.repositories import pg, storage_repo
from app.schemas.models import OverrideIn
from app.services import ranking

router = APIRouter(tags=["ranking"])
comp = require_role("company")


@router.get("/jobs/{job_id}/shortlist")
def shortlist(job_id: str, user: CurrentUser = Depends(comp)):
    owned_job(job_id, user)
    sl = pg.one("select * from shortlists where job_id=%s order by generated_at desc limit 1", (job_id,))
    if not sl:
        raise not_found("shortlist (job not ranked yet)")
    items = pg.all_("""select i.rank, i.summary, i.application_id, s.total, s.confidence, s.breakdown_json, p.full_name, p.email, p.location
                       from shortlist_items i join applications a on a.id=i.application_id join profiles p on p.id=a.candidate_id
                       join scores s on s.application_id=i.application_id where i.shortlist_id=%s order by i.rank""", (sl["id"],))
    url = storage_repo.signed_url(sl["report_path"], 300) if sl["report_path"] else None
    return {"generated_at": sl["generated_at"], "comparison": sl["comparison_text"], "report_url": url, "items": items}


@router.get("/jobs/{job_id}/ranking")
def full_ranking(job_id: str, user: CurrentUser = Depends(comp)):
    """All scored applicants (including not-eligible with reasons), anonymous labels."""
    owned_job(job_id, user)
    rows = pg.all_("""select a.id as application_id, a.status, s.total, s.rank, s.eligible, s.ineligible_reasons, s.confidence, s.breakdown_json
                      from applications a join scores s on s.application_id=a.id where a.job_id=%s order by s.rank nulls last, s.total desc""", (job_id,))
    for i, r in enumerate(rows, 1):
        r["label"] = f"Candidate {i}"
    return rows


@router.get("/applications/{app_id}/reasoning")
def reasoning(app_id: str, user: CurrentUser = Depends(comp)):
    a = pg.one("select job_id from applications where id=%s", (app_id,))
    if not a:
        raise not_found("application")
    owned_job(str(a["job_id"]), user)
    return pg.all_("select step, name, content, evidence_refs, created_at from reasoning_traces where application_id=%s order by step, id", (app_id,))


@router.post("/jobs/{job_id}/override")
def override(job_id: str, body: OverrideIn, user: CurrentUser = Depends(comp)):
    owned_job(job_id, user)
    try:
        ranking.apply_override(job_id, user.id, body.application_id, body.new_rank, body.reason)
    except ValueError as e:
        raise bad_request(str(e)) from None
    return {"ok": True}
