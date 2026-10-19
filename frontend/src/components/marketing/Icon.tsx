import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { IS_ADMIN_VIEW } from "@/lib/view";

/** Gradient plate for a lucide icon. Hover lives on the parent `.group` so cards can drive it. */
export function IconTile({ icon: Icon, size = 44, className = "", strokeWidth = 1.9 }: { icon: LucideIcon; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <span className={`icon-tile ${className}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.5)} strokeWidth={strokeWidth} aria-hidden />
    </span>
  );
}

/** Same tile without the gradient fill, for dense contexts (tables, chips). */
export function IconTilePlain({ icon: Icon, size = 36, className = "" }: { icon: LucideIcon; size?: number; className?: string }) {
  return (
    <span className={`icon-tile-plain ${className}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} aria-hidden />
    </span>
  );
}

/** Wordmark: green brand mark + Moseb name. Used in the header and the footer. */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to={IS_ADMIN_VIEW ? "/admin/users" : "/"} className={`group inline-flex items-center gap-2.5 no-underline ${className}`}>
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-fg shadow-sm transition-transform duration-300 group-hover:scale-105">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19V6.5L12 13.5L20 6.5V19" />
          <path d="M12 4.5L16 8.5" opacity="0.6" strokeWidth="2" />
        </svg>
      </span>
      {!compact && (
        <span className="flex items-baseline gap-1 text-[1.1rem] font-bold tracking-tight text-text">
          <span>Moseb</span>
          <span className="text-xs font-semibold tracking-wide text-primary">
            {IS_ADMIN_VIEW ? "Admin" : "Job Portal"}
          </span>
        </span>
      )}
    </Link>
  );
}