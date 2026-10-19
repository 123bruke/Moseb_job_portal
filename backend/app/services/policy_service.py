"""Policy & Knowledge Retrieval Service for Moseb Job Portal.
Retrieves and indexes data from `docs/` and `data/` using ChromaDB with resilient fallbacks.
"""
import json
import logging
import re
from pathlib import Path
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)

POLICIES_COLLECTION = "policies"


def get_project_root() -> Path:
    """Finds repository root whether executed inside Docker (/app) or on host."""
    # backend/app/services/policy_service.py -> parents[2] is backend, parents[3] is repo root
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "docs").exists() and (parent / "data").exists():
            return parent
    return current.parents[3]


def load_all_policy_chunks() -> list[dict]:
    """Extracts policy and knowledge chunks from docs/ and data/ directories."""
    root = get_project_root()
    chunks: list[dict] = []

    # 1. Parse docs/policies/website_policy.md
    policy_md = root / "docs" / "policies" / "website_policy.md"
    if policy_md.exists():
        content = policy_md.read_text(encoding="utf-8", errors="ignore")
        sections = re.split(r"\n##\s+", content)
        for sec in sections:
            if not sec.strip():
                continue
            lines = sec.strip().split("\n")
            title = lines[0].strip("# ").strip()
            body = "\n".join(lines[1:]).strip()
            if len(body) > 30:
                chunks.append({
                    "id": f"doc_policy_{abs(hash(title)) % 100000}",
                    "title": title,
                    "category": "policy",
                    "source": "docs/policies/website_policy.md",
                    "text": f"Policy Section: {title}\n{body[:1200]}",
                })

    # 2. Parse data/website_policies.json
    policies_json = root / "data" / "website_policies.json"
    if policies_json.exists():
        try:
            data = json.loads(policies_json.read_text(encoding="utf-8", errors="ignore"))
            for p in data.get("policies", []):
                chunks.append({
                    "id": p.get("id", f"json_pol_{len(chunks)}"),
                    "title": p.get("title", "Website Policy"),
                    "category": p.get("category", "policy"),
                    "source": p.get("source", "data/website_policies.json"),
                    "text": f"Policy [{p.get('title')}]: {p.get('content')}",
                })
        except Exception as e:
            logger.warning("Error parsing data/website_policies.json: %s", e)

    # 3. Parse data/knowledge/it/it_ai_human_rules.json (AI vs Human indicators)
    it_rules = root / "data" / "knowledge" / "it" / "it_ai_human_rules.json"
    if it_rules.exists():
        try:
            raw = json.loads(it_rules.read_text(encoding="utf-8", errors="ignore"))
            system_data = raw.get("ai_human_identification_system", {})
            rules = system_data.get("identification_rules", {})
            ai_ind = rules.get("ai_indicators", {})
            human_ind = rules.get("human_indicators", {})

            ai_patterns = ", ".join(ai_ind.get("linguistic_patterns", [])[:6] + ai_ind.get("technical_patterns", [])[:6])
            human_patterns = ", ".join(human_ind.get("linguistic_patterns", [])[:6] + human_ind.get("technical_patterns", [])[:6])

            chunks.append({
                "id": "it_ai_vs_human_rules",
                "title": "IT AI vs Human CV Screening Rules & Patterns",
                "category": "knowledge_it",
                "source": "data/knowledge/it/it_ai_human_rules.json",
                "text": f"IT CV Analysis System Rules: Evaluates AI vs Human generation. AI Indicators: {ai_patterns}. Human Indicators: {human_patterns}.",
            })
        except Exception as e:
            logger.warning("Error parsing it_ai_human_rules: %s", e)

    # 4. Parse Architecture & Migration docs
    mig_doc = root / "docs" / "MIGRATION.md"
    if mig_doc.exists():
        txt = mig_doc.read_text(encoding="utf-8", errors="ignore")
        chunks.append({
            "id": "doc_migration_summary",
            "title": "Moseb Architecture & Technology Stack",
            "category": "architecture",
            "source": "docs/MIGRATION.md",
            "text": f"System Architecture & Migration: {txt[:900]}",
        })

    return chunks


# Cache chunks in memory for fast fallback lookup
_MEMORY_CHUNKS: list[dict] = []


def get_cached_chunks() -> list[dict]:
    global _MEMORY_CHUNKS
    if not _MEMORY_CHUNKS:
        _MEMORY_CHUNKS = load_all_policy_chunks()
    return _MEMORY_CHUNKS


def sync_chroma_policies() -> int:
    """Connects to ChromaDB and indexes policy documents into POLICIES_COLLECTION."""
    chunks = get_cached_chunks()
    if not chunks:
        return 0

    try:
        from app.repositories import chroma_repo
        ids = [c["id"] for c in chunks]
        texts = [c["text"] for c in chunks]
        metadatas = [{"title": c["title"], "category": c["category"], "source": c["source"]} for c in chunks]
        chroma_repo.add_chunks(POLICIES_COLLECTION, ids, texts, metadatas)
        logger.info("Successfully synced %d policy chunks into ChromaDB '%s'", len(chunks), POLICIES_COLLECTION)
        return len(chunks)
    except Exception as exc:
        logger.warning("Could not sync with remote ChromaDB (%s). Using local retrieval fallback.", exc)
        return len(chunks)


def query_policies(query_text: str, n_results: int = 4) -> list[dict]:
    """Queries ChromaDB vector collection, falling back seamlessly to keyword/semantic scoring."""
    chunks = get_cached_chunks()
    query_lower = query_text.lower()

    # 1. Try ChromaDB retrieval
    try:
        from app.repositories import chroma_repo
        hits = chroma_repo.query(POLICIES_COLLECTION, query_text, None, n_results)
        if hits:
            results = []
            for h in hits:
                meta = h.get("metadata", {})
                results.append({
                    "id": h.get("id"),
                    "title": meta.get("title", "Policy Section"),
                    "category": meta.get("category", "policy"),
                    "source": meta.get("source", "docs/policies/website_policy.md"),
                    "text": h.get("text", ""),
                    "similarity": round(float(h.get("similarity", 0.85)), 3),
                })
            return results
    except Exception as exc:
        logger.debug("ChromaDB query skipped or unavailable (%s), using local semantic scoring.", exc)

    # 2. Local Semantic / Keyword Scoring Fallback
    scored_chunks = []
    tokens = [t for t in re.findall(r"\w+", query_lower) if len(t) > 2]

    for c in chunks:
        score = 0.0
        text_lower = c["text"].lower()
        title_lower = c["title"].lower()

        # Score based on token frequency and title importance
        for token in tokens:
            if token in title_lower:
                score += 3.0
            if token in text_lower:
                score += 1.0

        # Topic matches
        if any(w in query_lower for w in ["retention", "delete", "purge", "30 days"]) and "retention" in text_lower:
            score += 5.0
        if any(w in query_lower for w in ["bias", "anonym", "privacy", "pii", "name", "photo"]) and "bias" in text_lower:
            score += 5.0
        if any(w in query_lower for w in ["score", "formula", "weight", "percent", "signal"]) and "scoring" in text_lower:
            score += 5.0
        if any(w in query_lower for w in ["security", "injection", "malware", "virus", "clamav"]) and "security" in text_lower:
            score += 5.0
        if any(w in query_lower for w in ["redis", "temporary", "history", "store", "chat"]) and "redis" in text_lower:
            score += 6.0
        if any(w in query_lower for w in ["it", "cv", "rules", "ai vs human"]) and "ai vs human" in text_lower:
            score += 5.0

        scored_chunks.append((score, c))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_matches = [c for score, c in scored_chunks[:n_results]]

    return [{
        "id": c["id"],
        "title": c["title"],
        "category": c["category"],
        "source": c["source"],
        "text": c["text"],
        "similarity": 0.90,
    } for c in top_matches]
