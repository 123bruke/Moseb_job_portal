from fastapi import APIRouter, Depends, File, UploadFile

from app.core.deps import CurrentUser, optional_user, owned_job, rate_limit, require_role
from app.core.errors import AppError, bad_request, not_found
from app.repositories import pg, storage_repo
from app.schemas.models import JobIn, Rubric
from app.services import ingestion, rubric as rubric_svc
from app.services.skills import normalize_skills
from app.workers import ingest_job, rank_job

router = APIRouter(prefix="/jobs", tags=["jobs"])
comp = require_role("company")

PUBLIC_COLS = """j.id, j.title, j.description, j.domain, j.min_experience, j.education_required, j.location, j.seats,
                 j.deadline, j.status, j.published_at, c.name as company_name, c.logo_url, c.brand_color, c.website"""


@router.get("")
def list_open(q: str | None = None, domain: str | None = None, limit: int = 50):
    """Public browse: open jobs whose deadline has not passed."""
    return pg.all_(f"""select {PUBLIC_COLS} from jobs j join companies c on c.id=j.company_id
                       where j.status='open' and (j.deadline is null or j.deadline > now())
                       and (%s::text is null or j.title ilike '%%'||%s||'%%') and (%s::text is null or j.domain=%s)
                       order by j.published_at desc limit %s""", (q, q, domain, domain, min(limit, 100)))


@router.get("/mine")
def mine(user: CurrentUser = Depends(comp)):
    return pg.all_("""select j.id, j.title, j.status, j.rubric_status, j.deadline, j.seats, j.created_at,
                      (select count(*) from applications a where a.job_id=j.id) as applicants
                      from jobs j join companies c on c.id=j.company_id where c.owner_profile_id=%s order by j.created_at desc""", (user.id,))


@router.post("", status_code=201)
def create(body: JobIn, user: CurrentUser = Depends(comp)):
    company = pg.one("select id from companies where owner_profile_id=%s", (user.id,))
    if not company:
        raise bad_request("Create your company profile first", "no_company")
    row = pg.one("""insert into jobs (company_id, title, description, domain, min_experience, education_required, location, seats, deadline, requirement_text)
                    values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) returning *""",
                 (company["id"], body.title, body.description, body.domain, body.min_experience, body.education_required,
                  body.location, body.seats, body.deadline, "Required skills: " + ", ".join(normalize_skills(body.required_skills)) if body.required_skills else ""))
    ingest_job.enqueue(str(row["id"]))
    pg.audit(user.id, "create_job", "job", str(row["id"]))
    return row


@router.get("/{job_id}")
def detail(job_id: str, user: CurrentUser | None = Depends(optional_user)):
    row = pg.one(f"""select {PUBLIC_COLS}, j.rubric_json, c.owner_profile_id from jobs j join companies c on c.id=j.company_id where j.id=%s""", (job_id,))
    if not row:
        raise not_found("job")
    owner = user is not None and (str(row["owner_profile_id"]) == user.id or user.role == "admin")
    if row["status"] != "open" and not owner:
        raise not_found("job")
    row.pop("owner_profile_id")
    if not owner and row["rubric_json"]:  # public view: skills only, never weights/filters
        r = row["rubric_json"]
        row["rubric_json"] = {"must_have": r["must_have"], "nice_to_have": r["nice_to_have"], "min_years": r["min_years"]}
    return row


@router.post("/{job_id}/requirements-file", dependencies=[Depends(rate_limit("reqfile", 10))])
def upload_requirements(job_id: str, file: UploadFile = File(...), user: CurrentUser = Depends(comp)):
    from app.utils.uploads import validate_upload
    job = owned_job(job_id, user)
    data = file.file.read(10 * 1024 * 1024 + 1)
    kind, name = validate_upload(data, file.filename or "requirements")
    path = f"requirements/{job_id}/{name}"
    storage_repo.upload(path, data, "application/octet-stream")
    text = ingestion.extract_requirement_text(data)
    pg.run("update jobs set requirement_file_path=%s, requirement_text=coalesce(requirement_text,'') || E'\\n' || %s where id=%s",
           (path, text, job["id"]))
    ingest_job.enqueue(job_id)
    return {"status": "rubric_pending"}


@router.get("/{job_id}/rubric")
def get_rubric(job_id: str, user: CurrentUser = Depends(comp)):
    j = owned_job(job_id, user)
    return {"status": j["rubric_status"], "rubric": j["rubric_json"]}


@router.patch("/{job_id}/rubric")
def patch_rubric(job_id: str, body: Rubric, user: CurrentUser = Depends(comp)):
    j = owned_job(job_id, user)
    if j["status"] == "ranked":
        raise AppError(409, "locked", "Job is already ranked")
    data = body.model_dump()
    data["domain"] = data["domain"] or j.get("domain") or ""
    pg.run("update jobs set rubric_json=%s, rubric_status='ready' where id=%s", (pg.json(data), job_id))
    pg.audit(user.id, "edit_rubric", "job", job_id)
    return {"status": "ready", "rubric": data}


@router.post("/{job_id}/rubric/regenerate")
def regenerate(job_id: str, user: CurrentUser = Depends(comp)):
    owned_job(job_id, user)
    ingest_job.enqueue(job_id)
    return {"status": "pending"}


@router.post("/{job_id}/publish")
def publish(job_id: str, user: CurrentUser = Depends(comp)):
    j = owned_job(job_id, user)
    if j["status"] not in ("draft",):
        raise AppError(409, "bad_state", f"Cannot publish a job in state {j['status']}")
    problems = rubric_svc.validate_for_publish(j["rubric_json"])
    if problems:
        raise bad_request("; ".join(problems), "rubric_invalid")
    pg.run("update jobs set status='open', published_at=now() where id=%s", (job_id,))
    ingestion.publish_job(job_id)
    pg.audit(user.id, "publish_job", "job", job_id)
    return {"status": "open"}


@router.post("/{job_id}/close-and-rank")
def close_and_rank(job_id: str, user: CurrentUser = Depends(comp)):
    j = owned_job(job_id, user)
    if j["status"] not in ("open", "closed"):
        raise AppError(409, "bad_state", f"Cannot rank a job in state {j['status']}")
    pending = pg.one("select count(*) n from applications where job_id=%s and status in ('submitted','processing')", (job_id,))["n"]
    pg.run("update jobs set status='closed' where id=%s", (job_id,))
    rank_job.enqueue(job_id)
    pg.audit(user.id, "close_and_rank", "job", job_id)
    return {"status": "ranking", "still_processing": pending}


@router.get("/{job_id}/applicants")
def applicants(job_id: str, user: CurrentUser = Depends(comp)):
    owned_job(job_id, user)
    rows = pg.all_("""select a.id, a.status, a.created_at, p.total_years, s.total, s.rank, s.eligible, s.ineligible_reasons,
                      row_number() over (order by a.created_at) as label_no
                      from applications a left join parsed_resumes p on p.application_id=a.id left join scores s on s.application_id=a.id
                      where a.job_id=%s order by s.rank nulls last, a.created_at""", (job_id,))
    for r in rows:  # anonymous labels until shortlisted
        r["label"] = f"Candidate {r.pop('label_no')}"
    return rows
