"""Turn the legacy MODEL DATA JSONs (some are truncated/malformed) into role+skill chunks and skill co-occurrence.
Regex extraction on purpose: it works on valid AND broken JSON, so no dataset is silently skipped. Pure functions."""
import json
import math
import re
from collections import Counter
from itertools import combinations
from pathlib import Path

TITLE_KEYS = r"job_title|title|position|role|target_role|desired_position|current_position"
SKILL_KEYS = (r"skills|technical_skills|key_skills|core_skills|core_competencies|competencies|technologies|stack|frameworks|"
              r"cloud_platforms|programming|databases|tools|software|software_list|testing|monitoring|primary_languages|"
              r"secondary_languages|quantitative_skills|teaching_skills|transferable_skills|qualitative_skills")
_STR = r'"((?:[^"\\]|\\.)*)"'
_TITLE = re.compile(rf'"(?:{TITLE_KEYS})"\s*:\s*{_STR}', re.I)
_SKILLS = re.compile(rf'"(?:{SKILL_KEYS})"\s*:\s*(\[[^\[\]]*\]|{_STR})', re.I)
SKIP_FILES = ("detection", "ai_human", "ai_vs_human")


def _unescape(s: str) -> str:
    try:
        return json.loads(f'"{s}"')
    except Exception:
        return s


def _skill_list(raw: str) -> list[str]:
    raw = raw.strip()
    if raw.startswith("["):
        names = re.findall(rf'"name"\s*:\s*{_STR}', raw)   # arrays of {name, years, proficiency} objects
        parts = names or ([] if "{" in raw else re.findall(_STR, raw))
        if not parts:
            return []
        items = [_unescape(p) for p in parts]
    else:
        items = [_unescape(raw.strip('"'))]
    out: list[str] = []
    for it in items:
        out += [x.strip(" .;") for x in re.split(r"[,;|]", it)]
    return [x for x in out if 2 <= len(x) <= 40 and len(x.split()) <= 4 and not re.search(r"[{}:]", x)]


def extract_records(text: str) -> list[dict]:
    """[{role, skills[]}] in document order; the role is the most recent title before the skills."""
    events = sorted([(m.start(), "t", _unescape(m.group(1))) for m in _TITLE.finditer(text)] +
                    [(m.start(), "s", _skill_list(m.group(1))) for m in _SKILLS.finditer(text)], key=lambda e: e[0])
    role, recs = "", []
    for _, kind, val in events:
        if kind == "t":
            role = val[:80]
        elif val:
            recs.append({"role": role, "skills": val})
    return recs


def load_dir(root: Path) -> list[dict]:
    """[{domain, source, role, skills}] for every dataset under root/<domain>/*.json."""
    out = []
    for f in sorted(root.glob("*/*.json")):
        if any(k in f.name.lower() for k in SKIP_FILES):
            continue
        for r in extract_records(f.read_text(errors="ignore")):
            out.append({"domain": f.parent.name, "source": f.name, **r})
    return out


def build_chunks(records: list[dict], cap_per_domain: int = 400) -> list[dict]:
    seen, per = set(), Counter()
    chunks = []
    for r in records:
        key = (r["domain"], r["role"].lower(), tuple(sorted(s.lower() for s in r["skills"])))
        if key in seen or per[r["domain"]] >= cap_per_domain:
            continue
        seen.add(key)
        per[r["domain"]] += 1
        chunks.append({"domain": r["domain"], "role": r["role"],
                       "text": (f"Role: {r['role']}. " if r["role"] else "") + "Skills: " + ", ".join(r["skills"][:25])})
    return chunks


def skill_vocabulary(records: list[dict], min_count: int = 2) -> dict[str, str]:
    """skill -> domain, for skills that appear at least `min_count` times."""
    c: Counter = Counter()
    dom: dict[str, str] = {}
    for r in records:
        for s in r["skills"]:
            c[s] += 1
            dom.setdefault(s, r["domain"])
    return {s: dom[s] for s, n in c.items() if n >= min_count}


def related_pairs(records: list[dict], vocab: set[str], max_pairs: int = 3000) -> list[tuple[str, str, float]]:
    """Skills that co-occur in the same record are RELATED_TO. weight = 0.3 + 0.1*min(count,5) (0.35 .. 0.8)."""
    c: Counter = Counter()
    for r in records:
        sk = sorted({s for s in r["skills"] if s in vocab})[:30]
        for a, b in combinations(sk, 2):
            c[(a, b)] += 1
    return [(a, b, round(min(0.8, 0.3 + 0.1 * math.log2(1 + n) * 2 / 2 if n < 2 else 0.3 + 0.1 * min(n, 5)), 2))
            for (a, b), n in c.most_common(max_pairs) if n >= 2]
