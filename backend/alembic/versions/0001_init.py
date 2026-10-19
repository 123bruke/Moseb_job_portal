"""baseline schema (runs infra/supabase/migrations/0001_init.sql)"""
from pathlib import Path

from alembic import op

revision = "0001"
down_revision = None
SQL = Path(__file__).resolve().parents[3] / "infra" / "supabase" / "migrations" / "0001_init.sql"


def upgrade() -> None:
    op.execute(SQL.read_text())


def downgrade() -> None:
    raise NotImplementedError("baseline cannot be downgraded")
