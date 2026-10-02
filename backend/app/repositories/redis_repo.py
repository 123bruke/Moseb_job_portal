from functools import lru_cache

import redis
from rq import Queue

from app.core.config import get_settings


@lru_cache
def get_redis() -> redis.Redis:
    return redis.Redis.from_url(get_settings().redis_url, decode_responses=True)


@lru_cache
def _raw() -> redis.Redis:
    # RQ stores pickled payloads, so it needs a non-decoding connection.
    return redis.Redis.from_url(get_settings().redis_url)


def queue(name: str = "default") -> Queue:
    return Queue(name, connection=_raw(), default_timeout=900)
