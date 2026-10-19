"""Hybrid scoring engine (not an LLM guess).

Signals (default weights, editable per job in the rubric):
  skills 35  | semantic 25 | experience 20 | education 10 | graph 10

Hard filters run first: failing candidates are marked not-eligible WITH reasons (never silently dropped).
All functions are pure; the caller supplies semantic/graph signals from Chroma/Neo4j.
"""
from typing import Any

DEFAULT_WEIGHTS = {"skills": 35, "semantic": 25, "experience": 20, "education": 10, "graph": 10}
EDU_RANK = {"none": 0, "high_school": 1, "diploma": 2, "bachelor": 3, "master": 4, "phd": 5}
_EDU_ALIASES = {
    "highschool": "high_school", "high school": "high_school", "secondary": "high_school",
    "associate": "diploma", "college": "diploma", "bsc": "bachelor", "b.sc": "bachelor", "ba": "bachelor",
    "bachelors": "bachelor", "bachelor's": "bachelor", "degree": "bachelor", "msc": "master", "m.sc": "master",
    "masters": "master", "master's": "master", "mba": "master", "doctorate": "phd", "ph.d": "phd",
}


def edu_rank(level: str | None) -> int:
    if not level:
        return 0
    k = level.strip().lower()
    k = _EDU_ALIASES.get(k, k).replace("-", "_").replace(" ", "_")
    return EDU_RANK.get(k, 0)


def normalize_weights(w: dict[str, float] | None) -> dict[str, float]:
    merged = {**DEFAULT_WEIGHTS, **{k: float(v) for k, v in (w or {}).items() if k in DEFAULT_WEIGHTS}}
    total = sum(merged.values()) or 1.0
    return {k: v / total for k, v in merged.items()}


def skill_coverage(must: list[str], nice: list[str], candidate_skills: list[str]) -> dict[str, Any]:
    have = {s.lower() for s in candidate_skills}
    must_hit = [s for s in must if s.lower() in have]
    must_miss = [s for s in must if s.lower() not in have]
    nice_hit = [s for s in nice if s.lower() in have]
    must_cov = len(must_hit) / len(must) if must else 1.0
    nice_cov = len(nice_hit) / len(nice) if nice else None
    value = must_cov if nice_cov is None else 0.8 * must_cov + 0.2 * nice_cov
    return {"value": value, "must_hit": must_hit, "must_missing": must_miss, "nice_hit": nice_hit,
            "must_coverage": must_cov}


def experience_fit(total_years: float, min_years: float, domain_match: bool = True) -> float:
    base = 1.0 if min_years <= 0 else min(1.0, total_years / min_years)
    return base * (1.0 if domain_match else 0.8)


def education_fit(cand_level: str | None, required_level: str | None,
                  cand_certs: list[str], required_certs: list[str]) -> float:
    req = edu_rank(required_level)
    edu = 1.0 if req == 0 else min(1.0, edu_rank(cand_level) / req)
    if not required_certs:
        return edu
    have = {c.lower() for c in cand_certs}
    certs = sum(1 for c in required_certs if c.lower() in have) / len(required_certs)
    return 0.8 * edu + 0.2 * certs


def semantic_fit(similarities: list[float]) -> float:
    """Mean of best-chunk cosine similarity per requirement, stretched so 0.5..0.9 maps to 0..1."""
    if not similarities:
        return 0.0
    mean = sum(similarities) / len(similarities)
    return max(0.0, min(1.0, (mean - 0.5) / 0.4))


def graph_proximity(required: list[str], candidate_skills: list[str], related: dict[str, float]) -> float:
    """Matched skills count 1.0; a missing skill gets its best RELATED_TO weight to the candidate's skills."""
    if not required:
        return 1.0
    have = {s.lower() for s in candidate_skills}
    return sum(1.0 if s.lower() in have else min(1.0, related.get(s, 0.0)) for s in required) / len(required)


def hard_filters(rubric: dict, resume: dict, total_years: float, coverage: dict, application: dict | None = None) -> list[str]:
    """Reasons the candidate is NOT eligible. Empty list = eligible."""
    hf = rubric.get("hard_filters") or {}
    reasons: list[str] = []
    allowed_missing = int(hf.get("max_missing_must_have", 0))
    if len(coverage["must_missing"]) > allowed_missing:
        reasons.append("Missing must-have skill(s): " + ", ".join(coverage["must_missing"]))
    if hf.get("enforce_min_years", True) and total_years + 1e-9 < float(rubric.get("min_years") or 0):
        reasons.append(f"Below minimum experience ({total_years:g} < {rubric['min_years']:g} years)")
    loc = hf.get("location")
    if loc and application is not None:
        answers = application.get("form_answers_json") or {}
        cand_loc = str(answers.get("location") or "").lower()
        if answers.get("willing_to_relocate") is not True and loc.lower() not in cand_loc:
            reasons.append(f"Location mismatch (job requires {loc})")
    if hf.get("work_authorization_required") and application is not None:
        if (application.get("form_answers_json") or {}).get("work_authorization") is not True:
            reasons.append("No work authorization confirmed")
    return reasons


def compute_score(rubric: dict, resume: dict, total_years: float, semantic_sims: list[float],
                  related: dict[str, float], application: dict | None = None) -> dict[str, Any]:
    """resume is the SANITISED structured resume: skills[], education[], certificates[], domain."""
    must = [m["skill"] if isinstance(m, dict) else m for m in rubric.get("must_have", [])]
    nice = list(rubric.get("nice_to_have", []))
    skills = list(resume.get("skills", []))
    w = normalize_weights(rubric.get("weights"))

    cov = skill_coverage(must, nice, skills)
    edu_levels = [e.get("level") for e in resume.get("education", []) if isinstance(e, dict)]
    best_edu = max(edu_levels, key=edu_rank, default=None)
    certs = [c if isinstance(c, str) else c.get("name", "") for c in resume.get("certificates", [])]
    rdom = (rubric.get("domain") or "").lower()
    domain_match = (not rdom) or rdom == (resume.get("domain") or "").lower() or rdom in " ".join(skills).lower()

    signals = {
        "skills": cov["value"],
        "semantic": semantic_fit(semantic_sims),
        "experience": experience_fit(total_years, float(rubric.get("min_years") or 0), domain_match),
        "education": education_fit(best_edu, (rubric.get("education") or {}).get("min_level"), certs,
                                   rubric.get("certifications", [])),
        "graph": graph_proximity(must + nice, skills, related),
    }
    total = round(100 * sum(w[k] * signals[k] for k in signals), 2)
    reasons = hard_filters(rubric, resume, total_years, cov, application)
    return {
        "total": total,
        "signals": {k: round(v, 3) for k, v in signals.items()},
        "weights": {k: round(v, 3) for k, v in w.items()},
        "contributions": {k: round(100 * w[k] * signals[k], 2) for k in signals},
        "skills_detail": cov,
        "eligible": not reasons,
        "ineligible_reasons": reasons,
        "total_years": total_years,
    }


def rank_candidates(scored: list[dict]) -> list[dict]:
    """Eligible first by total desc; ineligible after, keeping their reasons. Assigns `rank` (eligible only)."""
    elig = sorted([s for s in scored if s["eligible"]], key=lambda s: (-s["total"], s["application_id"]))
    inel = sorted([s for s in scored if not s["eligible"]], key=lambda s: (-s["total"], s["application_id"]))
    for i, s in enumerate(elig, 1):
        s["rank"] = i
    for s in inel:
        s["rank"] = None
    return elig + inel


def candidate_confidence(parse_confidence: float, evidence_ratio: float, selfcheck_flags: int) -> float:
    c = 0.5 * parse_confidence + 0.5 * evidence_ratio - 0.1 * selfcheck_flags
    return round(max(0.0, min(1.0, c)), 2)
