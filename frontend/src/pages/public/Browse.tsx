import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import JobCard from "@/components/job/JobCard";
import { EmptyState, ErrorBox, PageTitle, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function Browse() {
  const [q, setQ] = useState("");
  const jobs = useQuery({ queryKey: ["jobs", q], queryFn: () => api.get<Job[]>(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`) });

  return (
    <>
      <PageTitle title="Open jobs" sub="Sign in as a candidate to get a personalised, ranked feed." />

      <div className="group relative mb-6 max-w-md">
        <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle transition-colors duration-300 group-focus-within:text-primary" />
        <input
          placeholder="Search by title or skill…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search jobs"
          className="w-full rounded-lg border border-border bg-surface/70 py-2 pl-10 pr-4 text-sm text-text outline-none backdrop-blur-xl transition duration-300 placeholder:text-subtle/70 hover:border-primary/40 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/15"
        />
      </div>

      {jobs.isLoading && <Spinner />}
      <ErrorBox error={jobs.error} />

      <div className="grid gap-4 md:grid-cols-2">{jobs.data?.map((j) => <JobCard key={j.id} job={j} />)}</div>

      {jobs.data?.length === 0 && (
        <EmptyState
          icon={q ? Search : Sparkles}
          title="No open jobs match"
          hint={q ? "Try a different title or skill." : "New roles appear here as soon as a company publishes them."}
        />
      )}
    </>
  );
}