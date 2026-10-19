import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import JobCard from "@/components/job/JobCard";
import { EmptyState, ErrorBox, PageTitle, Spinner, Button } from "@/components/ui";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function Feed() {
  const q = useQuery({ queryKey: ["feed"], queryFn: () => api.get<Job[]>("/candidates/feed") });
  return (
    <>
      <PageTitle title="Your job feed" sub="Ranked by skill overlap, semantic fit and experience." />
      {q.isLoading && <Spinner />}<ErrorBox error={q.error} />
      <div className="grid gap-4 md:grid-cols-2">{q.data?.map((j) => <JobCard key={j.id} job={j} />)}</div>
      {q.data?.length === 0 && (
        <EmptyState
          icon={Compass}
          title="No matches yet"
          hint="Add more skills to your profile and the feed will rank itself."
          action={<Link to="/candidate/profile" className="mt-1"><Button variant="outline">Edit profile</Button></Link>}
        />
      )}
    </>
  );
}