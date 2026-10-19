"""Alembic runs plain SQL migrations from infra/supabase/migrations (the same files the Supabase CLI uses)."""
from alembic import context
from sqlalchemy import create_engine, text

from app.core.config import get_settings

config = context.config


def run() -> None:
    engine = create_engine(get_settings().database_url.replace("postgresql://", "postgresql+psycopg://"))
    with engine.begin() as conn:
        context.configure(connection=conn, target_metadata=None)
        with context.begin_transaction():
            context.run_migrations()


run()
