"""Step 4: score with the formula + graph signals (LLM is NOT the scorer)."""
from app.agents.common import Deps, trace
from app.services import scoring


def score_candidate(state: dict, deps: Deps) -> dict:
    rubric, resume = state["rubric"], state["resume"]
    required = [m["skill"] for m in rubric["must_have"]] + list(rubric["nice_to_have"])
    missing = [r for r in required if r.lower() not in {s.lower() for s in resume.get("skills", [])}]
    related = deps.related(missing, resume.get("skills", [])) if missing else {}
    sims = [c["similarity"] for k, v in state["evidence"].items() if not k.startswith("__") and v
            for c in v[:1]]
    result = scoring.compute_score(rubric, resume, state["total_years"], sims, related, state.get("application"))
    state["score"] = result
    c = result["contributions"]
    trace(state, 4, "Score",
          f"Total {result['total']}/100 (skills {c['skills']}, semantic {c['semantic']}, experience {c['experience']}, "
          f"education {c['education']}, graph {c['graph']}). "
          + ("Eligible." if result["eligible"] else "Not eligible: " + "; ".join(result["ineligible_reasons"])))
    return state
