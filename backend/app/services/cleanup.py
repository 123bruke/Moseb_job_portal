"""'Send best fits, remove the rest': after RETENTION_DAYS, non-selected applicants lose resume file,
Chroma chunks, graph resume edges, parsed data and reasoning. A minimal record (id, status, timestamps) stays for audit."""
import logging

from app.core.config import get_settings
from app.repositories import chroma_repo, neo4j_repo, pg, storage_repo

log = logging.getLogger(__name__)


def purge_application(app_id: str, candidate_id: str, job_id: str, resume_path: str | None) -> None:
    if resume_path:
        try:
            storage_repo.delete([resume_path])
        except Exception:
            log.warning("storage delete failed; will retry next run")
            return
    chroma_repo.delete_where(chroma_repo.RESUMES, {"application_id": app_id})
    neo4j_repo.delete_resume_edges(app_id)
    neo4j_repo.delete_candidate_resume_edges(candidate_id, job_id)
    pg.run("delete from parsed_resumes where application_id=%s", (app_id,))
    pg.run("delete from reasoning_traces where application_id=%s", (app_id,))
    pg.run("delete from scores where application_id=%s", (app_id,))
    pg.run("update applications set resume_path=null, form_answers_json='{}'::jsonb where id=%s", (app_id,))
    pg.audit(None, "purge_application", "application", app_id)


def run_cleanup() -> int:
    days = get_settings().retention_days
    rows = pg.all_("""select id, candidate_id, job_id, resume_path from applications
                      where status='not_selected' and decided_at < now() - make_interval(days => %s)
                      and (resume_path is not null or exists (select 1 from parsed_resumes p where p.application_id = applications.id))""", (days,))
    for r in rows:
        purge_application(str(r["id"]), str(r["candidate_id"]), str(r["job_id"]), r["resume_path"])
    return len(rows)


def delete_account_data(profile_id: str) -> None:
    """'Delete my account and data' button."""
    for r in pg.all_("select id, job_id, resume_path from applications where candidate_id=%s", (profile_id,)):
        purge_application(str(r["id"]), profile_id, str(r["job_id"]), r["resume_path"])
    neo4j_repo.delete_candidate(profile_id)
    pg.audit(profile_id, "delete_account", "profile", profile_id)
    pg.run("delete from profiles where id=%s", (profile_id,))  # cascades; auth.users removed via Supabase admin API in the router
