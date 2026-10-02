from app.agents import compare_agent
from app.agents.common import Deps
from app.agents.graph import run_candidate

RUBRIC = {"must_have": [{"skill": "Python"}, {"skill": "FastAPI"}], "nice_to_have": ["Docker"], "min_years": 3,
          "education": {"min_level": "bachelor"}, "certifications": [], "other_requirements": [], "domain": "IT",
          "weights": {"skills": 35, "semantic": 25, "experience": 20, "education": 10, "graph": 10},
          "hard_filters": {"max_missing_must_have": 0, "enforce_min_years": True}}

CHUNKS = [
    {"id": "c1", "text": "Skills: Python, FastAPI, Docker", "metadata": {}, "similarity": 0.85},
    {"id": "c2", "text": "Backend Dev at Acme (2020-01 - present). Built REST APIs with FastAPI and Python.", "metadata": {}, "similarity": 0.8},
    {"id": "c3", "text": "BSc Computer Science, AASTU [bachelor]", "metadata": {}, "similarity": 0.7},
]


def deps(chunks):
    return Deps(retrieve=lambda q, n: [c for c in chunks if any(w in c["text"].lower() for w in q.lower().split()[:1])][:n] or chunks[:1],
                related=lambda a, b: {}, llm_json=None)


def state(skills, years=5):
    return {"rubric": RUBRIC, "total_years": years, "parse_confidence": 0.9,
            "resume": {"skills": skills, "education": [{"level": "bachelor"}], "certificates": [], "domain": "IT"}}


def test_full_pipeline_grounded_and_traced():
    out = run_candidate(state(["Python", "FastAPI", "Docker"]), deps(CHUNKS))
    assert out["score"]["eligible"]
    assert [t["step"] for t in out["trace"]] == [1, 2, 3, 4, 6, 7]
    met = [r for r in out["verification"] if r["status"] == "met"]
    assert met and all(r["quote"] for r in met)          # every "met" cites evidence
    assert out["explanation"]["recommendation"] in ("strong_yes", "yes")


def test_no_evidence_means_missing_not_met():
    out2 = run_candidate(state(["Python"]), deps([CHUNKS[2]]))
    row = next(r for r in out2["verification"] if r["requirement"] == "FastAPI")
    assert row["status"] == "missing" and not out2["score"]["eligible"]
    assert out2["explanation"]["recommendation"] == "no"


def test_claimed_but_unsupported_is_partial():
    out = run_candidate(state(["Python", "FastAPI"]), deps([CHUNKS[2]]))
    row = next(r for r in out["verification"] if r["requirement"] == "FastAPI")
    assert row["status"] == "partial"


def test_pairwise_refine_swaps_only_close_scores():
    mk = lambda i, t: {"application_id": i, "score": {"total": t, "total_years": 3},
                       "explanation": {"strengths": [], "gaps": [], "risk_flags": []}}
    ranked = [mk("a", 80), mk("b", 79), mk("c", 40)]
    calls = []
    def fake(prompt):
        calls.append(1)
        return {"winner": "B", "explanation": "b has stronger evidence"}
    try:  # prompt rendering needs langchain-core (present in CI, optional for quick local runs)
        new, notes = compare_agent.pairwise_refine(ranked, RUBRIC, fake)
    except ModuleNotFoundError:
        return
    assert [c["application_id"] for c in new][:2] == ["b", "a"] and len(calls) == 1 and notes


def test_no_llm_keeps_formula_order():
    ranked = [{"application_id": "a"}, {"application_id": "b"}]
    new, notes = compare_agent.pairwise_refine(ranked, RUBRIC, None)
    assert new == ranked and notes == []
