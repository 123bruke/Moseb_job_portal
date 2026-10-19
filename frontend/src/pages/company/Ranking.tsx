import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { BrainCircuit, CheckCircle2, GitCompareArrows, XCircle } from "lucide-react";
import CandidateCompareTable from "@/components/ranking/CandidateCompareTable";
import { ReasoningTimeline, RequirementTable } from "@/components/reasoning/ReasoningTimeline";
import { Badge, Button, Card, ErrorBox, PageTitle, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import type { RankRow, Trace } from "@/lib/types";

/** Ranking & comparison view + reasoning panel. */
export default function Ranking() {
  const { id } = useParams();
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["ranking", id], queryFn: () => api.get<RankRow[]>(`/jobs/${id}/ranking`) });
  const trace = useQuery({ queryKey: ["trace", open], enabled: !!open, queryFn: () => api.get<Trace[]>(`/applications/${open}/reasoning`) });
  const toggle = (a: string) => setSel((s) => (s.includes(a) ? s.filter((x) => x !== a) : s.length < 4 ? [...s, a] : s));
  const openRow = q.data?.find((r) => r.application_id === open);

  return (
    <>
      <PageTitle title="Ranking & comparison" sub="Select up to 4 candidates to compare. Click a name to see the full reasoning." />
      {q.isLoading && <Spinner />}<ErrorBox error={q.error} />

      <Card glass className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-subtle">
            <tr><th className="px-3 py-2" /><th className="px-3 py-2">#</th><th className="px-3 py-2">Candidate</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Confidence</th><th className="px-3 py-2">Eligibility</th></tr>
          </thead>
          <tbody>
            {q.data?.map((r) => (
              <tr key={r.application_id} className="group border-t border-border/60 transition duration-300 hover:bg-muted/40">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={`compare ${r.label}`}
                    checked={sel.includes(r.application_id)}
                    onChange={() => toggle(r.application_id)}
                    className="h-4 w-4 cursor-pointer accent-[rgb(var(--grad-a))] transition duration-200"
                  />
                </td>
                <td className="px-3 py-2 tabular-nums text-subtle">{r.rank ?? "—"}</td>
                <td className="px-3 py-2">
                  <Button variant="ghost" className="px-1" onClick={() => setOpen(r.application_id)}>{r.label}</Button>
                </td>
                <td className="px-3 py-2 font-semibold tabular-nums text-text">{r.total}</td>
                <td className="px-3 py-2 tabular-nums text-subtle">{Math.round(r.confidence * 100)}%</td>
                <td className="px-3 py-2">
                  {r.eligible ? (
                    <Badge tone="good" icon={CheckCircle2}>Eligible</Badge>
                  ) : (
                    <span title={r.ineligible_reasons.join("; ")} className="inline-flex items-center gap-2">
                      <Badge tone="bad" icon={XCircle}>Not eligible</Badge>
                      <span className="text-xs text-subtle">{r.ineligible_reasons[0]}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card glass className="mb-6">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="icon-tile-plain h-9 w-9"><GitCompareArrows size={16} aria-hidden /></span>
          <h2 className="font-semibold text-text">Compare</h2>
        </div>
        <CandidateCompareTable rows={(q.data ?? []).filter((r) => sel.includes(r.application_id))} />
      </Card>

      {open && openRow && (
        <Card glass className="animate-fade-up space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 font-semibold text-text">
              <span className="icon-tile-plain h-9 w-9"><BrainCircuit size={16} aria-hidden /></span>
              Reasoning · {openRow.label}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>Close</Button>
          </div>
          <p className="rounded-lg border border-border/60 bg-surface/50 p-4 text-sm leading-relaxed text-text">
            {openRow.breakdown_json.explanation.reasoning}
          </p>
          <RequirementTable rows={openRow.breakdown_json.verification} />
          {trace.isLoading ? <Spinner /> : <ReasoningTimeline steps={trace.data ?? []} />}
        </Card>
      )}
    </>
  );
}