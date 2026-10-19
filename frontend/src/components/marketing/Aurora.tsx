/** Drifting gradient field behind the whole page. Purely decorative, fixed, and cheap (3 blurred blobs). */
export default function Aurora({ variant = "page" }: { variant?: "page" | "hero" }) {
  const isHero = variant === "hero";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg to-bg" />
      {/* Continuous flowing ambient color layers */}
      <div
        className={`absolute -left-[14%] -top-[18%] h-[68vmax] w-[68vmax] rounded-full blur-[120px] animate-gradient-drift ${
          isHero ? "opacity-[0.42]" : "opacity-[0.32]"
        }`}
        style={{ background: "radial-gradient(circle at 35% 35%, rgb(var(--grad-a)), transparent 60%)" }}
      />
      <div
        className="absolute -right-[12%] top-[12%] h-[60vmax] w-[60vmax] rounded-full opacity-[0.32] blur-[130px] animate-aurora-slow"
        style={{ background: "radial-gradient(circle at 60% 40%, rgb(var(--grad-c)), transparent 58%)" }}
      />
      <div
        className="absolute bottom-[-15%] left-[20%] h-[52vmax] w-[52vmax] rounded-full opacity-[0.28] blur-[140px] animate-aurora"
        style={{ background: "radial-gradient(circle at 50% 50%, rgb(var(--grad-b)), transparent 62%)", animationDelay: "-7s" }}
      />
      <div
        className="absolute right-[10%] top-[45%] h-[42vmax] w-[42vmax] rounded-full opacity-[0.22] blur-[130px] animate-drift"
        style={{ background: "radial-gradient(circle at 50% 50%, rgb(var(--grad-c)), transparent 60%)" }}
      />
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