"""Step 5 (job level): pairwise comparison of the top ~10 to break ties and write comparison text."""
from typing import Any, Callable


def _summary(c: dict) -> str:
    e = c["explanation"]
    return f"strengths: {e['strengths']}; gaps: {e['gaps']}; years: {c['score']['total_years']}; flags: {e['risk_flags']}"


def pairwise_refine(ranked: list[dict], rubric: dict, llm_json: Callable[[str], Any] | None,
                    top: int = 10, band: float = 5.0) -> tuple[list[dict], list[str]]:
    """Bubble pass over the top group: adjacent candidates within `band` points are compared; the winner moves up.
    Returns (new order, comparison notes). Without an LLM the formula order stands."""
    notes: list[str] = []
    group = ranked[:top]
    if llm_json is None or len(group) < 2:
        return ranked, notes
    from app.prompts import render
    for i in range(len(group) - 1):
        a, b = group[i], group[i + 1]
        if abs(a["score"]["total"] - b["score"]["total"]) > band:
            continue
        try:
            v = llm_json(render("compare", rubric=str(rubric)[:3000], score_a=a["score"]["total"], summary_a=_summary(a),
                                score_b=b["score"]["total"], summary_b=_summary(b)))
        except Exception:
            continue
        label_a, label_b = f"#{i+1}", f"#{i+2}"
        if str(v.get("winner", "A")).upper() == "B":
            group[i], group[i + 1] = b, a
            notes.append(f"{label_b} edged ahead of {label_a}: {v.get('explanation','')}")
        else:
            notes.append(f"{label_a} kept ahead of {label_b}: {v.get('explanation','')}")
    return group + ranked[top:], notes
