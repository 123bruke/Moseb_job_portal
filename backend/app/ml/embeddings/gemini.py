"""Gemini embedding client (batched)."""
from app.core.config import get_settings
from app.ml import llm

BATCH = 50


def _embed(texts: list[str], task: str) -> list[list[float]]:
    model = get_settings().gemini_embed_model
    out: list[list[float]] = []
    for i in range(0, len(texts), BATCH):
        part = texts[i:i + BATCH]
        data = llm.post(f"models/{model}:batchEmbedContents", {"requests": [
            {"model": f"models/{model}", "content": {"parts": [{"text": t[:8000]}]}, "taskType": task}
            for t in part]})
        out.extend(e["values"] for e in data["embeddings"])
    return out


def embed_documents(texts: list[str]) -> list[list[float]]:
    return _embed(texts, "RETRIEVAL_DOCUMENT")


def embed_query(text: str) -> list[float]:
    return _embed([text], "RETRIEVAL_QUERY")[0]
