/** Drifting gradient field behind the whole page. Purely decorative, fixed, and cheap (3 blurred blobs). */
export default function Aurora({ variant = "page" }: { variant?: "page" | "hero" }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg to-bg" />
      <div
        className="absolute -left-[18%] -top-[22%] h-[62vmax] w-[62vmax] rounded-full opacity-[0.5] blur-[110px] animate-aurora"
        style={{ background: "radial-gradient(circle at 30% 30%, rgb(var(--grad-a)), transparent 65%)" }}
      />
      <div
        className="absolute -right-[16%] top-[8%] h-[54vmax] w-[54vmax] rounded-full opacity-[0.45] blur-[120px] animate-aurora-slow"
        style={{ background: "radial-gradient(circle at 60% 40%, rgb(var(--grad-b)), transparent 62%)" }}
      />
      <div
        className="absolute bottom-[-20%] left-[24%] h-[48vmax] w-[48vmax] rounded-full opacity-[0.38] blur-[130px] animate-aurora"
        style={{ background: "radial-gradient(circle at 50% 50%, rgb(var(--grad-c)), transparent 60%)", animationDelay: "-9s" }}
      />
      {variant === "hero" && (
        <div
          className="absolute right-[6%] top-[38%] h-[34vmax] w-[34vmax] rounded-full opacity-[0.28] blur-[120px] animate-drift"
          style={{ background: "radial-gradient(circle at 50% 50%, rgb(var(--grad-d)), transparent 62%)" }}
        />
      )}
      {/* Faint grid keeps large empty areas from looking flat. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(var(--border) / .5) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--border) / .5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, #000 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, #000 35%, transparent 78%)",
        }}
      />
    </div>
  );
}