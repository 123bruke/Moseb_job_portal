import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import { Button, Card, ErrorBox, Field, Input, PageTitle, SavedFlag } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

interface Co { name: string; industry?: string; website?: string; size?: string; logo_url?: string; brand_color: string }

export default function CompanyProfile() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["company"], queryFn: () => api.get<Co>("/companies/me"), retry: false });
  const exists = !!q.data;
  const [f, setF] = useState<Co>({ name: "", brand_color: "#4f46e5" });
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (q.data) setF(q.data); }, [q.data]);
  const save = useMutation({
    mutationFn: () => (exists ? api.patch("/companies/me", f) : api.post("/companies", f)),
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ["company"] }); },
  });
  const set = (k: keyof Co) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const err = q.error instanceof ApiError && q.error.status === 404 ? null : q.error;
  return (
    <>
      <PageTitle title="Company profile" sub="Your brand colour and logo appear on your job pages." />
      <Card glass className="group grid max-w-3xl gap-4 md:grid-cols-2">
        <Field label="Company name"><Input value={f.name} onChange={set("name")} /></Field>
        <Field label="Industry"><Input value={f.industry ?? ""} onChange={set("industry")} /></Field>
        <Field label="Website"><Input value={f.website ?? ""} onChange={set("website")} /></Field>
        <Field label="Size"><Input value={f.size ?? ""} onChange={set("size")} /></Field>
        <Field label="Logo URL"><Input value={f.logo_url ?? ""} onChange={set("logo_url")} /></Field>
        <Field label="Brand colour"><Input type="color" value={f.brand_color} onChange={set("brand_color")} className="h-10 p-1" /></Field>
        <div className="md:col-span-2 flex items-center gap-3">
          <Button icon={exists ? Save : Building2} onClick={() => save.mutate()} disabled={save.isPending || f.name.length < 2}>
            {exists ? "Save" : "Create company"}
          </Button>
          <SavedFlag show={saved} />
        </div>
        <div className="md:col-span-2"><ErrorBox error={save.error ?? err} /></div>
      </Card>
    </>
  );
}
