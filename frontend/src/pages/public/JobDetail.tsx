import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, LogIn, MapPin, Send, Users } from "lucide-react";
import { useAuth } from "@/app/auth";
import { brandStyle } from "@/components/job/JobCard";
import SkillGapChips from "@/components/resume/SkillGapChips";
import { Badge, Button, Card, ErrorBox, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/format";
import type { Job } from "@/lib/types";

const Meta = ({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 text-sm text-subtle">
    <Icon size={14} strokeWidth={2} aria-hidden className="opacity-70" />
    {children}
  </span>
);

export default function JobDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const job = useQuery({ queryKey: ["job", id], queryFn: () => api.get<Job>(`/jobs/${id}`) });
  const profile = useQuery({ queryKey: ["cand-profile"], queryFn: () => api.get<{ skills: string[] }>("/candidates/profile"), enabled: me?.role === "candidate" });

  useEffect(() => { if (me?.role === "candidate" && id) api.post("/candidates/events", { job_id: id, type: "view" }).catch(() => {}); }, [me, id]);

  if (job.isLoading) return <Spinner />;
  if (job.error || !job.data) return <ErrorBox error={job.error ?? new Error("Job not found")} />;

  const j = job.data, r = j.rubric_json;
  const mine = new Set((profile.data?.skills ?? []).map((s) => s.toLowerCase()));
  const must = r?.must_have.map((m) => m.skill) ?? [];

  return (
    <div style={brandStyle(j.brand_color)} className="mx-auto w-full max-w-3xl space-y-6">
      <header className="glass-strong group relative overflow-hidden p-7 animate-fade-up">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: "linear-gradient(90deg, transparent, rgb(var(--brand)), transparent)" }}
        />
        <Badge tone="brand" icon={Building2}>{j.company_name}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">{j.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {j.location && <Meta icon={MapPin}>{j.location}</Meta>}
          <Meta icon={Users}>{j.seats} seat{j.seats > 1 ? "s" : ""}</Meta>
          <Meta icon={CalendarClock}>closes {shortDate(j.deadline)}</Meta>
        </div>
      </header>

      <Card glass className="animate-fade-up">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{j.description}</p>
      </Card>

      {r && (
        <Card glass className="group animate-fade-up space-y-4">
          <h2 className="font-semibold text-text">Requirements</h2>
          <SkillGapChips have={must.filter((s) => mine.has(s.toLowerCase()))} missing={me?.role === "candidate" ? must.filter((s) => !mine.has(s.toLowerCase())) : must} />
          <div className="flex flex-wrap gap-2">
            {r.nice_to_have.map((s) => <Badge key={s} className="hover:-translate-y-0.5 hover:shadow-glow">{s} (nice)</Badge>)}
            <Badge tone="brand" className="hover:-translate-y-0.5 hover:shadow-glow">{r.min_years}+ years</Badge>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3 pb-6">
        {me?.role === "candidate" && j.status === "open" && (
          <Link to={`/candidate/apply/${j.id}`} className="group">
            <Button size="lg" icon={Send} className="group-hover:shadow-glow-lg">Apply now</Button>
          </Link>
        )}
        {me?.role === "company" && (
          <span className="inline-flex items-center gap-2 text-sm text-subtle">
            <ArrowRight size={15} aria-hidden /> This is your own listing — manage it from the company dashboard.
          </span>
        )}
        {!me && (
          <Link to="/login" className="group">
            <Button size="lg" icon={LogIn} className="group-hover:shadow-glow-lg">Sign in to apply</Button>
          </Link>
        )}
      </div>
    </div>
  );
}