import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge, type Tone } from "@/components/ui";
import type { Requirement, Trace } from "@/lib/types";

export function ReasoningTimeline({ steps }: { steps: Trace[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-7">
      {steps.map((s, i) => (
        <li key={i} className="group animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
          <span className="absolute -left-[1.65rem] flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-grad-a to-grad-c text-xs font-semibold text-white shadow-glow transition duration-300 group-hover:scale-110">
            {s.step}
          </span>
          <p className="font-medium text-text">{s.name}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-subtle">{s.content}</p>
        </li>
      ))}
    </ol>
  );
}

const STATUS: Record<Requirement["status"], { tone: Tone; Icon: typeof CheckCircle2 }> = {
  met: { tone: "good", Icon: CheckCircle2 },
  partial: { tone: "warn", Icon: AlertTriangle },
  missing: { tone: "bad", Icon: XCircle },
};

/** Per-requirement table: every "met" shows the resume quote that proves it. */
export function RequirementTable({ rows }: { rows: Requirement[] }) {
  return (
    <div className="glass overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-subtle">
          <tr><th className="px-4 py-2 pr-3">Requirement</th><th className="px-2 py-2 pr-3">Status</th><th className="px-4 py-2">Evidence</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const { tone, Icon } = STATUS[r.status];
            return (
              <tr key={i} className="group border-t border-border/60 align-top transition duration-300 hover:bg-muted/40">
                <td className="px-4 py-3 pr-3 text-text">
                  {r.requirement} {r.importance === "must" && <span className="text-xs text-subtle">(must)</span>}
                </td>
                <td className="px-2 py-3 pr-3"><Badge tone={tone} icon={Icon} className="capitalize">{r.status}</Badge></td>
                <td className="px-4 py-3 text-subtle">
                  {r.quote ? <q className="border-l-2 border-primary/40 pl-2 italic">{r.quote}</q> : <span className="italic">no quote provided</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}