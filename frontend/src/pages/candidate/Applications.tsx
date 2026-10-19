import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { FileSearch, Lightbulb, PartyPopper, Trash2 } from "lucide-react";
import SkillGapChips from "@/components/resume/SkillGapChips";
import { Badge, Button, Card, EmptyState, ErrorBox, PageTitle, Spinner, statusTone } from "@/components/ui";
import { api } from "@/lib/api";
import { humanize, shortDate } from "@/lib/format";
import type { AppRow } from "@/lib/types";

export function MyApplications() {
  const q = useQuery({ queryKey: ["my-apps"], queryFn: () => api.get<AppRow[]>("/candidates/applications") });
  return (
    <>
      <PageTitle title="My applications" />
      {q.isLoading && <Spinner />}<ErrorBox error={q.error} />
      <div className="space-y-3">
        {q.data?.map((a) => (
          <Link key={a.id} to={`/candidate/applications/${a.id}`} className="block no-underline">
            <Card hover className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text">{a.title}</p>
                <p className="text-sm text-subtle">{a.company_name} · applied {shortDate(a.created_at)}</p>
              </div>
              <Badge tone={statusTone(a.status)}>{humanize(a.status)}</Badge>
            </Card>
          </Link>
        ))}
      </div>
      {q.data?.length === 0 && (
        <EmptyState
          icon={FileSearch}
          title="No applications yet"
          hint="Apply to a role from your feed and its feedback will appear here."
          action={<Link to="/candidate/feed"><Button variant="outline" className="mt-1">Open job feed</Button></Link>}
        />
      )}
    </>
  );
}

interface Detail { id: string; job_title: string; status: string; error?: string; feedback?: { missing_skills: string[]; improvements: string[]; selected: boolean | null } }

/** Application status + AI feedback (missing skills, improvements). Polls while the resume is being processed. */
export function ApplicationFeedback() {
  const { id } = useParams();
  const q = useQuery({
    queryKey: ["app", id], queryFn: () => api.get<Detail>(`/applications/${id}`),
    refetchInterval: (query) => (["submitted", "processing"].includes(query.state.data?.status ?? "") ? 3000 : false),
  });
  if (q.isLoading) return <Spinner />;
  if (!q.data) return <ErrorBox error={q.error} />;
  const d = q.data;
  return (
    <>
      <PageTitle title={d.job_title} action={<Badge tone={statusTone(d.status)}>{humanize(d.status)}</Badge>} />
      {["submitted", "processing"].includes(d.status) && <Spinner label="Reading your resume…" />}
      {d.status === "failed" && <ErrorBox error={new Error(d.error ?? "We could not read your resume. Try another file.")} />}

      {d.feedback?.selected != null && (
        <Card glass className="group mb-4 flex items-start gap-4 border-good/30 bg-good/[0.06]">
          <span className="icon-tile" style={{ width: 42, height: 42, background: "linear-gradient(120deg, rgb(var(--grad-d)), rgb(var(--grad-a)))" }}>
            {d.feedback.selected ? <PartyPopper size={20} strokeWidth={2} aria-hidden /> : <Trash2 size={20} strokeWidth={2} aria-hidden />}
          </span>
          <p className="font-medium text-text">
            {d.feedback.selected
              ? "You were shortlisted. The company will contact you."
              : "You were not selected this time. Your resume will be deleted per our retention policy."}
          </p>
        </Card>
      )}

      {d.feedback && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card hover>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="icon-tile-plain h-9 w-9"><FileSearch size={16} aria-hidden /></span>
              <h2 className="font-semibold text-text">Skills to add or evidence</h2>
            </div>
            <SkillGapChips missing={d.feedback.missing_skills} />
          </Card>
          <Card hover>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="icon-tile-plain h-9 w-9"><Lightbulb size={16} aria-hidden /></span>
              <h2 className="font-semibold text-text">How to improve</h2>
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-subtle">
              {d.feedback.improvements.map((t, i) => <li key={i} className="transition-colors duration-300 hover:text-text">{t}</li>)}
              {d.feedback.improvements.length === 0 && <li className="list-none text-subtle">Feedback appears once the job is ranked.</li>}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}