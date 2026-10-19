"""Per-candidate agent graph (LangGraph on top of LangChain):

  1 understand rubric -> 2 retrieve evidence -> 3 verify -> 4 score -> 6 self-check -> 7 explain
Step 5 (compare against other candidates) is cross-candidate and runs at job level in rank_job.
Every node appends a visible step to state["trace"] -> persisted in reasoning_traces."""
from typing import Any, TypedDict

from app.agents import evidence_agent, explain_agent, scoring_agent, selfcheck_agent
from app.agents.common import Deps, trace


class CandState(TypedDict, total=False):
    rubric: dict
    resume: dict          # SANITISED (no name/photo/age/gender/nationality)
    total_years: float
    parse_confidence: float
    application: dict
    evidence: dict
    verification: list
    score: dict
    flags: list
    explanation: dict
    confidence: float
    trace: list


def _understand(state: dict, deps: Deps) -> dict:
    r = state["rubric"]
    trace(state, 1, "Understand job rubric",
          f"{len(r['must_have'])} must-have, {len(r['nice_to_have'])} nice-to-have skills; min {r.get('min_years', 0):g} years; "
          f"education {(r.get('education') or {}).get('min_level', 'none')}. Candidate identity fields were stripped before scoring.")
    return state


STEPS = [_understand, evidence_agent.retrieve_evidence, evidence_agent.verify_requirements,
         scoring_agent.score_candidate, selfcheck_agent.self_check, explain_agent.explain]


def run_candidate(state: dict, deps: Deps) -> dict[str, Any]:
    """Runs the LangGraph graph when available; identical sequential execution otherwise (tests/dev)."""
    try:
        from langgraph.graph import END, StateGraph
    except ImportError:
        for step in STEPS:
            state = step(state, deps)
        return state
    g = StateGraph(CandState)
    names = ["understand", "retrieve", "verify", "score", "selfcheck", "explain"]
    for n, fn in zip(names, STEPS):
        g.add_node(n, (lambda st, fn=fn: fn(dict(st), deps)))
    g.set_entry_point(names[0])
    for a, b in zip(names, names[1:]):
        g.add_edge(a, b)
    g.add_edge(names[-1], END)
    return g.compile().invoke(state)
