"""Candidate job feed: Neo4j candidates -> Chroma semantic boost -> rank 0.5 skills + 0.3 semantic + 0.2 experience."""
from datetime import datetime, timezone

from app.repositories import chroma_repo, neo4j_repo, pg


def experience_fit(years: float, needed: float) -> float:
    return 1.0 if needed <= 0 else min(1.0, years / needed)


def explain(matched: int, total: int, years: float, needed: float) -> str:
    s = f"Matches {matched} of {total} skills"
    if needed > years:
        gap = needed - years
        s += f"; you are {gap:g} year{'s' if gap != 1 else ''} short on experience"
    return s


def rank_feed(candidate_id: str, limit: int = 30) -> list[dict]:
    prof = pg.one("select * from candidate_profiles where profile_id=%s", (candidate_id,))
    if not prof or not prof["skills"]:
        return []
    years = float(prof["years_experience"])
    cands = neo4j_repo.candidate_job_candidates(candidate_id)
    if not cands:
        return []
    query = f"{prof['headline'] or ''} {prof['domain'] or ''} skills: {', '.join(prof['skills'])}"
    sem = {}
    for hit in chroma_repo.query(chroma_repo.JOBS, query, None, 60):
        j = hit["metadata"]["job_id"]
        sem[j] = max(sem.get(j, 0.0), hit["similarity"])
    jobs = {str(r["id"]): r for r in pg.all_(
        """select j.id, j.title, j.min_experience, j.location, j.deadline, j.published_at, c.name as company_name,
                  c.logo_url, c.brand_color from jobs j join companies c on c.id=j.company_id
           where j.id = any(%s::uuid[]) and j.status='open' and (j.deadline is null or j.deadline > now())""",
        ([c["job_id"] for c in cands],))}
    now = datetime.now(timezone.utc)
    out = []
    for c in cands:
        j = jobs.get(c["job_id"])
        if not j:
            continue
        overlap = c["overlap"] / max(1, c["total"])
        s = sem.get(c["job_id"], 0.0)
        exp = experience_fit(years, float(j["min_experience"]))
        recency = 1.0 / (1.0 + (now - j["published_at"]).days) if j["published_at"] else 0.0
        out.append({**{k: (str(v) if k == "id" else v) for k, v in j.items()},
                    "match_score": round(100 * (0.5 * overlap + 0.3 * s + 0.2 * exp), 1),
                    "matched_skills": c["matched"], "explanation": explain(c["overlap"], c["total"], years, float(j["min_experience"])),
                    "_tiebreak": recency})
    out.sort(key=lambda x: (-x["match_score"], -x["_tiebreak"]))
    for o in out:
        o.pop("_tiebreak")
    return out[:limit]


def record_event(candidate_id: str, job_id: str, kind: str) -> None:
    neo4j_repo.record_event(candidate_id, job_id, kind)
    neo4j_repo.reinforce_related(candidate_id, job_id, {"apply": 0.03, "save": 0.015, "view": 0.003}[kind])
