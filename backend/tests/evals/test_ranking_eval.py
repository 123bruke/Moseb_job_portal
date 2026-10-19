"""Agent/ranking eval: labelled resume-job pairs. CI fails if accuracy drops below the threshold."""
import json
from pathlib import Path

from app.services import scoring

THRESHOLD = 0.95


def _case(c):
    rub = {"must_have": [{"skill": s} for s in c["rubric"]["must_have"]], "nice_to_have": c["rubric"]["nice_to_have"],
           "min_years": c["rubric"]["min_years"], "education": {"min_level": c["rubric"]["education"]}, "certifications": [], "domain": "",
           "hard_filters": {"max_missing_must_have": 0, "enforce_min_years": True}}
    r = c["resume"]
    res = {"skills": r["skills"], "education": [{"level": r["education"]}], "certificates": []}
    return scoring.compute_score(rub, res, r["years"], [0.8], {})


def test_ranking_accuracy_above_threshold():
    cases = json.loads((Path(__file__).parent / "pairs.json").read_text())
    ok = 0
    for c in cases:
        out = _case(c)
        ok += out["eligible"] == c["expect_eligible"] and out["total"] >= c["min_score"]
    assert ok / len(cases) >= THRESHOLD, f"{ok}/{len(cases)} correct"
