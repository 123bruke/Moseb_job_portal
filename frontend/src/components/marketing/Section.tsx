import type { ReactNode } from "react";

export function Eyebrow({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="eyebrow">
      {icon}
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  icon,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  icon?: ReactNode;
}) {
  const c = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left";
  return (
    <div className={c}>
      {eyebrow && (
        <Eyebrow icon={icon}>
          <span className="text-gradient">{eyebrow}</span>
        </Eyebrow>
      )}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base leading-relaxed text-subtle">{sub}</p>}
    </div>
  );
}

/** Consistent vertical rhythm for the marketing page. */
export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-24 ${className}`}>
      {children}
    </section>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="group text-center">
      <p className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-subtle">{label}</p>
    </div>
  );
}