import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell, Briefcase, Building2, Compass, FileSearch, LayoutDashboard, MessageSquareText, Moon, Search,
  ShieldCheck, Sun, UserRound, Users, LogOut,
} from "lucide-react";
import { useAuth } from "@/app/auth";
import { useTheme } from "@/app/theme";
import { Button } from "@/components/ui";
import Aurora from "@/components/marketing/Aurora";
import { Logo } from "@/components/marketing/Icon";
import PhoneAssistant from "@/components/chat/PhoneAssistant";
import { api } from "@/lib/api";
import { IS_ADMIN_VIEW, START_PATH } from "@/lib/view";
import type { Role } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

/** Marketing links for Moseb Job Portal */
const MARKETING: { label: string; href: string }[] = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Companies", href: "/#companies" },
  { label: "Career Resources", href: "/#career-resources" },
];

const APP_LINKS: Record<Role, { to: string; label: string; icon: LucideIcon }[]> = {
  candidate: [
    { to: "/candidate", label: "Dashboard", icon: LayoutDashboard },
    { to: "/candidate/feed", label: "Job feed", icon: Compass },
    { to: "/candidate/applications", label: "Applications", icon: FileSearch },
    { to: "/candidate/profile", label: "Profile", icon: UserRound },
    { to: "/candidate/chat", label: "Career chat", icon: MessageSquareText },
  ],
  company: [
    { to: "/company", label: "Dashboard", icon: LayoutDashboard },
    { to: "/company/jobs/new", label: "Post job", icon: Briefcase },
    { to: "/company/profile", label: "Company", icon: Building2 },
    { to: "/company/chat", label: "Ask AI", icon: MessageSquareText },
  ],
  admin: [
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/queue", label: "Queue", icon: Compass },
    { to: "/admin/audit", label: "Audit", icon: ShieldCheck },
  ],
};

const PUBLIC_LINKS: { to: string; label: string; icon: LucideIcon }[] = [{ to: "/jobs", label: "Browse jobs", icon: Search }];

export default function Layout() {
  const { me, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const notifs = useQuery({ queryKey: ["notifs"], queryFn: () => api.get<{ id: number; read: boolean }[]>("/notifications"), enabled: !!me, refetchInterval: 30000 });
  const unread = notifs.data?.filter((n) => !n.read).length ?? 0;

  const onLanding = pathname === "/";
  const nav = IS_ADMIN_VIEW ? APP_LINKS.admin : me ? APP_LINKS[me.role] : PUBLIC_LINKS;
  const showMarketing = !IS_ADMIN_VIEW && !me;

  return (
    <div className="flex min-h-screen flex-col">
      <Aurora variant={onLanding ? "hero" : "page"} />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-glow">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/55 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Logo />

          <nav className="ml-6 hidden flex-1 items-center gap-6 md:flex">
            {showMarketing
              ? MARKETING.map((m) => (
                  <a
                    key={m.label}
                    href={m.href}
                    className="text-sm font-medium text-subtle transition-colors duration-200 hover:text-primary no-underline"
                  >
                    {m.label}
                  </a>
                ))
              : nav.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end
                    className={({ isActive }) =>
                      `group inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm no-underline transition duration-300 ${
                        isActive ? "bg-brand/10 font-semibold text-primary" : "text-subtle hover:-translate-y-0.5 hover:bg-muted/60 hover:text-text"
                      }`
                    }
                  >
                    <l.icon size={15} strokeWidth={2} aria-hidden className="transition-transform duration-300 group-hover:scale-125" />
                    {l.label}
                  </NavLink>
                ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-surface text-subtle transition duration-200 hover:border-primary/50 hover:text-primary"
            >
              <Sun size={16} strokeWidth={2} aria-hidden className={`absolute transition-all duration-300 ${theme === "dark" ? "translate-y-8 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100 text-amber-500"}`} />
              <Moon size={16} strokeWidth={2} aria-hidden className={`absolute transition-all duration-300 ${theme === "dark" ? "translate-y-0 rotate-0 opacity-100 text-primary" : "-translate-y-8 -rotate-90 opacity-0"}`} />
            </button>

            {me ? (
              <>
                {unread > 0 && (
                  <span className="relative inline-flex items-center gap-1 rounded-full bg-brand/12 px-2.5 py-1 text-xs font-medium text-primary" title="Unread notifications">
                    <Bell size={13} strokeWidth={2.3} aria-hidden />
                    {unread}
                  </span>
                )}
                <Button variant="outline" size="sm" icon={LogOut} onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="no-underline">
                  <Button variant="ghost" size="sm" className="font-medium text-subtle hover:text-text">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="no-underline">
                  <Button size="sm" className="bg-primary text-white hover:bg-primary/90 font-medium px-4 shadow-sm">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {/* Moseb AI Policy & Knowledge Assistant (Phone UI with iconic 'A') */}
      <PhoneAssistant />

      {IS_ADMIN_VIEW && (
        <footer className="border-t border-border/60 bg-surface/50 px-4 py-4 text-center text-xs text-subtle backdrop-blur-xl">
          Admin console · <Link to={START_PATH} className="no-underline hover:underline">Users</Link> · every override is audited
        </footer>
      )}
    </div>
  );
}