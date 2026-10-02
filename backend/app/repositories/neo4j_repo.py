"""Neo4j: relationships and recommendations.

Nodes: Candidate, Skill, Job, Company, Domain, Education
Edges: HAS_SKILL{years,level}, REQUIRES{importance}, POSTED_BY, IN_DOMAIN,
       RELATED_TO{weight}, APPLIED_TO, VIEWED, SAVED
"""
from functools import lru_cache
from typing import Any

from neo4j import GraphDatabase

from app.core.config import get_settings


@lru_cache
def driver() -> Any:
    s = get_settings()
    return GraphDatabase.driver(s.neo4j_uri, auth=(s.neo4j_user, s.neo4j_password))


def run(cypher: str, **params: Any) -> list[dict]:
    with driver().session() as ses:
        return [r.data() for r in ses.run(cypher, **params)]


def upsert_candidate_skills(candidate_id: str, skills: list[dict]) -> None:
    """Profile skills: [{name, years, level}]. Replaces only the candidate's profile-sourced edges."""
    run("MERGE (c:Candidate {id:$id}) WITH c OPTIONAL MATCH (c)-[r:HAS_SKILL {source:'profile'}]->() DELETE r", id=candidate_id)
    run("""
        MERGE (c:Candidate {id:$id})
        WITH c UNWIND $skills AS s
        MERGE (k:Skill {name:s.name})
        MERGE (c)-[r:HAS_SKILL {source:'profile'}]->(k) SET r.years = coalesce(s.years,0), r.level = coalesce(s.level,'')
    """, id=candidate_id, skills=skills)


def upsert_resume_skills(candidate_id: str, application_id: str, skills: list[dict]) -> None:
    """Resume-parsed skills, tagged with the application so cleanup can remove exactly these edges."""
    run("""
        MERGE (c:Candidate {id:$id})
        WITH c UNWIND $skills AS s
        MERGE (k:Skill {name:s.name})
        MERGE (c)-[r:HAS_SKILL {source:'resume', application_id:$app}]->(k) SET r.years = coalesce(s.years,0)
    """, id=candidate_id, app=application_id, skills=skills)


def delete_resume_edges(application_id: str) -> None:
    run("MATCH (:Candidate)-[r:HAS_SKILL {source:'resume', application_id:$a}]->() DELETE r", a=application_id)


def upsert_job(job: dict, company: dict, must: list[str], nice: list[str]) -> None:
    run("""
        MERGE (j:Job {id:$jid}) SET j.title=$title, j.min_experience=$minx, j.status='open', j.posted_at=$posted
        MERGE (co:Company {id:$cid}) SET co.name=$cname
        MERGE (j)-[:POSTED_BY]->(co)
        WITH j
        OPTIONAL MATCH (j)-[old:REQUIRES]->() DELETE old
    """, jid=job["id"], title=job["title"], minx=float(job.get("min_experience") or 0),
        posted=job.get("published_at") or "", cid=company["id"], cname=company["name"])
    for names, imp in ((must, "must"), (nice, "nice")):
        run("""MATCH (j:Job {id:$jid}) UNWIND $names AS n MERGE (s:Skill {name:n})
               MERGE (j)-[r:REQUIRES]->(s) SET r.importance=$imp""", jid=job["id"], names=names, imp=imp)
    if job.get("domain"):
        run("MATCH (j:Job {id:$jid}) MERGE (d:Domain {name:$d}) MERGE (j)-[:IN_DOMAIN]->(d)",
            jid=job["id"], d=job["domain"])


def close_job(job_id: str) -> None:
    run("MATCH (j:Job {id:$id}) SET j.status='closed'", id=job_id)


def candidate_job_candidates(candidate_id: str, limit: int = 60) -> list[dict]:
    """Open jobs sharing at least one skill with the candidate, with overlap counts."""
    return run("""
        MATCH (c:Candidate {id:$cid})-[:HAS_SKILL]->(s:Skill)<-[r:REQUIRES]-(j:Job {status:'open'})
        WITH j, collect(DISTINCT s.name) AS matched, c
        MATCH (j)-[:REQUIRES]->(all:Skill)
        WITH j, matched, count(DISTINCT all) AS total
        RETURN j.id AS job_id, matched, total, size(matched) AS overlap
        ORDER BY overlap DESC LIMIT $limit
    """, cid=candidate_id, limit=limit)


def related_weights(skills_a: list[str], skills_b: list[str]) -> dict[str, float]:
    """For each skill in skills_a, best RELATED_TO weight to any skill in skills_b (0 if none)."""
    if not skills_a or not skills_b:
        return {}
    rows = run("""
        UNWIND $a AS name
        OPTIONAL MATCH (:Skill {name:name})-[r:RELATED_TO]-(o:Skill) WHERE o.name IN $b
        RETURN name, coalesce(max(r.weight),0.0) AS w
    """, a=skills_a, b=skills_b)
    return {r["name"]: float(r["w"]) for r in rows}


def record_event(candidate_id: str, job_id: str, kind: str) -> None:
    rel = {"view": "VIEWED", "save": "SAVED", "apply": "APPLIED_TO"}[kind]
    run(f"""MATCH (c:Candidate {{id:$c}}), (j:Job {{id:$j}})
            MERGE (c)-[r:{rel}]->(j) SET r.count = coalesce(r.count,0)+1, r.at = timestamp()""",
        c=candidate_id, j=job_id)


def reinforce_related(candidate_id: str, job_id: str, delta: float) -> None:
    """Learning loop: nudge RELATED_TO between the candidate's skills and the job's required skills."""
    run("""
        MATCH (:Candidate {id:$c})-[:HAS_SKILL]->(a:Skill), (:Job {id:$j})-[:REQUIRES]->(b:Skill)
        WHERE a <> b
        MERGE (a)-[r:RELATED_TO]-(b)
        SET r.weight = CASE WHEN coalesce(r.weight,0)+$d > 0.95 THEN 0.95 ELSE coalesce(r.weight,0)+$d END
    """, c=candidate_id, j=job_id, d=delta)


def delete_candidate_resume_edges(candidate_id: str, job_id: str) -> None:
    run("MATCH (c:Candidate {id:$c})-[r:APPLIED_TO]->(j:Job {id:$j}) DELETE r", c=candidate_id, j=job_id)


def delete_candidate(candidate_id: str) -> None:
    run("MATCH (c:Candidate {id:$c}) DETACH DELETE c", c=candidate_id)
