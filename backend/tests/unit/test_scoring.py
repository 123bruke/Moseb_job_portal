from app.services import scoring as sc

RUBRIC = {
    "must_have": [{"skill": "Python"}, {"skill": "FastAPI"}],
    "nice_to_have": ["Docker"],
    "min_years": 3,
    "education": {"min_level": "bachelor"},
    "certifications": [],
    "domain": "IT",
    "weights": {"skills": 35, "semantic": 25, "experience": 20, "education": 10, "graph": 10},
    "hard_filters": {"max_missing_must_have": 0, "enforce_min_years": True},
}


def resume(skills, edu="bachelor"):
    return {"skills": skills, "education": [{"level": edu}], "certificates": [], "domain": "IT"}


def test_weights_normalise_to_one():
    w = sc.normalize_weights({"skills": 70, "semantic": 50, "experience": 40, "education": 20, "graph": 20})
    assert abs(sum(w.values()) - 1) < 1e-9


def test_perfect_candidate_scores_high_and_eligible():
    r = sc.compute_score(RUBRIC, resume(["Python", "FastAPI", "Docker"]), 5, [0.9, 0.9], {})
    assert r["eligible"] and r["total"] >= 95


def test_missing_must_have_is_ineligible_with_reason_not_dropped():
    r = sc.compute_score(RUBRIC, resume(["Python"]), 5, [0.8], {"FastAPI": 0.8})
    assert not r["eligible"]
    assert "FastAPI" in r["ineligible_reasons"][0]
    assert r["total"] > 0  # still scored, shown to the company with the reason


def test_below_min_years_is_ineligible():
    r = sc.compute_score(RUBRIC, resume(["Python", "FastAPI"]), 1.5, [0.8], {})
    assert not r["eligible"] and "experience" in r["ineligible_reasons"][0].lower()


def test_graph_proximity_gives_partial_credit_for_related_skill():
    near = sc.graph_proximity(["Flask"], ["FastAPI"], {"Flask": 0.8})
    far = sc.graph_proximity(["Flask"], ["Excel"], {})
    assert near == 0.8 and far == 0.0


def test_semantic_fit_is_clamped():
    assert sc.semantic_fit([]) == 0.0
    assert sc.semantic_fit([0.2]) == 0.0
    assert sc.semantic_fit([0.99]) == 1.0


def test_education_aliases():
    assert sc.edu_rank("MSc") == 4 and sc.edu_rank("High School") == 1 and sc.edu_rank(None) == 0
    assert sc.education_fit("diploma", "bachelor", [], []) < 1.0


def test_ranking_orders_eligible_first_and_assigns_ranks():
    scored = [
        {"application_id": "a", "total": 70, "eligible": True},
        {"application_id": "b", "total": 90, "eligible": False},
        {"application_id": "c", "total": 80, "eligible": True},
    ]
    out = sc.rank_candidates(scored)
    assert [s["application_id"] for s in out] == ["c", "a", "b"]
    assert out[0]["rank"] == 1 and out[1]["rank"] == 2 and out[2]["rank"] is None


def test_location_and_work_auth_hard_filters():
    rub = {**RUBRIC, "hard_filters": {"location": "Berlin", "work_authorization_required": True}}
    app = {"form_answers_json": {"location": "Paris", "work_authorization": False}}
    cov = sc.skill_coverage(["Python"], [], ["Python"])
    reasons = sc.hard_filters(rub, {}, 5, cov, app)
    assert len(reasons) == 2


def test_confidence_bounds():
    assert 0 <= sc.candidate_confidence(1, 1, 0) <= 1
    assert sc.candidate_confidence(0, 0, 9) == 0.0
