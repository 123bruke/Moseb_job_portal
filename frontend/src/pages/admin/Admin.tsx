import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ScrollText, ShieldCheck, Sparkles, UserCog } from "lucide-react";
import { Badge, Card, ErrorBox, PageTitle, Select, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/format";

export function Users() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-users"], queryFn: () => api.get<{ id: string; role: string; full_name: string; email: string; created_at: string }[]>("/admin/users") });
  const set = useMutation({
    mutationFn: (v: { id: string; role: string }) => api.post(`/admin/users/${v.id}/role`, { role: v.role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <>
      <PageTitle title="Users" sub="Change a role and it takes effect on their next request." />
      {q.isLoading && <Spinner />}<ErrorBox error={q.error ?? set.error} />
      <Card glass className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-subtle">
            <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Joined</th></tr>
          </thead>
          <tbody>
            {q.data?.map((u) => (
              <tr key={u.id} className="group border-t border-border/60 transition duration-300 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium text-text">
                    <span className="icon-tile-plain h-7 w-7"><UserCog size={13} aria-hidden /></span>
                    {u.full_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-subtle">{u.email}</td>
                <td className="px-4 py-3">
                  <Select
                    value={u.role}
                    onChange={(e) => set.mutate({ id: u.id, role: e.target.value })}
                    className="w-32"
                    aria-label={`Role for ${u.full_name}`}
                  >
                    <option value="candidate">candidate</option>
                    <option value="company">company</option>
                    <option value="admin">admin</option>
                  </Select>
                </td>
                <td className="px-4 py-3 tabular-nums text-subtle">{shortDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

interface QueueInfo {
  queues: Record<string, { queued: number; failed: number }>;
  gemini_calls_today: number;
  jobs: { status: string; n: number }[];
  applications: { status: string; n: number }[];
}

export function Queue() {
  const q = useQuery({ queryKey: ["admin-queue"], queryFn: () => api.get<QueueInfo>("/admin/jobs-queue"), refetchInterval: 5000 });
  if (q.isLoading) return <Spinner />;
  const d = q.data;

  return (
    <>
      <PageTitle title="Queues & model usage" sub="Refreshes every 5 seconds." />
      <ErrorBox error={q.error} />
      <div className="grid gap-4 md:grid-cols-3">
        {d && Object.entries(d.queues).map(([n, v]) => (
          <Card key={n} hover className="group">
            <div className="flex items-center gap-2.5">
              <span className="icon-tile" style={{ width: 38, height: 38 }}><Activity size={18} strokeWidth={2} aria-hidden /></span>
              <p className="text-sm text-subtle">{n} queue</p>
            </div>
            <p className="mt-4 text-3xl font-semibold tabular-nums text-text transition-transform duration-300 group-hover:scale-105">{v.queued}</p>
            <p className="text-xs text-bad">{v.failed} failed</p>
          </Card>
        ))}
        <Card hover className="group">
          <div className="flex items-center gap-2.5">
            <span className="icon-tile" style={{ width: 38, height: 38 }}><Sparkles size={18} strokeWidth={2} aria-hidden /></span>
            <p className="text-sm text-subtle">Gemini calls today</p>
          </div>
          <p className="mt-4 text-3xl font-semibold tabular-nums text-text transition-transform duration-300 group-hover:scale-105">{d?.gemini_calls_today}</p>
          <p className="text-xs text-subtle">daily cap applies</p>
        </Card>
        <Card hover className="group">
          <div className="flex items-center gap-2.5">
            <span className="icon-tile" style={{ width: 38, height: 38 }}><ShieldCheck size={18} strokeWidth={2} aria-hidden /></span>
            <p className="text-sm text-subtle">Entities</p>
          </div>
          {d?.jobs.map((j) => (
            <p key={j.status} className="mt-2 flex items-center justify-between text-sm text-text">
              <Badge tone="neutral">jobs · {j.status}</Badge><span className="tabular-nums">{j.n}</span>
            </p>
          ))}
          {d?.applications.map((a) => (
            <p key={a.status} className="mt-2 flex items-center justify-between text-sm text-text">
              <Badge tone="neutral">apps · {a.status}</Badge><span className="tabular-nums">{a.n}</span>
            </p>
          ))}
        </Card>
      </div>
    </>
  );
}

export function Audit() {
  const q = useQuery({ queryKey: ["audit"], queryFn: () => api.get<{ id: number; actor?: string; action: string; entity: string; entity_id?: string; at: string }[]>("/admin/audit") });
  return (
    <>
      <PageTitle title="Audit log" sub="Every shortlist override, role change and deletion." />
      {q.isLoading && <Spinner />}<ErrorBox error={q.error} />
      <Card glass className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-subtle">
            <tr><th className="px-4 py-2">When</th><th className="px-4 py-2">Action</th><th className="px-4 py-2">Entity</th><th className="px-4 py-2">Actor</th></tr>
          </thead>
          <tbody>
            {q.data?.map((a) => (
              <tr key={a.id} className="group border-t border-border/60 transition duration-300 hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-subtle">{new Date(a.at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium text-text">
                    <span className="icon-tile-plain h-7 w-7"><ScrollText size={13} aria-hidden /></span>
                    {a.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-subtle">{a.entity} {a.entity_id?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-subtle">{a.actor?.slice(0, 8) ?? "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}