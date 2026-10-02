import json

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.deps import CurrentUser, rate_limit, require_role
from app.core.errors import AppError, bad_request, forbidden, not_found
from app.core.deps import current_user
from app.repositories import pg, storage_repo
from app.services import feed
from app.utils.uploads import validate_upload
from app.workers import ingest_resume

router = APIRouter(tags=["applications"])


@router.post("/jobs/{job_id}/apply", status_code=201, dependencies=[Depends(rate_limit("apply", 10, 3600))])
def apply(job_id: str, resume: UploadFile = File(...), form_answers: str = Form("{}"), consent: bool = Form(False),
          user: CurrentUser = Depends(require_role("candidate"))):
    if not consent:
        raise bad_request("You must accept that your resume is deleted after the decision", "consent_required")
    job = pg.one("select id, status, deadline from jobs where id=%s", (job_id,))
    if not job or job["status"] != "open":
        raise not_found("open job")
    if pg.one("select 1 from jobs where id=%s and deadline is not null and deadline < now()", (job_id,)):
        raise AppError(409, "deadline_passed", "Applications are closed")
    if pg.one("select 1 from applications where job_id=%s and candidate_id=%s", (job_id, user.id)):
        raise AppError(409, "already_applied", "You already applied to this job")
    try:
        answers = json.loads(form_answers)
        assert isinstance(answers, dict)
    except Exception:
        raise bad_request("form_answers must be a JSON object") from None
    data = resume.file.read(10 * 1024 * 1024 + 1)
    kind, name = validate_upload(data, resume.filename or "resume")
    app = pg.one("""insert into applications (job_id, candidate_id, form_answers_json, consent_deletion) values (%s,%s,%s,true) returning id""",
                 (job_id, user.id, pg.json(answers)))
    path = f"resumes/{job_id}/{app['id']}/{name}"
    storage_repo.upload(path, data, "application/octet-stream")
    pg.run("update applications set resume_path=%s where id=%s", (path, app["id"]))
    ingest_resume.enqueue(str(app["id"]))
    feed.record_event(user.id, job_id, "apply")
    return {"id": str(app["id"]), "status": "submitted"}


def _load(app_id: str, user: CurrentUser) -> tuple[dict, bool]:
    a = pg.one("""select a.*, j.title, j.company_id, c.owner_profile_id from applications a join jobs j on j.id=a.job_id
                  join companies c on c.id=j.company_id where a.id=%s""", (app_id,))
    if not a:
        raise not_found("application")
    is_owner = str(a["owner_profile_id"]) == user.id
    if str(a["candidate_id"]) != user.id and not is_owner and user.role != "admin":
        raise forbidden()
    return a, is_owner or user.role == "admin"


@router.get("/applications/{app_id}")
def get_application(app_id: str, user: CurrentUser = Depends(current_user)):
    a, company_view = _load(app_id, user)
    score = pg.one("select total, breakdown_json, eligible, ineligible_reasons, rank, confidence from scores where application_id=%s", (app_id,))
    out = {"id": str(a["id"]), "job_id": str(a["job_id"]), "job_title": a["title"], "status": a["status"], "created_at": a["created_at"],
           "error": a["error"], "decided_at": a["decided_at"]}
    if not company_view:   # candidate: only own AI feedback (no ranks / other candidates)
        exp = ((score or {}).get("breakdown_json") or {}).get("explanation") or {}
        out["feedback"] = {"missing_skills": [r["requirement"] for r in ((score or {}).get("breakdown_json") or {}).get("verification", []) if r["status"] == "missing"],
                           "improvements": exp.get("candidate_feedback", []), "selected": a["status"] == "shortlisted" if a["decided_at"] else None}
        return out
    out["score"] = score
    parsed = pg.one("select structured_json, total_years, parse_confidence from parsed_resumes where application_id=%s", (app_id,))
    if parsed:
        from app.services.bias import sanitize_resume
        shortlisted = a["status"] == "shortlisted"   # identity only for delivered (shortlisted) candidates
        out["resume"] = parsed["structured_json"] if shortlisted else sanitize_resume(parsed["structured_json"])
        out["total_years"] = parsed["total_years"]
    if a["status"] == "shortlisted" and a["resume_path"]:
        out["resume_url"] = storage_repo.signed_url(a["resume_path"], 300)
    return out
