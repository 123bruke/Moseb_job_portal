"""Close-and-rank: hard filters -> hybrid score -> agent reasoning -> pairwise refinement -> shortlist -> delivery."""
import logging
from datetime import datetime, timezone

from app.agents.common import Deps
from app.agents.compare_agent import pairwise_refine
from app.agents.graph import run_candidate
from app.ml import llm
from app.repositories import chroma_repo, neo4j_repo, pg, storage_repo
from app.services import bias, report, scoring
from app.services.skills_repo import alias_index

log = logging.getLogger(__name__)


def _deps(application_id: str, idx: dict[str, str]) -> Deps:
    return Deps(
        retrieve=lambda q, n: chroma_repo.query(chroma_repo.RESUMES, q, {"application_id": application_id}, n),
        related=lambda a, b: neo4j_repo.related_weights(a, b),
        llm_json=llm.generate_json if llm.enabled() else None,
        alias_index=idx)


def score_application(app: dict, rubric: dict, idx: dict[str, str]) -> dict:
    parsed = pg.one("select * from parsed_resumes where application_id=%s", (app["id"],))
    if not parsed:
        raise ValueError("resume not parsed")
    state = {"rubric": rubric, "resume": bias.sanitize_resume(parsed["structured_json"]),
             "total_years": float(parsed["total_years"]), "parse_confidence": float(parsed["parse_confidence"]),
             "application": {"form_answers_json": app["form_answers_json"]}}
    out = run_candidate(state, _deps(str(app["id"]), idx))
    return {"application_id": str(app["id"]), "candidate_id": str(app["candidate_id"]), "total": out["score"]["total"],
            "eligible": out["score"]["eligible"], "score": out["score"], "verification": out["verification"],
            "explanation": out["explanation"], "confidence": out["confidence"], "trace": out["trace"],
            "flags": out.get("flags", [])}


def rank_job(job_id: str) -> None:
    job = pg.one("select * from jobs where id=%s", (job_id,))
    if not job or job["status"] == "ranked":
        return
    rubric = job["rubric_json"]
    idx = alias_index()
    apps = pg.all_("select * from applications where job_id=%s and status in ('processed','failed')", (job_id,))
    scored: list[dict] = []
    for a in apps:
        if a["status"] == "failed":
            continue
        try:
            scored.append(score_application(a, rubric, idx))
        except Exception:
            log.exception("scoring failed for one application")
            pg.run("update applications set status='failed', error='scoring failed' where id=%s", (a["id"],))

    ordered = scoring.rank_candidates([{**s, "application_id": s["application_id"]} for s in scored])
    eligible = [s for s in ordered if s["eligible"]]
    ineligible = [s for s in ordered if not s["eligible"]]
    eligible, notes = pairwise_refine(eligible, rubric, llm.generate_json if llm.enabled() else None)
    for i, s in enumerate(eligible, 1):
        s["rank"] = i
    n = int(rubric.get("shortlist_size") or max(5, 2 * job["seats"]))
    shortlist = eligible[:n]
    short_ids = {s["application_id"] for s in shortlist}

    now = datetime.now(timezone.utc)
    with pg.tx() as c:
        for s in eligible + ineligible:
            c.execute("""insert into scores (application_id,total,breakdown_json,eligible,ineligible_reasons,rank,confidence)
                         values (%s,%s,%s,%s,%s,%s,%s)
                         on conflict (application_id) do update set total=excluded.total, breakdown_json=excluded.breakdown_json,
                         eligible=excluded.eligible, ineligible_reasons=excluded.ineligible_reasons, rank=excluded.rank, confidence=excluded.confidence""",
                      (s["application_id"], s["total"],
                       pg.json({**{k: s["score"][k] for k in ("signals", "weights", "contributions")},
                                "verification": s["verification"], "explanation": s["explanation"], "flags": s["flags"]}),
                       s["eligible"], s["score"]["ineligible_reasons"], s.get("rank"), s["confidence"]))
            c.execute("delete from reasoning_traces where application_id=%s", (s["application_id"],))
            for t in s["trace"]:
                c.execute("insert into reasoning_traces (application_id, step, name, content, evidence_refs) values (%s,%s,%s,%s,%s)",
                          (s["application_id"], t["step"], t["name"], t["content"], pg.json(t["evidence_refs"])))
            if s.get("rank"):
                c.execute("insert into reasoning_traces (application_id, step, name, content) values (%s,5,'Compare against others',%s)",
                          (s["application_id"], next((x for x in notes if x.startswith(f"#{s['rank']} ")), f"Ranked #{s['rank']} by weighted score.")))
            c.execute("update applications set status=%s, decided_at=%s where id=%s",
                      ("shortlisted" if s["application_id"] in short_ids else "not_selected", now, s["application_id"]))

    # --- delivery: report + shortlist rows + notifications
    items = []
    for s in shortlist:
        prof = pg.one("select p.full_name, p.email from applications a join profiles p on p.id=a.candidate_id where a.id=%s", (s["application_id"],))
        e = s["explanation"]
        items.append({"rank": s["rank"], "name": prof["full_name"], "email": prof["email"], "score": s["total"], "confidence": s["confidence"],
                      "reasoning": e["reasoning"], "strengths": e["strengths"], "gaps": e["gaps"], "risk_flags": e["risk_flags"],
                      "application_id": s["application_id"]})
    pdf = report.build_report(job, items, notes)
    path = f"reports/{job_id}.pdf"
    storage_repo.upload(path, pdf, "application/pdf")
    sl = pg.one("insert into shortlists (job_id, report_path, comparison_text, delivered_at) values (%s,%s,%s,now()) returning id",
                (job_id, path, "\n".join(notes)))
    for it in items:
        pg.run("insert into shortlist_items (shortlist_id, application_id, rank, summary) values (%s,%s,%s,%s)",
               (sl["id"], it["application_id"], it["rank"], it["reasoning"]))
    pg.run("update jobs set status='ranked' where id=%s", (job_id,))
    neo4j_repo.close_job(job_id)

    company = pg.one("select owner_profile_id from companies where id=%s", (job["company_id"],))
    pg.notify(str(company["owner_profile_id"]), "shortlist_ready", {"job_id": job_id, "title": job["title"], "count": len(items)})
    for s in eligible + ineligible:
        sel = s["application_id"] in short_ids
        pg.notify(s["candidate_id"], "application_decision",
                  {"job_id": job_id, "title": job["title"], "selected": sel, "application_id": s["application_id"]})
    pg.audit(None, "rank_job", "job", job_id, {"applicants": len(scored), "shortlisted": len(items)})


def apply_override(job_id: str, actor: str, application_id: str, new_rank: int, reason: str) -> None:
    """Company override: move one shortlisted application to `new_rank`; renumber; log in audit."""
    sl = pg.one("select id from shortlists where job_id=%s order by generated_at desc limit 1", (job_id,))
    rows = pg.all_("select application_id, rank from shortlist_items where shortlist_id=%s order by rank", (sl["id"],))
    ids = [str(r["application_id"]) for r in rows]
    if application_id not in ids:
        raise ValueError("application is not on the shortlist")
    old = ids.index(application_id) + 1
    ids.remove(application_id)
    ids.insert(max(0, min(new_rank, len(ids) + 1) - 1), application_id)
    with pg.tx() as c:
        for i, a in enumerate(ids, 1):
            c.execute("update shortlist_items set rank=%s where shortlist_id=%s and application_id=%s", (i, sl["id"], a))
            c.execute("update scores set rank=%s where application_id=%s", (i, a))
    pg.audit(actor, "override_rank", "application", application_id, {"job_id": job_id, "from": old, "to": new_rank, "reason": reason})
