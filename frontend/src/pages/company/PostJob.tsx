import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronRight, RefreshCw, Rocket, Save, Upload } from "lucide-react";
import RubricEditor from "@/components/job/RubricEditor";
import { Badge, Button, Card, ErrorBox, Field, Input, PageTitle, Select, Spinner, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { parseSkills } from "@/lib/format";
import type { Rubric } from "@/lib/types";

const STEPS = ["Details", "Requirement file", "Review rubric", "Publish"];

/** Post-job wizard: details → optional requirement file → human-in-the-loop rubric review → publish. */
export default function PostJob() {
  const params = useParams();
  const nav = useNavigate();
  const [step, setStep] = useState(params.id ? 2 : 0);
  const [jobId, setJobId] = useState<string | undefined>(params.id);
  const [f, setF] = useState({ title: "", description: "", domain: "IT", min_experience: 0, education_required: "bachelor", location: "", seats: 1, deadline: "", skills: "" });
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File | null>(null);

  const create = useMutation({
    mutationFn: () => api.post<{ id: string }>("/jobs", {
      ...f, deadline: f.deadline ? new Date(f.deadline).toISOString() : null, location: f.location || null,
      required_skills: parseSkills(f.skills), skills: undefined,
    }),
    onSuccess: (r) => { setJobId(r.id); setStep(1); },
  });
  const upload = useMutation({
    mutationFn: () => { const fd = new FormData(); fd.append("file", picked as File); return api.upload(`/jobs/${jobId}/requirements-file`, fd); },
    onSuccess: () => setStep(2),
  });
  const poll = useQuery({
    queryKey: ["rubric", jobId], enabled: !!jobId && step >= 2,
    queryFn: () => api.get<{ status: string; rubric: Rubric | null }>(`/jobs/${jobId}/rubric`),
    refetchInterval: (q) => (q.state.data?.status === "ready" || q.state.data?.status === "failed" ? false : 2500),
  });
  useEffect(() => { if (poll.data?.rubric && !rubric) setRubric(poll.data.rubric); }, [poll.data, rubric]);

  const saveRubric = useMutation({ mutationFn: () => api.patch(`/jobs/${jobId}/rubric`, rubric), onSuccess: () => setStep(3) });
  const publish = useMutation({ mutationFn: () => api.post(`/jobs/${jobId}/publish`), onSuccess: () => nav("/company") });
  const regen = useMutation({ mutationFn: () => api.post(`/jobs/${jobId}/rubric/regenerate`), onSuccess: () => { setRubric(null); poll.refetch(); } });

  const ok = f.title.length >= 3 && f.description.length >= 10;
  return (
    <>
      <PageTitle title="Post a job" sub="Details, then an AI-drafted rubric you approve before anything goes live." />
      <ol className="mb-6 flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <Badge tone={i === step ? "brand" : i < step ? "good" : "neutral"} icon={i < step ? Check : undefined}>
              {i + 1}. {s}
            </Badge>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-subtle/60" aria-hidden />}
          </li>
        ))}
      </ol>
      <Card glass className="max-w-3xl space-y-4">
        {step === 0 && (<>
          <Field label="Job title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Description"><Textarea className="min-h-40" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Required skills" hint="Comma-separated. The AI will propose a rubric from these and your description."><Input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} /></Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Min. experience (years)"><Input type="number" min={0} step={0.5} value={f.min_experience} onChange={(e) => setF({ ...f, min_experience: Number(e.target.value) })} /></Field>
            <Field label="Education"><Select value={f.education_required} onChange={(e) => setF({ ...f, education_required: e.target.value })}>{["none", "high_school", "diploma", "bachelor", "master", "phd"].map((l) => <option key={l} value={l}>{l.replace("_", " ")}</option>)}</Select></Field>
            <Field label="Domain"><Select value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })}>{["IT", "engineering", "medicine", "accounting", "business", "design", "other"].map((d) => <option key={d}>{d}</option>)}</Select></Field>
            <Field label="Location"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
            <Field label="Seats"><Input type="number" min={1} value={f.seats} onChange={(e) => setF({ ...f, seats: Number(e.target.value) })} /></Field>
            <Field label="Deadline"><Input type="datetime-local" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
          </div>
          <ErrorBox error={create.error} />
          <Button disabled={!ok || create.isPending} onClick={() => create.mutate()}>Continue</Button>
        </>)}

        {step === 1 && (<>
          <p className="text-sm text-subtle">Optional: upload a PDF, DOCX or TXT with extra requirements. The AI folds it into the rubric.</p>
          <input ref={file} type="file" accept=".pdf,.docx,.txt" onChange={(e) => setPicked(e.target.files?.[0] ?? null)} />
          <ErrorBox error={upload.error} />
          <div className="flex gap-2">
            <Button icon={Upload} disabled={!picked || upload.isPending} onClick={() => upload.mutate()}>Upload &amp; continue</Button>
            <Button variant="ghost" onClick={() => setStep(2)}>Skip</Button>
          </div>
        </>)}

        {step === 2 && (!rubric ? (
          poll.data?.status === "failed" ? <div className="space-y-3"><ErrorBox error={new Error("Rubric generation failed.")} /><Button icon={RefreshCw} onClick={() => regen.mutate()}>Try again</Button></div>
            : <Spinner label="AI is drafting your rubric…" />
        ) : (<>
          <p className="text-sm text-subtle">Review and edit. Nothing is published until you approve it in the next step.</p>
          <RubricEditor value={rubric} onChange={setRubric} />
          <ErrorBox error={saveRubric.error} />
          <div className="flex gap-2"><Button icon={Save} disabled={saveRubric.isPending} onClick={() => saveRubric.mutate()}>Save rubric</Button><Button variant="ghost" icon={RefreshCw} onClick={() => regen.mutate()}>Regenerate</Button></div>
        </>))}

        {step === 3 && (<>
          <p className="text-text">Ready to publish. Candidates will see the required skills and minimum experience, but never your weights or filters.</p>
          <ErrorBox error={publish.error} />
          <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button icon={Rocket} disabled={publish.isPending} onClick={() => publish.mutate()}>Publish job</Button></div>
        </>)}
      </Card>
    </>
  );
}
