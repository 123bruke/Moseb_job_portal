"""RAG chatbot. Candidates: career help over the knowledge base + own profile.
Companies: ask about the anonymous candidates of one job (never identity)."""
from app.ml import llm
from app.prompts import render
from app.repositories import chroma_repo, pg


def _hist(history: list[dict]) -> str:
    return "\n".join(f"{h['role']}: {h['content'][:600]}" for h in history[-6:])


def candidate_chat(user_id: str, question: str, history: list[dict]) -> str:
    prof = pg.one("select headline, years_experience, domain, education_level, skills from candidate_profiles where profile_id=%s", (user_id,))
    hits = chroma_repo.query(chroma_repo.KNOWLEDGE, question, None, 5)
    ctx = "\n".join(f"- [{h['metadata'].get('domain','')}] {h['text'][:400]}" for h in hits)
    return llm.generate(render("chat_candidate", profile=str(prof), context=ctx or "(none)", history=_hist(history), question=question),
                        temperature=0.3)


def company_chat(job: dict, question: str, history: list[dict]) -> str:
    apps = pg.all_("select id from applications where job_id=%s and status in ('processed','shortlisted','not_selected') order by created_at", (job["id"],))
    label = {str(a["id"]): f"Candidate {i}" for i, a in enumerate(apps, 1)}
    hits = chroma_repo.query(chroma_repo.RESUMES, question, {"job_id": str(job["id"])}, 12)
    ctx = "\n".join(f"- {label.get(h['metadata']['application_id'], 'Candidate ?')}: {h['text'][:300]}" for h in hits)
    return llm.generate(render("chat_company", rubric=str(job["rubric_json"])[:2500], context=ctx or "(no evidence)",
                               history=_hist(history), question=question), temperature=0.2)
