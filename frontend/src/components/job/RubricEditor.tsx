import { Scale } from "lucide-react";
import { Badge, Field, Input, Select } from "@/components/ui";
import { parseSkills, weightsTotal } from "@/lib/format";
import type { Rubric, Weights } from "@/lib/types";

const W: [keyof Weights, string][] = [["skills", "Must-have skill coverage"], ["semantic", "Semantic similarity"], ["experience", "Experience fit"], ["education", "Education & certificates"], ["graph", "Skill-graph proximity"]];

export default function RubricEditor({ value, onChange }: { value: Rubric; onChange: (r: Rubric) => void }) {
  const total = weightsTotal(value.weights as unknown as Record<string, number>);
  const set = (p: Partial<Rubric>) => onChange({ ...value, ...p });
  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Must-have skills" hint="Comma-separated. Missing one makes a candidate not eligible (with a reason).">
          <Input defaultValue={value.must_have.map((m) => m.skill).join(", ")} onBlur={(e) => set({ must_have: parseSkills(e.target.value).map((skill) => ({ skill })) })} />
        </Field>
        <Field label="Nice-to-have skills">
          <Input defaultValue={value.nice_to_have.join(", ")} onBlur={(e) => set({ nice_to_have: parseSkills(e.target.value) })} />
        </Field>
        <Field label="Minimum years of experience">
          <Input type="number" min={0} step={0.5} value={value.min_years} onChange={(e) => set({ min_years: Number(e.target.value) })} />
        </Field>
        <Field label="Minimum education">
          <Select value={value.education.min_level} onChange={(e) => set({ education: { ...value.education, min_level: e.target.value } })}>
            {["none", "high_school", "diploma", "bachelor", "master", "phd"].map((l) => <option key={l} value={l}>{l.replace("_", " ")}</option>)}
          </Select>
        </Field>
        <Field label="Other requirements (one per line)">
          <textarea className="min-h-20 w-full rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm text-text outline-none backdrop-blur-md transition duration-300 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15" defaultValue={value.other_requirements.join("\n")}
            onBlur={(e) => set({ other_requirements: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
        </Field>
        <Field label="Shortlist size">
          <Input type="number" min={1} max={100} value={value.shortlist_size} onChange={(e) => set({ shortlist_size: Number(e.target.value) })} />
        </Field>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2.5 font-medium text-text">
            <span className="icon-tile-plain h-9 w-9"><Scale size={16} aria-hidden /></span>
            Scoring weights
          </h3>
          <Badge tone={Math.abs(total - 100) < 0.5 ? "good" : "bad"}>Total {total}/100</Badge>
        </div>
        <div className="space-y-4">
          {W.map(([k, label]) => (
            <div key={k} className="group grid grid-cols-1 items-center gap-2 text-sm sm:grid-cols-[12rem_1fr_3rem] sm:gap-3">
              <span className="text-text transition-colors duration-300 group-hover:text-primary">{label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={value.weights[k]}
                aria-label={label}
                onChange={(e) => set({ weights: { ...value.weights, [k]: Number(e.target.value) } })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[rgb(var(--grad-a))]"
              />
              <span className="text-right font-medium tabular-nums text-text">{value.weights[k]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Hard filter: location (optional)">
          <Input defaultValue={value.hard_filters.location ?? ""} onBlur={(e) => set({ hard_filters: { ...value.hard_filters, location: e.target.value.trim() || null } })} />
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={value.hard_filters.work_authorization_required}
            onChange={(e) => set({ hard_filters: { ...value.hard_filters, work_authorization_required: e.target.checked } })} />
          Require confirmed work authorization
        </label>
      </div>
    </div>
  );
}
