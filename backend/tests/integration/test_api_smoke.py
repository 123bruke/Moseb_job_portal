"""Needs the docker compose test stack (Chroma, Neo4j, Redis) and a mocked Gemini. Run: pytest -m integration"""
import pytest

pytestmark = pytest.mark.integration


def test_health_endpoints():
    fastapi_testclient = pytest.importorskip("fastapi.testclient")
    from app.main import app
    c = fastapi_testclient.TestClient(app)
    assert c.get("/health").json() == {"status": "ok"}
    assert c.get("/jobs/mine").status_code == 401         # auth enforced
    assert c.get("/admin/users").status_code == 401


def test_error_envelope_shape():
    fastapi_testclient = pytest.importorskip("fastapi.testclient")
    from app.main import app
    body = fastapi_testclient.TestClient(app).get("/me").json()
    assert set(body["error"]) == {"code", "message", "request_id"}
