"""Shared pieces for the agent graph: dependency container + trace helper."""
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class Deps:
    """Injected so agents are testable without Chroma/Neo4j/Gemini."""
    retrieve: Callable[[str, int], list[dict]]                 # (query, n) -> [{id,text,metadata,similarity}]
    related: Callable[[list[str], list[str]], dict[str, float]]  # graph proximity lookup
    llm_json: Callable[[str], Any] | None = None               # prompt -> parsed JSON (None = no LLM)
    alias_index: dict[str, str] = field(default_factory=dict)


def trace(state: dict, step: int, name: str, content: str, refs: list[str] | None = None) -> None:
    state.setdefault("trace", []).append(
        {"step": step, "name": name, "content": content, "evidence_refs": refs or []})


def norm(s: str) -> str:
    return " ".join(s.lower().split())
