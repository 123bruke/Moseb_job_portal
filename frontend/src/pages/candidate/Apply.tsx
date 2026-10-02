import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Send, ShieldCheck } from "lucide-react";
import ResumeUploader from "@/components/resume/ResumeUploader";
import { Button, Card, ErrorBox, Field, Input, PageTitle, Textarea } from "@/components/ui";
import { api } from "@/lib/api";

const check = "h-4 w-4 shrink-0 cursor-pointer rounded accent-[rgb(var(--grad-a))] transition duration-200";

export default function Apply() {
  const { id } = useParams();
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [a, setA] = useState({ location: "", willing_to_relocate: false, work_authorization: false, cover_note: "" });
  const [consent, setConsent] = useState(false);
  const apply = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("resume", file as File);
      fd.append("form_answers", JSON.stringify(a));
      fd.append("consent", String(consent));
      return api.upload<{ id: string }>(`/jobs/${id}/apply`, fd);
    },
    onSuccess: (r) => nav(`/candidate/applications/${r.id}`),
  });

  return (
    <>
      <PageTitle title="Apply" sub="Takes about a minute. You can delete your data afterwards at any time." />
      <Card glass className="max-w-2xl space-y-5">
        <Field label="Where are you based?">
          <span className="relative block">
            <MapPin size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <Input className="pl-9" value={a.location} onChange={(e) => setA({ ...a, location: e.target.value })} />
          </span>
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 bg-surface/40 p-3 text-sm text-text transition duration-300 hover:border-primary/40 hover:bg-surface">
          <input type="checkbox" className={check} checked={a.willing_to_relocate} onChange={(e) => setA({ ...a, willing_to_relocate: e.target.checked })} />
          Willing to relocate
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 bg-surface/40 p-3 text-sm text-text transition duration-300 hover:border-primary/40 hover:bg-surface">
          <input type="checkbox" className={check} checked={a.work_authorization} onChange={(e) => setA({ ...a, work_authorization: e.target.checked })} />
          I am authorized to work in the job's location
        </label>

        <Field label="Cover note (optional)">
          <Textarea maxLength={2000} value={a.cover_note} onChange={(e) => setA({ ...a, cover_note: e.target.value })} />
        </Field>

        <ResumeUploader onFile={setFile} progress={apply.isPending ? "uploading" : "idle"} />

        <label className="group flex cursor-pointer items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/[0.05] p-3 text-sm transition duration-300 hover:border-primary/50">
          <input type="checkbox" className={`${check} mt-0.5`} checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span className="text-subtle transition-colors duration-300 group-hover:text-text">
            I understand my resume is processed by AI and <strong className="text-text">deleted after the hiring decision</strong> if I am not selected.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button icon={Send} disabled={!file || !consent || apply.isPending} onClick={() => apply.mutate()}>
            {apply.isPending ? "Submitting…" : "Submit application"}
          </Button>
          <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
            <ShieldCheck size={14} aria-hidden /> Your name stays hidden until the company shortlists you.
          </span>
        </div>
        <ErrorBox error={apply.error} />
      </Card>
    </>
  );
}