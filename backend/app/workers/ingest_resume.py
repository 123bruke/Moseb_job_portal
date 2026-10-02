from app.repositories.redis_repo import queue
from app.workers import tasks


def enqueue(application_id: str):
    return queue("ingest").enqueue(tasks.ingest_resume, application_id, job_timeout=600)
