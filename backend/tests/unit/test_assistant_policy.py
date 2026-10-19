import pytest
from app.services import assistant_agent, policy_service


def test_load_policy_chunks():
    chunks = policy_service.load_all_policy_chunks()
    assert len(chunks) > 0, "Policy chunks should be extracted from docs and data"
    
    titles = [c["title"].lower() for c in chunks]
    # Check that privacy, retention, and IT knowledge chunks exist
    assert any("retention" in t or "lifecycle" in t or "privacy" in t for t in titles)
    assert any("it" in t or "rules" in t or "pattern" in t for t in titles)


def test_query_policies_retention():
    results = policy_service.query_policies("What is the resume retention policy?", n_results=3)
    assert len(results) > 0
    top = results[0]
    assert "retention" in top["text"].lower() or "purge" in top["text"].lower()
    assert top["source"].startswith("docs/") or top["source"].startswith("data/")


def test_query_policies_bias_guard():
    results = policy_service.query_policies("How does the bias guard protect my identity?", n_results=3)
    assert len(results) > 0
    top = results[0]
    assert "bias" in top["text"].lower() or "anonym" in top["text"].lower() or "privacy" in top["text"].lower()


def test_redis_temporary_session_lifecycle():
    session_id = "test_sess_12345"
    
    # 1. Initially empty
    assistant_agent.clear_session_history(session_id)
    history = assistant_agent.get_session_history(session_id)
    assert history == []
    
    # 2. Process turn
    res = assistant_agent.process_chat_message(session_id, "How long is my resume kept?")
    assert res["session_id"] == session_id
    assert "30" in res["reply"] or "retention" in res["reply"].lower()
    assert len(res["sources"]) > 0
    
    # 3. History now has user and assistant messages
    stored = assistant_agent.get_session_history(session_id)
    assert len(stored) == 2
    assert stored[0]["role"] == "user"
    assert stored[1]["role"] == "assistant"
    
    # 4. Clear temporary session
    assistant_agent.clear_session_history(session_id)
    cleared = assistant_agent.get_session_history(session_id)
    assert cleared == []
