"""Shortlist PDF report (reportlab). Shortlisted candidates' details are delivered to the company here."""
import io
from xml.sax.saxutils import escape


def build_report(job: dict, items: list[dict], comparison_notes: list[str]) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title=f"Shortlist - {job['title']}")
    st = getSampleStyleSheet()
    P = lambda t, s="BodyText": Paragraph(escape(str(t)), st[s])
    out = [P(f"Shortlist: {job['title']}", "Title"),
           P("Automated ranking supports the hiring decision; it does not replace it. Reasoning traces are available in the app.")]
    for it in items:
        out += [Spacer(1, 10), P(f"#{it['rank']}  {it['name']}  -  score {it['score']}  (confidence {it['confidence']})", "Heading3"),
                P(f"Contact: {it['email']}"), P(it["reasoning"]),
                P("Strengths: " + "; ".join(it["strengths"]) if it["strengths"] else "Strengths: -"),
                P("Gaps: " + "; ".join(it["gaps"]) if it["gaps"] else "Gaps: -")]
        if it.get("risk_flags"):
            out.append(P("Risk flags: " + "; ".join(it["risk_flags"])))
    if comparison_notes:
        out += [Spacer(1, 14), P("Head-to-head comparison", "Heading2")] + [P(n) for n in comparison_notes]
    doc.build(out)
    return buf.getvalue()
