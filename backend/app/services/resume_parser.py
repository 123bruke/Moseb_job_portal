"""Section parser. Gemini structured output when available, heuristic fallback otherwise.
Output is normalised (skill aliases) and total years is computed from dates, not trusted from the text."""
import re
from typing import Any

from app.services import skills as sk

HEADINGS = {
    "summary": r"summary|profile|objective|about",
    "skills": r"skills|technologies|technical skills|competencies",
    "experience": r"experience|employment|work history",
    "education": r"education|academic",
    "certificates": r"certificat\w*|licen[sc]es|awards",
    "projects": r"projects?",
    "languages": r"languages?",
}
_DATE_RANGE = re.compile(r"((?:19|20)\d{2})(?:[-/](\d{1,2}))?\s*(?:-|–|—|to)\s*((?:19|20)\d{2}(?:[-/]\d{1,2})?|present|current|now)", re.I)
_LEVELS = [("phd", r"ph\.?d|doctorate"), ("master", r"master|m\.?sc|mba"), ("bachelor", r"bachelor|b\.?sc|b\.?a\b|b\.?eng"),
           ("diploma", r"diploma|associate"), ("high_school", r"high school|secondary")]


def split_sections(text: str) -> dict[str, str]:
    out: dict[str, list[str]] = {"header": []}
    cur = "header"
    for line in text.splitlines():
        stripped = line.strip().strip(":").strip()
        hit = next((k for k, pat in HEADINGS.items() if re.fullmatch(pat, stripped, re.I)), None)
        if hit and len(stripped) < 30:
            cur = hit
            out.setdefault(cur, [])
        else:
            out.setdefault(cur, []).append(line)
    return {k: "\n".join(v).strip() for k, v in out.items() if "\n".join(v).strip()}


def heuristic_parse(text: str) -> dict[str, Any]:
    secs = split_sections(text)
    header = secs.get("header", "").splitlines()
    email = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    exp = []
    for m in _DATE_RANGE.finditer(secs.get("experience", "")):
        exp.append({"title": "", "company": "", "start": f"{m.group(1)}-{m.group(2) or '01'}",
                    "end": m.group(3).replace("/", "-"), "summary": ""})
    edu = []
    for line in secs.get("education", "").splitlines():
        lvl = next((k for k, pat in _LEVELS if re.search(pat, line, re.I)), None)
        if lvl:
            edu.append({"institution": "", "degree": line.strip(), "level": lvl})
    skills = sk.find_skills_in_text(secs.get("skills", "") or text)
    return {
        "personal": {"name": header[0].strip() if header else "", "email": email.group(0) if email else ""},
        "headline": "", "summary": secs.get("summary", "")[:600], "skills": skills, "experience": exp,
        "education": edu, "certificates": [l.strip("-• ").strip() for l in secs.get("certificates", "").splitlines() if l.strip()],
        "languages": [], "projects": [], "domain": "other", "parse_confidence": 0.4 if exp or skills else 0.15,
        "_sections": secs,
    }


def parse_resume(text: str, use_llm: bool | None = None) -> dict[str, Any]:
    from app.ml import llm
    if use_llm is None:
        use_llm = llm.enabled()
    parsed: dict[str, Any]
    if use_llm:
        from app.prompts import render
        try:
            parsed = llm.generate_json(render("parse_resume", text=text[:30000]))
            if not isinstance(parsed, dict):
                raise ValueError("not an object")
        except Exception:
            parsed = heuristic_parse(text)
    else:
        parsed = heuristic_parse(text)
    return normalize_parsed(parsed)


def normalize_parsed(p: dict[str, Any]) -> dict[str, Any]:
    p = dict(p)
    p["skills"] = sk.normalize_skills([s if isinstance(s, str) else str(s.get("name", "")) for s in p.get("skills") or []])
    for key in ("experience", "education", "projects"):
        p[key] = [e for e in p.get(key) or [] if isinstance(e, dict)]
    p["certificates"] = [c if isinstance(c, str) else c.get("name", "") for c in p.get("certificates") or []]
    p["total_years"] = sk.total_years(p["experience"])
    try:
        p["parse_confidence"] = max(0.0, min(1.0, float(p.get("parse_confidence", 0.5))))
    except (TypeError, ValueError):
        p["parse_confidence"] = 0.5
    return p


def chunk_resume(sanitized: dict[str, Any]) -> list[dict[str, str]]:
    """Chunk by section. Input must already be sanitised, so identity never reaches the vector store."""
    chunks: list[dict[str, str]] = []
    if sanitized.get("summary"):
        chunks.append({"section": "summary", "text": str(sanitized["summary"])})
    if sanitized.get("skills"):
        chunks.append({"section": "skills", "text": "Skills: " + ", ".join(sanitized["skills"])})
    for e in sanitized.get("experience", []):
        t = f"{e.get('title','')} at {e.get('company','')} ({e.get('start','?')} - {e.get('end','?')}). {e.get('summary','')}"
        chunks.append({"section": "experience", "text": t.strip()})
    for e in sanitized.get("education", []):
        chunks.append({"section": "education", "text": f"{e.get('degree','')} {e.get('field','') or ''}, {e.get('institution','')} [{e.get('level','')}]".strip()})
    for pr in sanitized.get("projects", []):
        chunks.append({"section": "projects", "text": f"{pr.get('name','')}: {pr.get('description','')} {', '.join(pr.get('skills') or [])}".strip()})
    if sanitized.get("certificates"):
        chunks.append({"section": "certificates", "text": "Certificates: " + "; ".join(sanitized["certificates"])})
    return [c for c in chunks if len(c["text"].strip()) > 3]
