import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, Trash2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/app/auth";
import { Button, Card, ErrorBox, Field, Input, PageTitle, SavedFlag, Select, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { parseSkills } from "@/lib/format";

interface Prof { headline?: string; years_experience: number; domain?: string; education_level?: string; languages: string[]; expected_salary?: number; skills: string[] }

export default function Profile() {
  const { me, signOut } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["cand-profile"], queryFn: () => api.get<Prof>("/candidates/profile") });
  const [f, setF] = useState<Prof>({ years_experience: 0, languages: [], skills: [] });
  const [skills, setSkills] = useState(""), [langs, setLangs] = useState(""), [saved, setSaved] = useState(false);
  useEffect(() => { if (q.data) { setF(q.data); setSkills(q.data.skills.join(", ")); setLangs(q.data.languages.join(", ")); } }, [q.data]);
  const save = useMutation({
    mutationFn: () => api.put("/candidates/profile", { ...f, skills: parseSkills(skills), languages: parseSkills(langs), expected_salary: f.expected_salary || null, education_level: f.education_level || null }),
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ["feed"] }); qc.invalidateQueries({ queryKey: ["cand-profile"] }); },
  });
  const del = useMutation({ mutationFn: () => api.del("/me"), onSuccess: signOut });
  if (q.isLoading) return <Spinner />;
  return (
    <>
      <PageTitle title="Your profile" sub={`${me?.full_name} · ${me?.email}`} />
      <Card glass className="grid gap-4 md:grid-cols-2">
        <Field label="Headline"><Input value={f.headline ?? ""} onChange={(e) => setF({ ...f, headline: e.target.value })} /></Field>
        <Field label="Years of experience"><Input type="number" min={0} step={0.5} value={f.years_experience} onChange={(e) => setF({ ...f, years_experience: Number(e.target.value) })} /></Field>
        <Field label="Domain"><Select value={f.domain ?? ""} onChange={(e) => setF({ ...f, domain: e.target.value })}><option value="">—</option>{["IT", "engineering", "medicine", "accounting", "business", "design", "other"].map((d) => <option key={d}>{d}</option>)}</Select></Field>
        <Field label="Education level"><Select value={f.education_level ?? ""} onChange={(e) => setF({ ...f, education_level: e.target.value })}><option value="">—</option>{["high_school", "diploma", "bachelor", "master", "phd"].map((d) => <option key={d} value={d}>{d.replace("_", " ")}</option>)}</Select></Field>
        <div className="md:col-span-2"><Field label="Skills" hint="Comma-separated. Aliases are normalised (JS → JavaScript)."><Input value={skills} onChange={(e) => setSkills(e.target.value)} /></Field></div>
        <Field label="Languages"><Input value={langs} onChange={(e) => setLangs(e.target.value)} /></Field>
        <Field label="Expected salary (optional)"><Input type="number" min={0} value={f.expected_salary ?? ""} onChange={(e) => setF({ ...f, expected_salary: Number(e.target.value) })} /></Field>
        <div className="md:col-span-2 flex items-center gap-3">
          <Button icon={Save} onClick={() => save.mutate()} disabled={save.isPending}>Save profile</Button>
          <SavedFlag show={saved && !save.isPending} />
        </div>
        <div className="md:col-span-2"><ErrorBox error={save.error} /></div>
      </Card>
      <Card className="group mt-6 border-bad/30 bg-bad/[0.04]">
        <div className="flex items-center gap-2.5">
          <span className="icon-tile-plain h-9 w-9 text-bad"><TriangleAlert size={16} aria-hidden /></span>
          <h2 className="font-semibold text-bad">Delete my account and data</h2>
        </div>
        <p className="my-3 text-sm text-subtle">Removes your profile, applications, resumes and graph data permanently.</p>
        <Button variant="danger" icon={Trash2} onClick={() => confirm("Delete everything? This cannot be undone.") && del.mutate()}>Delete my account</Button>
        <ErrorBox error={del.error} />
      </Card>
    </>
  );
}
