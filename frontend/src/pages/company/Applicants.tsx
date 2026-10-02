import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { GitCompareArrows, ListOrdered, Sparkles, Users } from "lucide-react";
import { Badge, Button, Card, ErrorBox, PageTitle, Spinner, statusTone } from "@/components/ui";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";

interface Row { id: string; label: string; status: string; total_years?: number; total?: number; rank?: number }

export default function Applicants() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["applicants", id], queryFn: () => api.get<Row[]>(`/jobs/${id}/applicants`), refetchInterval: 8000 });
  const rank = useMutation({ mutationFn: () => api.post(`/jobs/${id}/close-and-rank`), onSuccess: () => qc.invalidateQueries({ queryKey: ["applicants", id] }) });
  const pending = q.data?.filter((r) => ["submitted", "processing"].includes(r.status)).length ?? 0;

  return (
    <>
      <PageTitle
        title="Applicants"
        sub="Candidates stay anonymous until they are shortlisted."
        action={
          <div className="flex gap-2">
            <Link to={`/company/jobs/${id}/ranking`}><Button variant="outline" icon={GitCompareArrows}>Ranking &amp; compare</Button></Link>
            <Button icon={Sparkles} onClick={() => confirm("Close applications and rank now?") && rank.mutate()} disabled={rank.isPending}>Close &amp; rank</Button>
          </div>
        }
      />
      {pending > 0 && (
        <p className="mb-3 inline-flex items-center gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          <ListOrdered size={15} aria-hidden />
          {pending} resume(s) still being processed. Ranking will include only processed ones.
        </p>
      )}
      {q.isLoading && <Spinner />}<ErrorBox error={q.error ?? rank.error} />

      <Card glass className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-subtle">
            <tr><th className="px-4 py-2">Candidate</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Experience</th><th className="px-4 py-2">Score</th></tr>
          </thead>
          <tbody>
            {q.data?.map((r) => (
              <tr key={r.id} className="group border-t border-border/60 transition duration-300 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium text-text">
                    <span className="icon-tile-plain h-7 w-7"><Users size={13} aria-hidden /></span>
                    {r.label}
                  </span>
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{humanize(r.status)}</Badge></td>
                <td className="px-4 py-3 tabular-nums text-subtle">{r.total_years ?? "—"} yrs</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-text">{r.total ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}