import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Briefcase } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import { EmptyState, PageTitle, Select } from "@/components/ui";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function CompanyChat() {
  const jobs = useQuery({ queryKey: ["my-jobs"], queryFn: () => api.get<Job[]>("/jobs/mine") });
  const [job, setJob] = useState("");

  return (
    <>
      <PageTitle title="Ask about your candidates" sub="Answers use anonymous candidate evidence only." />
      <div className="mb-4 max-w-md">
        <Select value={job} onChange={(e) => setJob(e.target.value)} aria-label="Choose a job">
          <option value="">Choose a job…</option>
          {jobs.data?.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </Select>
      </div>
      {job ? (
        <Chatbot key={job} jobId={job} placeholder="e.g. Which candidates have production FastAPI experience?" />
      ) : (
        <EmptyState icon={Briefcase} title="Pick a job to start" hint="Questions are answered from that role's anonymous candidate evidence." />
      )}
    </>
  );
}