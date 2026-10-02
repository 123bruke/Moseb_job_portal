"""Steps 2-3: retrieve evidence from the resume and verify each requirement (met / partial / missing + quote).

Trust rule: every "met" must cite a quote that really is a substring of a retrieved resume chunk.
No evidence -> missing. LLM verdicts without a grounded quote are downgraded."""
import re
from typing import Any

from app.agents.common import Deps, norm, trace
from app.services import skills as sk
from app.services.scoring import edu_rank


def _sentence_with(text: str, needle: str) -> str:
    for part in re.split(r"(?<=[.!?\n])\s+", text):
        if needle.lower() in part.lower():
            return part.strip()[:220]
    return ""


def _aliases(canon: str, idx: dict[str, str]) -> list[str]:
    return [canon.lower()] + [a for a, c in idx.items() if c == canon]


def retrieve_evidence(state: dict, deps: Deps) -> dict:
    """Step 2: per-requirement top chunks from this application's resume only."""
    rubric = state["rubric"]
    reqs = [m["skill"] for m in rubric["must_have"]] + list(rubric["nice_to_have"]) + list(rubric["other_requirements"])
    ev: dict[str, list[dict]] = {}
    for r in reqs:
        ev[r] = deps.retrieve(r, 3)
    # Always include experience/education chunks for the years / education checks
    ev["__experience__"] = deps.retrieve("work experience employment history", 5)
    ev["__education__"] = deps.retrieve("education degree university", 3)
    state["evidence"] = ev
    n = sum(1 for k, v in ev.items() if v and not k.startswith("__"))
    trace(state, 2, "Retrieve evidence", f"Retrieved resume passages for {n} of {len(reqs)} requirements.",
          [c["id"] for v in ev.values() for c in v][:20])
    return state


def _verify_skill(skill: str, state: dict, deps: Deps) -> dict:
    idx = deps.alias_index or sk.build_alias_index()
    claimed = {s.lower() for s in state["resume"].get("skills", [])}
    chunks = state["evidence"].get(skill, [])
    all_chunks = chunks + [c for k, v in state["evidence"].items() if k.startswith("__") for c in v]
    for c in all_chunks:
        for alias in _aliases(skill, idx):
            q = _sentence_with(c["text"], alias)
            if q:
                return {"requirement": skill, "kind": "skill", "status": "met", "quote": q, "ref": c["id"]}
    if skill.lower() in claimed:
        return {"requirement": skill, "kind": "skill", "status": "partial", "quote": "",
                "ref": None, "reason": "Listed as a skill but no supporting passage found"}
    return {"requirement": skill, "kind": "skill", "status": "missing", "quote": "", "ref": None}


def _verify_free_text(req: str, state: dict, deps: Deps) -> dict:
    chunks = state["evidence"].get(req, [])
    if not chunks or deps.llm_json is None:
        return {"requirement": req, "kind": "other", "status": "missing", "quote": "", "ref": None,
                "reason": "No evidence retrieved" if not chunks else "LLM unavailable"}
    from app.prompts import render
    evidence = "\n".join(c["text"] for c in chunks)
    try:
        v = deps.llm_json(render("verify_requirement", requirement=req, evidence=evidence))
    except Exception:
        v = {}
    quote = str(v.get("quote", "")).strip()
    status = v.get("status", "missing")
    grounded = bool(quote) and any(norm(quote) in norm(c["text"]) for c in chunks)
    if status in ("met", "partial") and not grounded:
        status, quote = "missing", ""
    ref = next((c["id"] for c in chunks if quote and norm(quote) in norm(c["text"])), None)
    return {"requirement": req, "kind": "other", "status": status if status in ("met", "partial", "missing") else "missing",
            "quote": quote, "ref": ref, "reason": v.get("reason", "")}


def verify_requirements(state: dict, deps: Deps) -> dict:
    rubric, resume = state["rubric"], state["resume"]
    table: list[dict[str, Any]] = []
    for m in rubric["must_have"]:
        row = _verify_skill(m["skill"], state, deps)
        row["importance"] = "must"
        table.append(row)
    for s in rubric["nice_to_have"]:
        row = _verify_skill(s, state, deps)
        row["importance"] = "nice"
        table.append(row)
    for o in rubric["other_requirements"]:
        row = _verify_free_text(o, state, deps)
        row["importance"] = "other"
        table.append(row)

    years, need = state["total_years"], float(rubric.get("min_years") or 0)
    if need:
        st = "met" if years >= need else ("partial" if years >= 0.7 * need else "missing")
        exp = state["evidence"].get("__experience__", [])
        table.append({"requirement": f"{need:g}+ years of experience", "kind": "experience", "importance": "must",
                      "status": st, "quote": f"{years:g} years computed from employment dates",
                      "ref": exp[0]["id"] if exp else None})
    min_level = (rubric.get("education") or {}).get("min_level")
    if edu_rank(min_level):
        best = max((edu_rank(e.get("level")) for e in resume.get("education", [])), default=0)
        ed = state["evidence"].get("__education__", [])
        st = "met" if best >= edu_rank(min_level) else ("partial" if best == edu_rank(min_level) - 1 else "missing")
        table.append({"requirement": f"Education: {min_level} or higher", "kind": "education", "importance": "must",
                      "status": st, "quote": ed[0]["text"][:160] if ed and st != "missing" else "", "ref": ed[0]["id"] if ed else None})
    state["verification"] = table
    counts = {k: sum(1 for r in table if r["status"] == k) for k in ("met", "partial", "missing")}
    trace(state, 3, "Verify requirements",
          f"{counts['met']} met, {counts['partial']} partial, {counts['missing']} missing. Every 'met' cites resume text.",
          [r["ref"] for r in table if r.get("ref")])
    return state
