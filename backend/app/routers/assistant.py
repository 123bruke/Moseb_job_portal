"""Public Assistant Router for the Landing Page Phone UI.
Uses ChromaDB for policy retrieval and Redis for temporary conversation history.
No authentication required, accessible to visitors.
"""
import uuid
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.services import assistant_agent, policy_service

router = APIRouter(prefix="/assistant", tags=["assistant"])


class AssistantChatIn(BaseModel):
    session_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:16], max_length=64)
    message: str = Field(min_length=1, max_length=1500)


class AssistantChatOut(BaseModel):
    session_id: str
    reply: str
    sources: list[dict]
    history: list[dict]


@router.post("/chat", response_model=AssistantChatOut)
def assistant_chat(body: AssistantChatIn):
    """Processes a user question, queries ChromaDB for policy context, and updates temporary Redis history."""
    result = assistant_agent.process_chat_message(
        session_id=body.session_id,
        message=body.message,
    )
    return result


@router.get("/history")
def get_history(session_id: str = Query(..., min_length=1, max_length=64)):
    """Fetches the temporary conversation history stored in Redis."""
    messages = assistant_agent.get_session_history(session_id)
    return {"session_id": session_id, "messages": messages}


@router.delete("/history")
def clear_history(session_id: str = Query(..., min_length=1, max_length=64)):
    """Deletes the temporary conversation history from Redis."""
    assistant_agent.clear_session_history(session_id)
    return {"session_id": session_id, "cleared": True}


@router.get("/policies")
def list_policies():
    """Lists available policy documents and sample prompt suggestions."""
    chunks = policy_service.get_cached_chunks()
    return {
        "count": len(chunks),
        "prompts": [
            "What is your resume retention policy?",
            "How does the bias guard protect my identity?",
            "Can candidates delete their data anytime?",
            "How does the 5-signal scoring formula work?",
            "What are the IT CV AI vs Human screening rules?",
        ],
        "categories": ["privacy", "data_lifecycle", "evaluation", "security", "governance", "knowledge_it"],
    }


@router.post("/sync")
def sync_policies():
    """Triggers indexing of policy documents into ChromaDB."""
    indexed = policy_service.sync_chroma_policies()
    return {"status": "ok", "indexed_chunks": indexed}
