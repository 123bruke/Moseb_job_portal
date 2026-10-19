from app.repositories.redis_repo import queue
from app.workers import tasks


def enqueue():
    return queue("default").enqueue(tasks.cleanup_task)
