from datetime import date

from app.services import bias, skills


def test_alias_normalisation():
    assert skills.normalize_skill("JS") == "JavaScript"
    assert skills.normalize_skill("k8s") == "Kubernetes"
    assert skills.normalize_skill("Underwater Basket Weaving") == "Underwater Basket Weaving"
    assert skills.normalize_skills(["js", "JavaScript", "TS"]) == ["JavaScript", "TypeScript"]


def test_find_skills_in_text_respects_boundaries():
    found = skills.find_skills_in_text("Built APIs in Python and Go; used C++ and java daily. No javascripty things.")
    assert {"Python", "Go", "C++", "Java"} <= set(found)
    assert "JavaScript" not in found


def test_total_years_merges_overlaps():
    exp = [{"start": "2018-01", "end": "2020-01"}, {"start": "2019-01", "end": "2021-01"}]
    assert skills.total_years(exp) == 3.0  # 2018-01 .. 2021-01, not 4


def test_total_years_handles_present_and_garbage():
    this_year = date.today().year
    y = skills.total_years([{"start": str(this_year - 2), "end": "present"}, {"start": "bad", "end": None}])
    assert 1.5 <= y <= 3.0
    assert skills.total_years([]) == 0.0


def test_sanitize_removes_identity_fields_and_redacts_text():
    resume = {
        "personal": {"name": "Jane Doe", "email": "jane@x.com", "nationality": "Kenyan"},
        "gender": "female", "age": 29,
        "skills": ["Python"],
        "experience": [{"title": "Dev", "summary": "Jane Doe built things. Contact jane@x.com or +251 911 234 567. he/him"}],
    }
    clean = bias.sanitize_resume(resume)
    flat = str(clean)
    assert "personal" not in clean and "gender" not in clean and "age" not in clean
    for leaked in ("Jane", "jane@x.com", "911", "Kenyan", "he/him"):
        assert leaked not in flat
    assert clean["skills"] == ["Python"]
