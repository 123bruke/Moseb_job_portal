"""Step 7: final explanation + recommendation. Template fallback when the LLM is unavailable."""
from app.agents.common import Deps, trace
from app.services import scoring


def _fallback(state: dict) -> dict:
    t = state["verification"]
    met = [r["requirement"] for r in t if r["status"] == "met"]
    miss = [r["requirement"] for r in t if r["status"] == "missing"]
    s = state["score"]
    rec = "no" if not s["eligible"] else "strong_yes" if s["total"] >= 80 else "yes" if s["total"] >= 65 else "maybe"
    return {"strengths": met[:4], "gaps": miss[:4], "risk_flags": state.get("flags", []),
            "reasoning": f"Scored {s['total']}/100. Met {len(met)} of {len(t)} verified requirements."
                         + ("" if s["eligible"] else " Not eligible: " + "; ".join(s["ineligible_reasons"])),
            "recommendation": rec,
            "candidate_feedback": [f"Add evidence of {m} to your resume if you have it." for m in miss[:4]]}


def explain(state: dict, deps: Deps) -> dict:
    out = _fallback(state)
    if deps.llm_json is not None:
        from app.prompts import render
        try:
            v = deps.llm_json(render("explain", score=state["score"]["total"], eligible=state["score"]["eligible"],
                                     reasons=state["score"]["ineligible_reasons"],
                                     table=str([(r["requirement"], r["status"], r.get("quote", "")[:100]) for r in state["verification"]]),
                                     flags=state.get("flags", [])))
            out.update({k: v[k] for k in out if k in v and v[k]})
        except Exception:
            pass
    if not state["score"]["eligible"]:
        out["recommendation"] = "no"
    ver = state["verification"]
    ratio = sum(1 for r in ver if r["status"] == "met") / len(ver) if ver else 0
    state["explanation"] = out
    state["confidence"] = scoring.candidate_confidence(state.get("parse_confidence", 0.5), ratio, len(state.get("flags", [])))
    trace(state, 7, "Final explanation", out["reasoning"])
    return state
