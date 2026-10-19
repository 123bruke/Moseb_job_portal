import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Top scroll progress indicator with emerald aurora glow + floating Back-to-Top trigger
 */
export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const current = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
          setProgress(Math.min(100, Math.max(0, current)));
          setShowTopBtn(scrollTop > 420);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Top Scroll Progress Line */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50 h-[3px] w-full bg-transparent overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(34,197,94,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Smooth Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-surface/80 text-text shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-primary/60 hover:text-primary active:scale-95 ${
          showTopBtn
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </>
  );
}
