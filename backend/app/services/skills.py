"""Skill alias normalisation (JS = JavaScript) and total-years computation. Pure functions."""
import re
from datetime import date

from app.utils.skills_seed import SEED


def _key(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def build_alias_index(extra: dict[str, list[str]] | None = None) -> dict[str, str]:
    """alias (lowercase) -> canonical name. `extra` = canonical -> aliases loaded from the DB."""
    idx: dict[str, str] = {}
    for canon, (_, aliases) in SEED.items():
        idx[_key(canon)] = canon
        for a in aliases:
            idx[_key(a)] = canon
    for canon, aliases in (extra or {}).items():
        idx[_key(canon)] = canon
        for a in aliases:
            idx[_key(a)] = canon
    return idx


_DEFAULT = build_alias_index()


def normalize_skill(name: str, index: dict[str, str] | None = None) -> str:
    idx = index or _DEFAULT
    k = _key(name)
    return idx.get(k, name.strip())


def normalize_skills(names: list[str], index: dict[str, str] | None = None) -> list[str]:
    seen: dict[str, None] = {}
    for n in names:
        if n and n.strip():
            seen[normalize_skill(n, index)] = None
    return list(seen)


def find_skills_in_text(text: str, index: dict[str, str] | None = None) -> list[str]:
    """Word-boundary scan of free text for known skills/aliases (used by the no-LLM fallback)."""
    idx = index or _DEFAULT
    low = text.lower()
    found: dict[str, None] = {}
    for alias, canon in idx.items():
        if len(alias) < 2:
            continue
        if re.search(rf"(?<![\w+#.]){re.escape(alias)}(?![\w+#])", low):
            found[canon] = None
    return list(found)


def _parse_month(s: str | None, default_end: bool) -> date | None:
    """Accepts 'YYYY', 'YYYY-MM', 'present'/'current'/None (= today when default_end)."""
    if s is None or _key(str(s)) in ("", "present", "current", "now", "ongoing"):
        return date.today() if default_end else None
    m = re.match(r"^(\d{4})(?:-(\d{1,2}))?", str(s).strip())
    if not m:
        return None
    y, mo = int(m.group(1)), int(m.group(2) or (12 if default_end else 1))
    return date(y, min(max(mo, 1), 12), 1)


def total_years(experience: list[dict]) -> float:
    """Union of [start, end] ranges, so overlapping jobs are not double counted. Returns years (1 dp)."""
    spans: list[tuple[date, date]] = []
    for e in experience:
        start = _parse_month(e.get("start"), default_end=False)
        end = _parse_month(e.get("end"), default_end=True)
        if start and end and end >= start:
            spans.append((start, end))
    if not spans:
        return 0.0
    spans.sort()
    merged = [spans[0]]
    for s, e in spans[1:]:
        ls, le = merged[-1]
        if s <= le:
            merged[-1] = (ls, max(le, e))
        else:
            merged.append((s, e))
    months = sum((e.year - s.year) * 12 + (e.month - s.month) for s, e in merged)
    return round(months / 12, 1)
