import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, LogIn, MailCheck, ShieldCheck, UserRound } from "lucide-react";
import { homeFor, useAuth } from "@/app/auth";
import { IconTile } from "@/components/marketing/Icon";
import { Button, Card, ErrorBox, Field, Input, Select } from "@/components/ui";
import { Logo } from "@/components/marketing/Icon";
import { supabase } from "@/lib/supabase";

export function Login() {
  const nav = useNavigate();
  const { me } = useAuth();
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [err, setErr] = useState<Error | null>(null), [busy, setBusy] = useState(false);
  if (me) return <Navigate to={homeFor(me.role)} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error); else nav("/");
  };

  return (
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4 py-16">
        <Logo className="mb-8 justify-center" />
        <Card glass className="animate-fade-up p-7">
          <div className="text-center">
            <IconTile icon={LogIn} size={48} className="mx-auto" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text">Welcome back</h1>
            <p className="mt-1.5 text-sm text-subtle">Sign in to your feed, applications or shortlists.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
            <Field label="Password"><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
            <ErrorBox error={err} />
            <Button type="submit" disabled={busy} className="w-full" icon={ArrowRight}>{busy ? "Signing in…" : "Sign in"}</Button>
          </form>

          <p className="mt-5 text-center text-sm text-subtle">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </Card>
      </div>
  );
}

export function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ role: "candidate", full_name: "", email: "", password: "", nationality: "", phone: "", location: "" });
  const [err, setErr] = useState<Error | null>(null), [busy, setBusy] = useState(false), [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const { data, error } = await supabase.auth.signUp({
      email: f.email, password: f.password,
      options: { data: { role: f.role, full_name: f.full_name, nationality: f.nationality, phone: f.phone, location: f.location } },
    });
    setBusy(false);
    if (error) return setErr(error);
    if (data.session) nav("/"); else setSent(true);
  };

  if (sent) {
    return (
          <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4 py-16">
          <Card glass className="animate-scale-in p-7 text-center">
            <IconTile icon={MailCheck} size={52} className="mx-auto" />
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text">Check your email</h1>
            <p className="mt-2 text-sm text-subtle">Confirm your address, then sign in.</p>
            <Link to="/login" className="mt-6 inline-block"><Button variant="outline" className="w-full">Go to sign in</Button></Link>
          </Card>
        </div>
      );
  }

  return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Card glass className="animate-fade-up p-7">
          <div className="text-center">
            <IconTile icon={UserRound} size={48} className="mx-auto" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text">Create your account</h1>
            <p className="mt-1.5 text-sm text-subtle">Free, and no resume is uploaded until you choose to.</p>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="I am a…">
                <Select value={f.role} onChange={set("role")}>
                  <option value="candidate">Candidate — looking for work</option>
                  <option value="company">Company — hiring</option>
                </Select>
              </Field>
            </div>
            <Field label="Full name"><Input required value={f.full_name} onChange={set("full_name")} /></Field>
            <Field label="Email"><Input type="email" required value={f.email} onChange={set("email")} /></Field>
            <Field label="Password" hint="At least 8 characters">
              <Input type="password" minLength={8} required value={f.password} onChange={set("password")} autoComplete="new-password" />
            </Field>
            <Field label="Phone"><Input value={f.phone} onChange={set("phone")} /></Field>
            <Field label="Nationality" hint="Kept on your profile only. Never used for ranking.">
              <Input value={f.nationality} onChange={set("nationality")} />
            </Field>
            <Field label="Location"><Input value={f.location} onChange={set("location")} /></Field>

            <div className="md:col-span-2 space-y-3">
              <p className="flex items-start gap-2 rounded-lg border border-good/25 bg-good/[0.06] p-3 text-xs leading-relaxed text-subtle">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-good" aria-hidden />
                <span>
                  Candidates stay anonymous until shortlisted, and non-selected resumes are deleted after the
                  retention window. You can delete everything yourself at any time.
                </span>
              </p>
              <ErrorBox error={err} />
              <Button type="submit" disabled={busy} className="w-full" icon={f.role === "company" ? Building2 : ArrowRight}>
                {busy ? "Creating…" : "Create account"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
  );
}