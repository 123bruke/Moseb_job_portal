"""ChromaDB: semantic search. Collections: resumes, jobs, knowledge.

We embed with Gemini ourselves and pass vectors in, so Chroma needs no embedding function."""
from functools import lru_cache
from typing import Any

import chromadb

from app.core.config import get_settings
from app.ml.embeddings.gemini import embed_documents, embed_query

RESUMES, JOBS, KNOWLEDGE = "resumes", "jobs", "knowledge"


@lru_cache
def client() -> Any:
    s = get_settings()
    return chromadb.HttpClient(host=s.chroma_host, port=s.chroma_port)


def col(name: str) -> Any:
    return client().get_or_create_collection(name, metadata={"hnsw:space": "cosine"})


def add_chunks(name: str, ids: list[str], texts: list[str], metadatas: list[dict]) -> None:
    if not ids:
        return
    vectors = embed_documents(texts)
    col(name).upsert(ids=ids, documents=texts, embeddings=vectors, metadatas=metadatas)


def query(name: str, text: str, where: dict | None = None, n: int = 5) -> list[dict]:
    """Returns [{id, text, metadata, similarity}] with similarity = 1 - cosine distance."""
    res = col(name).query(query_embeddings=[embed_query(text)], n_results=n, where=where,
                          include=["documents", "metadatas", "distances"])
    out = []
    for i, id_ in enumerate(res["ids"][0]):
        out.append({"id": id_, "text": res["documents"][0][i], "metadata": res["metadatas"][0][i],
                    "similarity": max(0.0, 1.0 - float(res["distances"][0][i]))})
    return out


def get_chunks(name: str, where: dict) -> list[dict]:
    res = col(name).get(where=where, include=["documents", "metadatas"])
    return [{"id": i, "text": d, "metadata": m} for i, d, m in zip(res["ids"], res["documents"], res["metadatas"])]


def delete_where(name: str, where: dict) -> None:
    col(name).delete(where=where)
