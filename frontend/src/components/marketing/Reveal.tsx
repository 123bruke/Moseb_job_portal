import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealVariant = "up" | "fade" | "scale" | "left" | "right" | "blur";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
  as?: "div" | "li" | "section" | "article" | "span";
  once?: boolean;
};

/**
 * Rich, hardware-accelerated scroll reveal component.
 * Animates into view smoothly as user scrolls, with configurable direction and easing.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 750,
  variant = "up",
  as = "div",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(el);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const variantClassMap: Record<RevealVariant, string> = {
    up: "reveal-up",
    fade: "reveal-fade",
    scale: "reveal-scale",
    left: "reveal-left",
    right: "reveal-right",
    blur: "reveal-blur",
  };

  const variantClass = variantClassMap[variant] || "reveal-up";
  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`reveal-base ${variantClass} ${shown ? "is-in" : ""} ${className}`}
      style={{
        transitionDelay: shown ? `${delay}ms` : undefined,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </Tag>
  );
}