"""RQ task entrypoints. Queue names: ingest, rank, default."""
import logging

from app.services import cleanup, ingestion, ranking

log = logging.getLogger(__name__)


def ingest_resume(application_id: str) -> None:
    ingestion.ingest_resume(application_id)


def ingest_job(job_id: str) -> None:
    ingestion.ingest_job(job_id)


def rank_job(job_id: str) -> None:
    ranking.rank_job(job_id)


def cleanup_task() -> int:
    n = cleanup.run_cleanup()
    log.info("cleanup purged %s applications", n)
    return n
