from app.services import knowledge as k
from app.services.resume_parser import chunk_resume, heuristic_parse, normalize_parsed, split_sections
from app.services import bias

BROKEN = '{"resumes":[{"job_title":"Backend Engineer","technologies":["Python","FastAPI"],"x":"tr'  # truncated JSON

TEXT = """Jane Doe
jane@x.com
Summary
Backend developer who ships.
Skills
Python, FastAPI, Docker, JS
Experience
Dev at Acme 2019-03 - 2022-03
Dev at Beta 2022-04 - 2023-04
Education
BSc Computer Science, AASTU
Certificates
AWS Cloud Practitioner
"""


def test_extracts_from_truncated_json():
    recs = k.extract_records(BROKEN)
    assert recs and recs[0]["role"] == "Backend Engineer" and "FastAPI" in recs[0]["skills"]


def test_object_arrays_use_names_only():
    t = '"job_title":"X","primary_languages":[{"name":"Go","years":5,"proficiency":"Expert"}]'
    assert k.extract_records(t)[0]["skills"] == ["Go"]


def test_related_pairs_need_cooccurrence():
    recs = [{"domain": "it", "role": "", "skills": ["A1", "B1"]}, {"domain": "it", "role": "", "skills": ["A1", "B1", "C1"]}]
    pairs = k.related_pairs(recs, {"A1", "B1", "C1"})
    assert pairs and pairs[0][:2] == ("A1", "B1") and 0.3 <= pairs[0][2] <= 0.8


def test_split_sections_and_heuristic_parse():
    secs = split_sections(TEXT)
    assert {"skills", "experience", "education"} <= set(secs)
    p = normalize_parsed(heuristic_parse(TEXT))
    assert "JavaScript" in p["skills"] and "Python" in p["skills"]
    assert p["total_years"] == 4.1 or 4.0 <= p["total_years"] <= 4.2
    assert p["education"][0]["level"] == "bachelor"


def test_chunks_never_contain_identity():
    p = normalize_parsed(heuristic_parse(TEXT))
    chunks = chunk_resume(bias.sanitize_resume(p))
    blob = " ".join(c["text"] for c in chunks)
    assert "Jane" not in blob and "jane@x.com" not in blob and chunks
