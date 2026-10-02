import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Me, Role } from "@/lib/types";

interface AuthState { session: Session | null; me: Me | null; loading: boolean; signOut: () => Promise<void> }
const Ctx = createContext<AuthState>({ session: null, me: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); qc.clear(); });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  const meQ = useQuery({ queryKey: ["me", session?.user.id], queryFn: () => api.get<Me>("/me"), enabled: !!session, retry: 3, retryDelay: 800 });
  const value: AuthState = {
    session, me: meQ.data ?? null, loading: !ready || (!!session && meQ.isLoading),
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);

export const homeFor = (r: Role) => (r === "company" ? "/company" : r === "admin" ? "/admin/users" : "/candidate");

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { me, session, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!session || !me) return <Navigate to="/login" replace />;
  if (me.role !== role && me.role !== "admin") return <Navigate to={homeFor(me.role)} replace />;
  return <>{children}</>;
}
