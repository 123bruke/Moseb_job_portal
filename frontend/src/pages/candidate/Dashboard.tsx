import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Compass, FileSearch, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/app/auth";
import JobCard from "@/components/job/JobCard";
import { Badge, Card, PageTitle, Spinner, statusTone } from "@/components/ui";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";
import type { AppRow, Job } from "@/lib/types";

export default function CandidateDashboard() {
  const { me } = useAuth();
  const apps = useQuery({ queryKey: ["my-apps"], queryFn: () => api.get<AppRow[]>("/candidates/applications") });
  const feed = useQuery({ queryKey: ["feed"], queryFn: () => api.get<Job[]>("/candidates/feed") });

  return (
    <>
      <PageTitle title={`Welcome, ${me?.full_name.split(" ")[0] ?? ""}`} sub="Your applications and best-matching jobs." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass className="group">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="icon-tile-plain h-9 w-9"><FileSearch size={16} aria-hidden /></span>
            <h2 className="font-semibold text-text">Recent applications</h2>
          </div>
          {apps.isLoading && <Spinner />}
          {apps.data?.slice(0, 5).map((a) => (
            <Link
              key={a.id}
              to={`/candidate/applications/${a.id}`}
              className="group/row flex items-center justify-between rounded-lg border-t border-border/60 py-2.5 no-underline transition duration-300 hover:bg-muted/40 hover:pl-2 first:border-0"
            >
              <span className="text-text">{a.title} <span className="text-subtle">· {a.company_name}</span></span>
              <Badge tone={statusTone(a.status)}>{humanize(a.status)}</Badge>
            </Link>
          ))}
          {apps.data?.length === 0 && (
            <p className="flex items-center gap-2 py-2 text-sm text-subtle">
              <UserRound size={15} aria-hidden /> No applications yet.
            </p>
          )}
        </Card>

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold text-text">
            <span className="icon-tile-plain h-8 w-8"><Sparkles size={15} aria-hidden /></span> Top matches
          </h2>
          {feed.isLoading && <Spinner />}
          {feed.data?.slice(0, 3).map((j) => <JobCard key={j.id} job={j} />)}
          {feed.data?.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-subtle">
              <Compass size={15} aria-hidden /> Add your skills in <Link to="/candidate/profile" className="font-medium">your profile</Link> to get a ranked feed.
            </p>
          )}
        </div>
      </div>
    </>
  );
}