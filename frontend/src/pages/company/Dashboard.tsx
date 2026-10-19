import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Briefcase, Building2, ClipboardList, Plus, Sparkles, Trophy, Users } from "lucide-react";
import { Badge, Button, Card, EmptyState, ErrorBox, PageTitle, Spinner, statusTone } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { humanize, shortDate } from "@/lib/format";
import type { Job } from "@/lib/types";

export default function CompanyDashboard() {
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ["my-jobs"], queryFn: () => api.get<Job[]>("/jobs/mine"), refetchInterval: 15000 });
  const company = useQuery({ queryKey: ["company"], queryFn: () => api.get("/companies/me"), retry: false });
  const rank = useMutation({ mutationFn: (id: string) => api.post(`/jobs/${id}/close-and-rank`), onSuccess: () => qc.invalidateQueries({ queryKey: ["my-jobs"] }) });
  const needsCompany = company.error instanceof ApiError && company.error.status === 404;

  return (
    <>
      <PageTitle title="Your jobs" action={<Link to="/company/jobs/new"><Button icon={Plus}>Post a job</Button></Link>} />

      {needsCompany && (
        <Card glass className="mb-4 flex items-center gap-3">
          <span className="icon-tile-plain h-9 w-9"><Building2 size={16} aria-hidden /></span>
          <p className="text-sm text-text">
            Create your <Link to="/company/profile" className="font-medium">company profile</Link> before posting a job.
          </p>
        </Card>
      )}
      {jobs.isLoading && <Spinner />}<ErrorBox error={jobs.error ?? rank.error} />

      <div className="space-y-3">
        {jobs.data?.map((j) => (
          <Card key={j.id} hover className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="icon-tile" style={{ width: 40, height: 40 }}><Briefcase size={19} strokeWidth={2} aria-hidden /></span>
              <div>
                <p className="font-medium text-text">{j.title}</p>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-subtle">
                  <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden />{j.applicants ?? 0} applicants</span>
                  <span>{j.seats} seat(s)</span>
                  <span>deadline {shortDate(j.deadline)}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(j.status)}>{humanize(j.status)}</Badge>
              {j.status === "draft" && <Link to={`/company/jobs/${j.id}/edit`}><Button variant="outline" size="sm" icon={ClipboardList}>Review rubric</Button></Link>}
              {["open", "closed"].includes(j.status) && <Link to={`/company/jobs/${j.id}/applicants`}><Button variant="outline" size="sm" icon={Users}>Applicants</Button></Link>}
              {j.status === "open" && <Button size="sm" icon={Sparkles} onClick={() => confirm("Close applications and rank everyone now?") && rank.mutate(j.id)}>Close &amp; rank</Button>}
              {j.status === "ranked" && <Link to={`/company/jobs/${j.id}/shortlist`}><Button size="sm" icon={Trophy}>Shortlist</Button></Link>}
            </div>
          </Card>
        ))}
      </div>

      {jobs.data?.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs yet"
          hint="Post your first role and the AI will draft a rubric for you to approve."
          action={<Link to="/company/jobs/new" className="mt-1"><Button icon={Plus}>Post a job</Button></Link>}
        />
      )}
    </>
  );
}