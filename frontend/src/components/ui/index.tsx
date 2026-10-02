import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, type LucideIcon } from "lucide-react";

const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

const BUTTON_VARIANTS = {
  primary: "bg-brand text-primary-fg shadow-glow hover:-translate-y-0.5 hover:shadow-glow-lg active:translate-y-0",
  outline: "border border-border bg-surface/60 text-text backdrop-blur-md hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface",
  ghost: "text-subtle hover:bg-muted hover:text-text",
  danger: "bg-bad text-white shadow-glow hover:-translate-y-0.5",
  subtle: "bg-muted text-text hover:bg-muted/70 hover:-translate-y-0.5",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_VARIANTS; size?: "sm" | "md" | "lg"; icon?: LucideIcon }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      {...p}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-300 ease-out",
        "disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        BUTTON_VARIANTS[variant],
        className,
      )}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.1} aria-hidden className="transition-transform duration-300 group-hover:scale-110" />}
      {p.children}
    </button>
  );
}

export const Card = ({ children, className, glass = false, hover = false }: { children: ReactNode; className?: string; glass?: boolean; hover?: boolean }) => (
  <div className={cx(glass ? "glass" : "rounded-xl border border-border/70 bg-surface/70 shadow-sm backdrop-blur-xl", hover && "group ring-gradient hover-lift", className)}>
    {children}
  </div>
);

const field =
  "w-full rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm text-text outline-none backdrop-blur-md transition duration-300 placeholder:text-subtle/70 hover:border-primary/40 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/15";
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(field, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cx(field, "min-h-24", p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(field, p.className)} />;

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="text-sm font-medium text-text">{label}</span>
    {children}
    {hint && <span className="block text-xs leading-relaxed text-subtle">{hint}</span>}
  </label>
);

const TONES = {
  neutral: "bg-muted/80 text-text border-border/60",
  good: "bg-good/12 text-good border-good/25",
  warn: "bg-warn/12 text-warn border-warn/25",
  bad: "bg-bad/12 text-bad border-bad/25",
  brand: "bg-brand/12 text-primary border-primary/25",
} as const;

export type Tone = keyof typeof TONES;

export const Badge = ({ children, tone = "neutral", icon: Icon, className }: { children: ReactNode; tone?: Tone; icon?: LucideIcon; className?: string }) => (
  <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition duration-300", TONES[tone], className)}>
    {Icon && <Icon size={13} strokeWidth={2.4} aria-hidden />}
    {children}
  </span>
);

export const Spinner = ({ label = "Loading" }: { label?: string }) => (
  <div className="flex items-center gap-2.5 p-6 text-sm text-subtle" role="status">
    <Loader2 size={17} className="animate-spin text-primary" aria-hidden />
    {label}
  </div>
);

export const ErrorBox = ({ error }: { error: unknown }) =>
  error ? (
    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-bad/30 bg-bad/10 p-3 text-sm text-bad">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span>{(error as Error).message}</span>
    </div>
  ) : null;

export const PageTitle = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="bg-gradient-to-r from-text via-text to-text bg-clip-text text-2xl font-semibold tracking-tight text-transparent">{title}</h1>
      {sub && <p className="mt-1 text-sm text-subtle">{sub}</p>}
    </div>
    {action}
  </div>
);

/** Empty state with an icon — used wherever a list can legitimately come back empty. */
export const EmptyState = ({ icon: Icon = Info, title, hint, action }: { icon?: LucideIcon; title: string; hint?: string; action?: ReactNode }) => (
  <div className="group glass flex flex-col items-center gap-3 px-6 py-12 text-center">
    <span className="icon-tile" style={{ width: 46, height: 46 }}>
      <Icon size={22} strokeWidth={1.9} aria-hidden />
    </span>
    <p className="font-medium text-text">{title}</p>
    {hint && <p className="max-w-sm text-sm text-subtle">{hint}</p>}
    {action}
  </div>
);

export const statusTone = (s: string): Tone =>
  ({ shortlisted: "good", processed: "brand", open: "good", ranked: "brand", failed: "bad", not_selected: "neutral", draft: "warn", closed: "warn" } as Record<string, Tone>)[s] ?? "neutral";

/** Confirmed-success pill, so "Saved" reads the same everywhere. */
export const SavedFlag = ({ show }: { show: boolean }) =>
  show ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-good">
      <CheckCircle2 size={15} strokeWidth={2.3} aria-hidden /> Saved
    </span>
  ) : null;