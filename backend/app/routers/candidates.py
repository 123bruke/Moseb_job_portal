from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, rate_limit, require_role
from app.repositories import neo4j_repo, pg
from app.schemas.models import CandidateProfileIn, EventIn
from app.services import feed, skills as sk
from app.services.skills_repo import alias_index

router = APIRouter(prefix="/candidates", tags=["candidates"])
cand = require_role("candidate")


@router.get("/profile")
def get_profile(user: CurrentUser = Depends(cand)):
    return pg.one("select * from candidate_profiles where profile_id=%s", (user.id,))


@router.put("/profile")
def put_profile(body: CandidateProfileIn, user: CurrentUser = Depends(cand)):
    skills = sk.normalize_skills(body.skills, alias_index())
    pg.run("""insert into candidate_profiles (profile_id, headline, years_experience, domain, education_level, languages, expected_salary, skills)
              values (%s,%s,%s,%s,%s,%s,%s,%s)
              on conflict (profile_id) do update set headline=excluded.headline, years_experience=excluded.years_experience,
              domain=excluded.domain, education_level=excluded.education_level, languages=excluded.languages,
              expected_salary=excluded.expected_salary, skills=excluded.skills, updated_at=now()""",
           (user.id, body.headline, body.years_experience, body.domain, body.education_level, body.languages, body.expected_salary, skills))
    neo4j_repo.upsert_candidate_skills(user.id, [{"name": s, "years": body.years_experience, "level": ""} for s in skills])
    return get_profile(user)


@router.get("/feed", dependencies=[Depends(rate_limit("feed", 30))])
def get_feed(user: CurrentUser = Depends(cand)):
    return feed.rank_feed(user.id)


@router.post("/events")
def event(body: EventIn, user: CurrentUser = Depends(cand)):
    feed.record_event(user.id, body.job_id, body.type)
    return {"ok": True}


@router.get("/applications")
def my_applications(user: CurrentUser = Depends(cand)):
    return pg.all_("""select a.id, a.status, a.created_at, a.decided_at, j.id as job_id, j.title, c.name as company_name
                      from applications a join jobs j on j.id=a.job_id join companies c on c.id=j.company_id
                      where a.candidate_id=%s order by a.created_at desc""", (user.id,))
