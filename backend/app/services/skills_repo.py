"""Skill vocabulary in Postgres (aliases for normalisation). Falls back to the built-in seed."""
from app.repositories import pg
from app.services.skills import build_alias_index


def alias_index() -> dict[str, str]:
    try:
        rows = pg.all_("select name, aliases from skills")
    except Exception:
        return build_alias_index()
    return build_alias_index({r["name"]: list(r["aliases"] or []) for r in rows})


def skill_ids(names: list[str]) -> dict[str, int]:
    out: dict[str, int] = {}
    for n in names:
        row = pg.one("insert into skills (name) values (%s) on conflict (name) do update set name = excluded.name returning id", (n,))
        out[n] = row["id"]  # type: ignore[index]
    return out
