"""Ingestion pipelines (run inside the RQ worker).

Resume: validate (done at upload) -> read (PyMuPDF/OCR/YOLO order) -> section parse (Gemini) -> normalise ->
        Postgres -> chunk+embed (Chroma) -> graph upsert (Neo4j) -> processed
Job:    read requirement file -> Gemini rubric -> company reviews/edits -> publish -> Chroma + Neo4j
"""
import logging

from app.agents.rubric_agent import generate_rubric
from app.ml.pdf_reader.reader import read_document
from app.repositories import chroma_repo, neo4j_repo, pg, storage_repo
from app.services import bias, resume_parser, skills as sk
from app.services.skills_repo import alias_index, skill_ids

log = logging.getLogger(__name__)


def ingest_resume(application_id: str) -> None:
    app = pg.one("select * from applications where id = %s", (application_id,))
    if not app or not app["resume_path"]:
        return
    pg.run("update applications set status='processing', error=null where id=%s", (application_id,))
    try:
        text = read_document(storage_repo.download(app["resume_path"])).text
        if len(text.strip()) < 30:
            raise ValueError("No readable text found in the resume")
        parsed = resume_parser.parse_resume(text)
        idx = alias_index()
        parsed["skills"] = sk.normalize_skills(parsed["skills"], idx)

        pg.run("""insert into parsed_resumes (application_id, structured_json, total_years, parse_confidence)
                  values (%s,%s,%s,%s)
                  on conflict (application_id) do update set structured_json=excluded.structured_json,
                  total_years=excluded.total_years, parse_confidence=excluded.parse_confidence""",
               (application_id, pg.json(parsed), parsed["total_years"], parsed["parse_confidence"]))

        clean = bias.sanitize_resume(parsed)          # identity never reaches the vector store
        chunks = resume_parser.chunk_resume(clean)
        chroma_repo.delete_where(chroma_repo.RESUMES, {"application_id": application_id})
        chroma_repo.add_chunks(
            chroma_repo.RESUMES,
            [f"{application_id}:{i}" for i in range(len(chunks))],
            [c["text"] for c in chunks],
            [{"application_id": application_id, "job_id": str(app["job_id"]), "section": c["section"],
              "candidate_id": str(app["candidate_id"])} for c in chunks])

        neo4j_repo.upsert_resume_skills(str(app["candidate_id"]), application_id, [
            {"name": s, "years": sk.total_years([e for e in parsed["experience"]
                                                 if s.lower() in f"{e.get('title','')} {e.get('summary','')}".lower()])}
            for s in parsed["skills"]])
        pg.run("update applications set status='processed' where id=%s", (application_id,))
    except Exception as e:
        log.exception("resume ingestion failed")
        pg.run("update applications set status='failed', error=%s where id=%s", (str(e)[:300], application_id))
        raise


def ingest_job(job_id: str) -> None:
    """Build (or rebuild) the rubric for human review. Nothing is published here."""
    job = pg.one("select * from jobs where id=%s", (job_id,))
    if not job:
        return
    pg.run("update jobs set rubric_status='pending' where id=%s", (job_id,))
    try:
        rubric = generate_rubric(job, job.get("requirement_text") or "")
        pg.run("update jobs set rubric_json=%s, rubric_status='ready' where id=%s", (pg.json(rubric), job_id))
    except Exception:
        pg.run("update jobs set rubric_status='failed' where id=%s", (job_id,))
        raise


def extract_requirement_text(data: bytes) -> str:
    return read_document(data).text[:60000]


def publish_job(job_id: str) -> None:
    """After the company approved the rubric: job_skills, Chroma (jobs), Neo4j (Job)-[:REQUIRES]->(Skill)."""
    job = pg.one("select j.*, c.name as company_name from jobs j join companies c on c.id=j.company_id where j.id=%s", (job_id,))
    assert job and job["rubric_json"]
    rubric = job["rubric_json"]
    must = [m["skill"] for m in rubric["must_have"]]
    nice = list(rubric["nice_to_have"])
    ids = skill_ids(must + nice)
    pg.run("delete from job_skills where job_id=%s", (job_id,))
    for m in rubric["must_have"]:
        pg.run("insert into job_skills (job_id, skill_id, importance, min_years) values (%s,%s,'must',%s)",
               (job_id, ids[m["skill"]], m.get("min_years")))
    for n in nice:
        pg.run("insert into job_skills (job_id, skill_id, importance) values (%s,%s,'nice') on conflict do nothing", (job_id, ids[n]))

    reqs = [f"Must have: {m}" for m in must] + [f"Nice to have: {n}" for n in nice] + \
           [f"Requirement: {o}" for o in rubric.get("other_requirements", [])] + [f"Job: {job['title']}. {job['description'][:1500]}"]
    chroma_repo.delete_where(chroma_repo.JOBS, {"job_id": job_id})
    chroma_repo.add_chunks(chroma_repo.JOBS, [f"{job_id}:{i}" for i in range(len(reqs))], reqs,
                           [{"job_id": job_id, "company_id": str(job["company_id"])} for _ in reqs])
    neo4j_repo.upsert_job({"id": job_id, "title": job["title"], "min_experience": job["min_experience"],
                           "domain": job["domain"], "published_at": str(job["published_at"] or "")},
                          {"id": str(job["company_id"]), "name": job["company_name"]}, must, nice)
