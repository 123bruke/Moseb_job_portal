"""Step 1: understand the job -> structured rubric (human reviews/edits before publish)."""
from typing import Any

from app.services import skills as sk
from app.services.rubric import empty_rubric
from app.services.scoring import DEFAULT_WEIGHTS


def generate_rubric(job: dict, requirement_text: str = "", use_llm: bool | None = None) -> dict[str, Any]:
    from app.ml import llm
    base = empty_rubric(job)
    text = f"{job.get('description','')}\n{requirement_text}".strip()
    use_llm = llm.enabled() if use_llm is None else use_llm
    data: dict[str, Any] = {}
    if use_llm:
        from app.prompts import render
        try:
            fields = {k: job.get(k) for k in ("min_experience", "education_required", "domain", "location", "seats")}
            data = llm.generate_json(render("rubric", title=job["title"], fields=fields, text=text[:30000]))
        except Exception:
            data = {}
    if not data:  # fallback: vocabulary scan
        found = sk.find_skills_in_text(text)
        data = {"must_have": [{"skill": s} for s in found[:6]], "nice_to_have": found[6:12]}
    return merge_into_base(base, data)


def merge_into_base(base: dict, data: dict) -> dict:
    out = dict(base)
    out["must_have"] = [
        {"skill": sk.normalize_skill(m["skill"] if isinstance(m, dict) else str(m)),
         **({"min_years": float(m["min_years"])} if isinstance(m, dict) and m.get("min_years") else {})}
        for m in data.get("must_have", [])]
    must = {m["skill"] for m in out["must_have"]}
    out["nice_to_have"] = [s for s in sk.normalize_skills([str(x) for x in data.get("nice_to_have", [])]) if s not in must]
    for k in ("certifications", "other_requirements"):
        out[k] = [str(x) for x in data.get(k, [])]
    try:
        out["min_years"] = float(data.get("min_years", base["min_years"]) or base["min_years"])
    except (TypeError, ValueError):
        pass
    edu = data.get("education") or {}
    if isinstance(edu, dict):
        out["education"] = {"min_level": edu.get("min_level") or base["education"]["min_level"], "fields": edu.get("fields") or []}
    if data.get("domain"):
        out["domain"] = str(data["domain"])
    w = data.get("weights") or {}
    if isinstance(w, dict) and w and abs(sum(float(v) for v in w.values()) - 100) < 0.5:
        out["weights"] = {k: float(w.get(k, DEFAULT_WEIGHTS[k])) for k in DEFAULT_WEIGHTS}
    return out
