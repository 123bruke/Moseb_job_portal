"""Versioned prompt templates (prompts/<version>/<name>.md), rendered via LangChain PromptTemplate."""
from functools import lru_cache
from pathlib import Path

from langchain_core.prompts import PromptTemplate

VERSION = "v1"
_DIR = Path(__file__).parent


@lru_cache
def _tpl(name: str, version: str) -> PromptTemplate:
    return PromptTemplate.from_template((_DIR / version / f"{name}.md").read_text())


def render(name: str, version: str = VERSION, **kw) -> str:
    return _tpl(name, version).format(**kw)
