"""Thin Postgres access (psycopg3 pool, dict rows). All SQL is parameterised."""
from contextlib import contextmanager
from typing import Any, Iterator, Sequence

from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from psycopg_pool import ConnectionPool

from app.core.config import get_settings

_pool: ConnectionPool | None = None


def pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        _pool = ConnectionPool(get_settings().database_url, min_size=1, max_size=10,
                               kwargs={"row_factory": dict_row}, open=True)
    return _pool


@contextmanager
def tx() -> Iterator[Any]:
    with pool().connection() as conn:
        with conn.transaction():
            yield conn


def one(sql: str, params: Sequence | None = None) -> dict | None:
    with pool().connection() as c:
        return c.execute(sql, params).fetchone()


def all_(sql: str, params: Sequence | None = None) -> list[dict]:
    with pool().connection() as c:
        return c.execute(sql, params).fetchall()


def run(sql: str, params: Sequence | None = None) -> int:
    with pool().connection() as c:
        return c.execute(sql, params).rowcount


def json(value: Any) -> Jsonb:
    return Jsonb(value)


def audit(actor: str | None, action: str, entity: str, entity_id: str | None, detail: dict | None = None) -> None:
    run("insert into audit_log (actor, action, entity, entity_id, detail) values (%s,%s,%s,%s,%s)",
        (actor, action, entity, entity_id, Jsonb(detail or {})))


def notify(profile_id: str, type_: str, payload: dict) -> None:
    run("insert into notifications (profile_id, type, payload) values (%s,%s,%s)",
        (profile_id, type_, Jsonb(payload)))
