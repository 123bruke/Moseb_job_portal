from app.repositories.redis_repo import queue
from app.workers import tasks


def enqueue(job_id: str):
    return queue("ingest").enqueue(tasks.ingest_job, job_id, job_timeout=300)
