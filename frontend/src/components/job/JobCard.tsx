import { Link } from "react-router-dom";
import { Briefcase, CalendarClock, MapPin, Sparkles, Users } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { shortDate } from "@/lib/format";
import type { Job } from "@/lib/types";

const hexToRgb = (h?: string) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h ?? "");
  return m ? `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}` : undefined;
};
/** Per-company brand colour: sets --brand for everything inside. */
export const brandStyle = (hex?: string) => ({ ["--brand" as string]: hexToRgb(hex) }) as React.CSSProperties;

const Chip = ({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon size={13} strokeWidth={2} aria-hidden className="opacity-70" />
    {children}
  </span>
);

export default function JobCard({ job, to }: { job: Job; to?: string }) {
  return (
    <Link to={to ?? `/jobs/${job.id}`} className="block no-underline">
      <Card hover className="group h-full overflow-hidden !p-0">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-2.5">
          <span className="icon-tile-plain h-8 w-8">
            <Briefcase size={15} strokeWidth={2.1} aria-hidden />
          </span>
          <p className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.12em] text-subtle">{job.company_name}</p>
          {job.match_score !== undefined && (
            <Badge tone="brand" icon={Sparkles} className="shrink-0">{Math.round(job.match_score)}% match</Badge>
          )}
        </div>

        <div style={brandStyle(job.brand_color)} className="relative p-5">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "linear-gradient(90deg, transparent, rgb(var(--brand)), transparent)" }}
          />
          <h3 className="text-lg font-semibold tracking-tight text-text transition-colors duration-300 group-hover:text-primary">
            {job.title}
          </h3>

          {job.explanation && (
            <p className="mt-2.5 rounded-lg border border-border/50 bg-surface/50 p-3 text-sm leading-relaxed text-text">
              {job.explanation}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-subtle">
            <Chip icon={Briefcase}>{job.min_experience}+ yrs</Chip>
            <Chip icon={Users}>{job.seats} seat{job.seats > 1 ? "s" : ""}</Chip>
            {job.location && <Chip icon={MapPin}>{job.location}</Chip>}
            <Chip icon={CalendarClock}>closes {shortDate(job.deadline)}</Chip>
          </div>
        </div>
      </Card>
    </Link>
  );
}