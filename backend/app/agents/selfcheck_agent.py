"""Step 6: bias + hallucination review. Deterministic checks always run; the LLM check is additive."""
import re

from app.agents.common import Deps, trace

_IDENTITY = re.compile(r"\b(he|she|his|her|male|female|age[d]?\s*\d+|nationality|years old)\b", re.I)


def self_check(state: dict, deps: Deps) -> dict:
    flags: list[str] = []
    table = state["verification"]
    ungrounded = [r["requirement"] for r in table if r["status"] == "met" and not r.get("quote")]
    if ungrounded:
        flags.append("Met without a quote: " + ", ".join(ungrounded))
        for r in table:
            if r["requirement"] in ungrounded:
                r["status"] = "partial"
    claimed = state["resume"].get("claimed_years")
    if claimed and abs(float(claimed) - state["total_years"]) > 2:
        flags.append(f"Claims {claimed:g} years but dates add up to {state['total_years']:g}")
    blob = " ".join(str(r.get("quote", "")) for r in table)
    if _IDENTITY.search(blob):
        flags.append("Identity-related wording appeared in evidence; excluded from scoring")
    if deps.llm_json is not None:
        from app.prompts import render
        try:
            v = deps.llm_json(render("selfcheck", assessment=str({"score": state["score"]["total"], "table": table})[:6000]))
            flags += [str(f) for f in v.get("flags", [])][:5]
            state["hallucination_risk"] = v.get("hallucination_risk", "low")
        except Exception:
            pass
    state["flags"] = flags
    trace(state, 6, "Self-check (bias & hallucination)", "; ".join(flags) if flags else "No contradictions or ungrounded claims found.")
    return state
