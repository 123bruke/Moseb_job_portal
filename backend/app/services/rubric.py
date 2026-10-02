"""Rubric helpers: defaults + validation (pure; the pydantic model lives in schemas/)."""
from app.services.scoring import DEFAULT_WEIGHTS


def empty_rubric(job: dict) -> dict:
    return {
        "must_have": [], "nice_to_have": [], "min_years": float(job.get("min_experience") or 0),
        "education": {"min_level": job.get("education_required") or "none", "fields": []},
        "certifications": [], "other_requirements": [], "domain": job.get("domain") or "",
        "weights": dict(DEFAULT_WEIGHTS),
        "hard_filters": {"max_missing_must_have": 0, "enforce_min_years": True, "location": None,
                         "work_authorization_required": False},
        "shortlist_size": max(5, 2 * int(job.get("seats") or 1)),
    }


def validate_for_publish(rubric: dict | None) -> list[str]:
    problems: list[str] = []
    if not rubric:
        return ["Rubric has not been generated yet"]
    if not rubric.get("must_have"):
        problems.append("At least one must-have skill is required")
    w = rubric.get("weights") or {}
    if abs(sum(float(v) for v in w.values()) - 100) > 0.5:
        problems.append("Weights must add up to 100")
    return problems
