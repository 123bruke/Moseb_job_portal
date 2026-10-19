from app.repositories.redis_repo import queue
from app.workers import tasks


def enqueue(job_id: str):
    return queue("rank").enqueue(tasks.rank_job, job_id, job_timeout=1800)
