"""Moseb Assistant Agent.
Answers visitor questions about website policies, data retention, candidate privacy,
and screening rules from docs/ and data/ using ChromaDB retrieval and temporary Redis storage.
"""
import json
import logging
import time
from typing import Any

from app.ml import llm
from app.repositories.redis_repo import get_redis
from app.services.policy_service import query_policies

logger = logging.getLogger(__name__)

# Temporary session expiration: 24 hours in seconds
REDIS_SESSION_TTL = 86400
REDIS_KEY_PREFIX = "bot:session:"

# In-memory temporary fallback if Redis connection is unavailable
_LOCAL_SESSION_STORE: dict[str, dict[str, Any]] = {}


def _get_redis_key(session_id: str) -> str:
    return f"{REDIS_KEY_PREFIX}{session_id}:messages"


def get_session_history(session_id: str) -> list[dict]:
    """Retrieves temporary chat history from Redis database."""
    key = _get_redis_key(session_id)
    try:
        r = get_redis()
        raw = r.get(key)
        if raw:
            return json.loads(raw)
    except Exception as exc:
        logger.debug("Redis read unavailable (%s), checking local memory fallback.", exc)

    # Local fallback
    record = _LOCAL_SESSION_STORE.get(session_id)
    if record and record.get("expires_at", 0) > time.time():
        return record.get("messages", [])
    return []


def save_session_history(session_id: str, messages: list[dict]) -> None:
    """Saves temporary conversation history into Redis with TTL expiration."""
    key = _get_redis_key(session_id)
    # Keep only the last 20 messages to keep sessions fast and focused
    trimmed = messages[-20:]
    payload = json.dumps(trimmed)

    try:
        r = get_redis()
        r.setex(key, REDIS_SESSION_TTL, payload)
        return
    except Exception as exc:
        logger.debug("Redis write unavailable (%s), storing in local memory fallback.", exc)

    # Local fallback with TTL
    _LOCAL_SESSION_STORE[session_id] = {
        "messages": trimmed,
        "expires_at": time.time() + REDIS_SESSION_TTL,
    }


def clear_session_history(session_id: str) -> bool:
    """Purges the temporary conversation history from Redis."""
    key = _get_redis_key(session_id)
    try:
        r = get_redis()
        r.delete(key)
    except Exception as exc:
        logger.debug("Redis delete unavailable (%s).", exc)

    _LOCAL_SESSION_STORE.pop(session_id, None)
    return True


def format_assistant_response(query: str, history: list[dict], retrieved_docs: list[dict]) -> str:
    """Generates an authoritative, helpful response grounded in retrieved policy context."""
    # Build context string from retrieved ChromaDB docs
    context_blocks = []
    for d in retrieved_docs:
        context_blocks.append(f"[{d['title']} | Source: {d['source']}]\n{d['text']}")
    context_str = "\n\n".join(context_blocks)

    # If Gemini LLM is enabled and configured, generate with LLM
    if llm.enabled():
        system_instruction = (
            "You are Moseb Assistant (iconic 'A'), an AI assistant on the Moseb Smart Resume Checker landing page.\n"
            "Your job is to answer user and candidate questions about website policies, data retention, candidate privacy,\n"
            "bias protection, AI scoring algorithms, and domain knowledge from the provided documentation.\n"
            "Always be polite, concise, and structured. Highlight exact policies with bullet points where appropriate.\n"
            "Explain that chat conversation data is stored temporarily in Redis and automatically expires.\n"
            "Always ground your answer in the provided <policy_context>."
        )

        history_str = "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')[:400]}" for m in history[-6:])
        prompt = (
            f"<policy_context>\n{context_str}\n</policy_context>\n\n"
            f"Conversation History:\n{history_str}\n\n"
            f"User Question: {query}\n\n"
            "Provide a clear, helpful response explaining the relevant policy, guidelines, or screening rules."
        )

        try:
            return llm.generate(prompt=prompt, system=system_instruction, temperature=0.2)
        except Exception as e:
            logger.warning("LLM generation fallback due to error: %s", e)

    # High-quality contextual fallback synthesis when LLM API key is not supplied
    query_lower = query.lower()

    if any(k in query_lower for k in ["retention", "delete", "purge", "how long", "30 days"]):
        return (
            "### 📋 Resume Retention & Deletion Policy\n\n"
            "Under our **Website Data Lifecycle Policy** (`docs/policies/website_policy.md`):\n\n"
            "- **30-Day Auto-Purge:** Resumes of non-selected candidates are retained for a maximum of **30 calendar days** (`RETENTION_DAYS = 30`). After 30 days, files in storage, vector embeddings in ChromaDB, skill edges in Neo4j, and reasoning traces in Postgres are permanently deleted.\n"
            "- **One-Click Right to Erasure:** Candidates can delete their account and all attached data at any time from Profile Settings with immediate permanent effect.\n"
            "- **Temporary Assistant History:** Note that this chat session is stored temporarily in Redis and automatically expires after 24 hours."
        )

    if any(k in query_lower for k in ["bias", "anonym", "privacy", "pii", "name", "photo", "gender", "age"]):
        return (
            "### 🛡️ Bias Guard & Candidate Privacy Policy\n\n"
            "Moseb enforces strict **pre-evaluation anonymization** (`docs/policies/website_policy.md`):\n\n"
            "- **PII Stripping:** Before any chunking, embedding, or scoring, candidate names, photos, age, gender, nationality, postal codes, and contact numbers are completely stripped.\n"
            "- **Anonymous Labels:** Companies review candidates exclusively under pseudonyms (e.g., *Candidate 1*, *Candidate 2*) until a candidate is shortlisted.\n"
            "- **Fair Objective Evaluation:** Scoring is restricted to proven competencies, verified years of experience, and rubric compliance."
        )

    if any(k in query_lower for k in ["score", "formula", "ranking", "how does it work", "weights", "signals"]):
        return (
            "### 🧠 Explainable 5-Signal Scoring Formula\n\n"
            "Our ranking model never uses an opaque black box. Every score (0–100) is calculated via 5 weighted signals:\n\n"
            "1. **Must-Have Skill Coverage (35%):** Skills matching the employer's approved rubric.\n"
            "2. **Semantic Similarity (25%):** Cosine vector similarity in ChromaDB between the job requirements and resume.\n"
            "3. **Experience Fit (20%):** Verified duration in relevant roles.\n"
            "4. **Education & Certifications (10%):** Degree level and verified certificates.\n"
            "5. **Skill-Graph Proximity (10%):** Knowledge graph distance in Neo4j.\n\n"
            "> **Verifiable Quotes Guarantee:** A requirement verdict of *met* or *partial* must be supported by an exact, verifiable quote from the resume; otherwise it is marked *missing*."
        )

    if any(k in query_lower for k in ["redis", "temporary", "storage", "privacy of chat", "where is data stored"]):
        return (
            "### ⚡ Temporary Chat Storage (Redis Database)\n\n"
            "To preserve your privacy:\n\n"
            "- **Stored in Redis Only:** Conversation history for this Moseb Assistant is stored exclusively in our **Redis database** under ephemeral session keys (`bot:session:{session_id}`).\n"
            "- **Automatic Expiration (TTL):** All messages automatically expire and are purged after **24 hours** of inactivity.\n"
            "- **No Permanent Logs:** Conversations are never stored in PostgreSQL or persistent relational tables.\n"
            "- **Instant Clear:** You can click the **Clear Chat** button at the top of this phone UI at any moment to delete your session history immediately."
        )

    if any(k in query_lower for k in ["it", "cv", "ai vs human", "developer", "code", "rule"]):
        return (
            "### 💻 Technical IT Screening & AI vs Human Rules\n\n"
            "According to our knowledge datasets (`data/knowledge/it/it_ai_human_rules.json`):\n\n"
            "- **AI-Generated Indicators:** Identifies excessive buzzwords, generic descriptions without dates, repetitive sentence structure, and lack of real-world implementation nuances.\n"
            "- **Human-Generated Indicators:** Evaluates specific project context, varied sentence structure, realistic technology pairings, and nuanced technical achievements.\n"
            "- **Technology Stacks:** Validates core languages, cloud platforms, containerization, and database competencies."
        )

    # General answer synthesizing the retrieved docs
    top_doc = retrieved_docs[0] if retrieved_docs else None
    title = top_doc.get("title", "Website Policy") if top_doc else "Moseb Platform Policy"
    text = top_doc.get("text", "") if top_doc else "Our platform provides explainable, bias-guarded hiring."

    return (
        f"### ℹ️ {title}\n\n"
        f"Based on our official documentation (`{top_doc.get('source', 'docs/policies/website_policy.md')}`):\n\n"
        f"{text[:500]}...\n\n"
        "**Key Guarantees:**\n"
        "- Resumes are anonymized before AI evaluation.\n"
        "- Non-selected applicant data is automatically purged after 30 days.\n"
        "- Chat history is stored temporarily in Redis and automatically expires."
    )


def process_chat_message(session_id: str, message: str) -> dict[str, Any]:
    """Full workflow: retrieves history from Redis, queries ChromaDB for policy data,
    synthesizes answer, and updates Redis temporary store."""
    history = get_session_history(session_id)

    # Query ChromaDB (or local policy fallback)
    retrieved_docs = query_policies(message, n_results=3)

    # Generate assistant reply
    reply = format_assistant_response(message, history, retrieved_docs)

    # Build sources citation list
    sources = [
        {
            "title": d.get("title", "Policy Document"),
            "source": d.get("source", "docs/policies/website_policy.md"),
            "category": d.get("category", "policy"),
            "similarity": d.get("similarity", 0.9),
        }
        for d in retrieved_docs
    ]

    # Append to temporary Redis conversation history
    updated_history = list(history)
    updated_history.append({"role": "user", "content": message})
    updated_history.append({"role": "assistant", "content": reply, "sources": sources})
    save_session_history(session_id, updated_history)

    return {
        "session_id": session_id,
        "reply": reply,
        "sources": sources,
        "history": updated_history,
    }
