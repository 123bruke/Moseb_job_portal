import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GitCompareArrows } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import type { RankRow } from "@/lib/types";

const KEYS = ["skills", "semantic", "experience", "education", "graph"] as const;
const SERIES = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

/** Side-by-side comparison of up to 4 selected candidates. */
export default function CandidateCompareTable({ rows }: { rows: RankRow[] }) {
  if (rows.length < 2) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title="Select two to four candidates"
        hint="Tick the checkboxes in the ranking table and the score breakdown will line up side by side."
      />
    );
  }

  const chart = KEYS.map((k) => ({ signal: k, ...Object.fromEntries(rows.map((r) => [r.label, r.breakdown_json.contributions[k]])) }));

  return (
    <div className="space-y-5">
      <div className="h-72 rounded-lg border border-border/50 bg-surface/40 p-3">
        <ResponsiveContainer>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
            <XAxis dataKey="signal" tick={{ fill: "rgb(var(--subtle))", fontSize: 12 }} />
            <YAxis tick={{ fill: "rgb(var(--subtle))", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgb(var(--muted))" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgb(var(--border))",
                background: "rgb(var(--surface) / .95)",
                backdropFilter: "blur(8px)",
                fontSize: 13,
              }}
            />
            {rows.map((r, i) => (
              <Bar key={r.application_id} dataKey={r.label} fill={SERIES[i % 4]} radius={[6, 6, 0, 0]} maxBarSize={46} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-subtle">
            <tr><th className="px-4 py-2" />{rows.map((r) => <th key={r.application_id} className="px-3 py-2">{r.label}</th>)}</tr>
          </thead>
          <tbody>
            <tr className="border-t border-border/60">
              <td className="px-4 py-3 font-medium text-text">Score</td>
              {rows.map((r) => (
                <td key={r.application_id} className="px-3 py-3">
                  <Badge tone="brand">{r.total}</Badge>
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/60">
              <td className="px-4 py-3 font-medium text-text">Recommendation</td>
              {rows.map((r) => <td key={r.application_id} className="px-3 py-3"><Badge>{r.breakdown_json.explanation.recommendation}</Badge></td>)}
            </tr>
            {([
              ["Strengths", (r: RankRow) => r.breakdown_json.explanation.strengths.join(", ")],
              ["Gaps", (r: RankRow) => r.breakdown_json.explanation.gaps.join(", ")],
              ["Risk flags", (r: RankRow) => r.breakdown_json.explanation.risk_flags.join("; ")],
            ] as const).map(([label, get]) => (
              <tr key={label} className="border-t border-border/60">
                <td className="px-4 py-3 align-top font-medium text-text">{label}</td>
                {rows.map((r) => <td key={r.application_id} className="px-3 py-3 align-top text-subtle">{get(r) || "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}