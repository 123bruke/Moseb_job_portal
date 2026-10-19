import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Download, FileText, GitCompareArrows, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, ErrorBox, PageTitle, Spinner } from "@/components/ui";
import { api } from "@/lib/api";

interface Item { rank: number; summary: string; application_id: string; total: number; confidence: number; full_name: string; email: string; location?: string }
interface SL { generated_at: string; comparison?: string; report_url?: string; items: Item[] }

export default function Shortlist() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["shortlist", id], queryFn: () => api.get<SL>(`/jobs/${id}/shortlist`) });
  const override = useMutation({
    mutationFn: (v: { application_id: string; new_rank: number; reason: string }) => api.post(`/jobs/${id}/override`, v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shortlist", id] }),
  });
  const move = (it: Item, to: number) => {
    const reason = prompt(`Why move ${it.full_name} to #${to}? (logged in the audit trail)`);
    if (reason && reason.length >= 3) override.mutate({ application_id: it.application_id, new_rank: to, reason });
  };
  if (q.isLoading) return <Spinner />;
  const d = q.data;
  return (
    <>
      <PageTitle
        title="Shortlist"
        sub="Rankings support your decision; they don't make it. Overrides are logged."
        action={
          <div className="flex gap-2">
            {d?.report_url && (
              <a href={d.report_url} target="_blank" rel="noreferrer" className="no-underline">
                <Button icon={Download}>Download PDF report</Button>
              </a>
            )}
            <Link to={`/company/jobs/${id}/ranking`}><Button variant="outline" icon={GitCompareArrows}>Full ranking</Button></Link>
          </div>
        }
      />
      <ErrorBox error={q.error ?? override.error} />

      <div className="space-y-3">
        {d?.items.map((it, i) => (
          <Card key={it.application_id} hover className="group animate-fade-up" >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-grad-a to-grad-c text-sm font-bold text-white shadow-glow transition duration-300 group-hover:scale-110">
                  {it.rank}
                </span>
                <div>
                  <p className="font-medium text-text">{it.full_name}</p>
                  <p className="text-sm text-subtle">{it.email}{it.location ? ` · ${it.location}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="brand" className="hover:-translate-y-0.5">{it.total}</Badge>
                <Badge icon={ShieldCheck} className="hover:-translate-y-0.5">{Math.round(it.confidence * 100)}% confidence</Badge>
                <span className="ml-1 inline-flex overflow-hidden rounded-lg border border-border">
                  <button
                    disabled={it.rank === 1}
                    onClick={() => move(it, it.rank - 1)}
                    aria-label={`Move ${it.full_name} up`}
                    className="p-2 text-subtle transition duration-300 hover:bg-muted hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronUp size={16} aria-hidden />
                  </button>
                  <button
                    disabled={it.rank === d.items.length}
                    onClick={() => move(it, it.rank + 1)}
                    aria-label={`Move ${it.full_name} down`}
                    className="p-2 text-subtle transition duration-300 hover:bg-muted hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronDown size={16} aria-hidden />
                  </button>
                </span>
              </div>
            </div>
            <p className="mt-3 border-l-2 border-primary/30 pl-3 text-sm leading-relaxed text-subtle">{it.summary}</p>
            {i === 0 && <Badge tone="good" icon={ShieldCheck} className="mt-3">Top pick — identity now revealed</Badge>}
          </Card>
        ))}
      </div>

      {d?.comparison && (
        <Card glass className="mt-6">
          <div className="mb-2 flex items-center gap-2.5">
            <span className="icon-tile-plain h-9 w-9"><FileText size={16} aria-hidden /></span>
            <h2 className="font-semibold text-text">Head-to-head comparison</h2>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-subtle">{d.comparison}</p>
        </Card>
      )}
    </>
  );
}