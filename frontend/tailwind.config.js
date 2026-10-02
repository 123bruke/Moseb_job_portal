/** Colors, radius and font come from CSS tokens (src/styles/tokens.css) so theming lives in ONE place. */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: c("--bg"), surface: c("--surface"), muted: c("--muted"), border: c("--border"), text: c("--text"),
        subtle: c("--subtle"), primary: c("--primary"), "primary-fg": c("--primary-fg"), brand: c("--brand"),
        good: c("--good"), warn: c("--warn"), bad: c("--bad"),
        grad: { a: c("--grad-a"), b: c("--grad-b"), c: c("--grad-c"), d: c("--grad-d") },
      },
      borderRadius: { DEFAULT: "var(--radius)", lg: "calc(var(--radius) * 1.5)", xl: "calc(var(--radius) * 2)", "2xl": "calc(var(--radius) * 2.6)" },
      fontFamily: { sans: "var(--font)" },
      backgroundImage: {
        brand: "linear-gradient(120deg, rgb(var(--grad-a)), rgb(var(--grad-b)) 45%, rgb(var(--grad-c)))",
        "brand-cool": "linear-gradient(120deg, rgb(var(--grad-a)), rgb(var(--grad-d)))",
        "brand-soft": "linear-gradient(180deg, rgb(var(--grad-a) / 0.14), rgb(var(--grad-c) / 0.08))",
      },
      boxShadow: {
        glow: "0 10px 40px -12px rgb(var(--glow) / 0.55)",
        "glow-lg": "0 24px 70px -20px rgb(var(--glow) / 0.6)",
        lift: "0 18px 40px -22px rgb(15 23 42 / 0.35)",
        glass: "inset 0 1px 0 0 rgb(255 255 255 / 0.35), 0 22px 60px -30px rgb(15 23 42 / 0.45)",
      },
      keyframes: {
        aurora: {
          "0%,100%": { transform: "translate3d(-8%, -6%, 0) scale(1)" },
          "33%": { transform: "translate3d(8%, 4%, 0) scale(1.16)" },
          "66%": { transform: "translate3d(-4%, 10%, 0) scale(1.06)" },
        },
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-22px,0)" },
        },
        "gradient-pan": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(26px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.94)" }, to: { opacity: "1", transform: "none" } },
        "pulse-ring": {
          "0%": { transform: "scale(.85)", opacity: "0.7" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "tilt-in": { from: { opacity: "0", transform: "perspective(900px) rotateX(9deg) translateY(22px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        aurora: "aurora 26s ease-in-out infinite",
        "aurora-slow": "aurora 40s ease-in-out infinite reverse",
        drift: "drift 7s ease-in-out infinite",
        "gradient-pan": "gradient-pan 7s ease infinite",
        shimmer: "shimmer 2.4s ease-in-out infinite",
        "fade-up": "fade-up .7s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in .6s ease both",
        "scale-in": "scale-in .5s cubic-bezier(.22,1,.36,1) both",
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
        marquee: "marquee 34s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "tilt-in": "tilt-in .8s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
};