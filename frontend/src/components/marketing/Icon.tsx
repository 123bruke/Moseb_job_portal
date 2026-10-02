import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
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

/** Wordmark: gradient badge + name. Used in the header and the footer. */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to={IS_ADMIN_VIEW ? "/admin/users" : "/"} className={`group inline-flex items-center gap-2.5 no-underline ${className}`}>
      <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 12 }}>
        <Sparkles size={18} strokeWidth={2.2} aria-hidden />
      </span>
      {!compact && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-text">
          Smart Resume{IS_ADMIN_VIEW && <span className="text-gradient"> Admin</span>}
        </span>
      )}
    </Link>
  );
}