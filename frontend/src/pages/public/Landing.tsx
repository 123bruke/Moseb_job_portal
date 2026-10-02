import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, BarChart3, BookOpen, Bot, Briefcase, Building2, Eye, FileCheck2, FileText, Fingerprint,
  Gauge, GraduationCap, Landmark, Lock, MessagesSquare, Quote, Radar, Scale, ShieldCheck, Sparkles, Target,
  Trash2, TrendingUp, Users, Workflow, type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/marketing/Reveal";
import { IconTile } from "@/components/marketing/Icon";
import { Section, SectionHeading, Stat } from "@/components/marketing/Section";
import { Badge, Button } from "@/components/ui";

type Item = { icon: LucideIcon; title: string; body: string };

/* Copy below is taken from the project's own README and architecture notes, not invented claims. */

const RANKING_SIGNALS: Item[] = [
  { icon: Target, title: "Must-have coverage · 35%", body: "Skill coverage against the rubric the company approved, including the years each skill requires." },
  { icon: Radar, title: "Semantic similarity · 25%", body: "Meaning-level match between the resume and the role, not literal keyword counting." },
  { icon: TrendingUp, title: "Experience fit · 20%", body: "Relevant years against the minimum the job actually asks for." },
  { icon: GraduationCap, title: "Education · 10%", body: "Level and field of study, with certifications counted alongside the diploma." },
  { icon: Workflow, title: "Skill-graph proximity · 10", body: "How close the candidate's skills sit to the role in the knowledge graph, including transferable neighbours." },
];

const SERVICES: Item[] = [
  { icon: Bot, title: "Explainable agent graph", body: "A visible trace per candidate: understand the rubric, retrieve evidence, verify each requirement, score, self-check for bias, then explain." },
  { icon: Scale, title: "Bias guard", body: "Name, photo, age, gender, nationality and contact data are stripped before chunking, embedding or scoring. Companies see anonymous labels until a shortlist." },
  { icon: ShieldCheck, title: "Prompt-injection defence", body: "Resume text is wrapped as data and the model is told to ignore instructions inside documents. A verdict without a verifiable quote is downgraded to missing." },
  { icon: FileCheck2, title: "Human-in-the-loop ranking", body: "Hard filters mark a candidate not eligible with a reason instead of silently dropping them. Pairwise comparison breaks near-ties; your override wins and is audited." },
  { icon: MessagesSquare, title: "RAG career and hiring chat", body: "Ask about your gaps or your anonymous candidates. Answers cite the evidence they were built from." },
  { icon: Trash2, title: "Retention and one-click delete", body: "Non-selected resumes lose their file, chunks, graph edges and reasoning after RETENTION_DAYS. Candidates can delete their account and data at any time." },
];

const STUDENT_STEPS: Item[] = [
  { icon: FileText, title: "Upload once", body: "PDF, DOCX or TXT. Text is extracted, scanned for malware and parsed into structured skills, roles and dates." },
  { icon: Gauge, title: "Get a ranked feed", body: "Jobs ordered by a 0–100 hybrid score with the reasoning attached, so the order never looks arbitrary." },
  { icon: BarChart3, title: "Read honest feedback", body: "Every application ends in a per-requirement table: met, partial or missing, each with the resume quote that proves it." },
  { icon: BookOpen, title: "Close the gap", body: "Skill gaps arrive as a checklist, with the career chat to explain what to learn next." },
];

const GUARANTEES = [
  { icon: Fingerprint, title: "Anonymous by default", body: "Applications carry a label, not a name, until the company shortlists someone." },
  { icon: Lock, title: "Consent at apply time", body: "Uploading a resume is the consent, and it is stated before you submit." },
  { icon: Eye, title: "Auditable decisions", body: "Shortlist overrides, role changes and deletions all land in the audit log." },
];

const PILLARS: Item[] = [
  { icon: GraduationCap, title: "Built for students and graduates", body: "First roles are decided on evidence, not on who had a name the recruiter recognised." },
  { icon: Landmark, title: "Fair for employers", body: "A shortlist with reasoning you can audit and override, so the decision stays yours." },
  { icon: BarChart3, title: "Honest about limits", body: "Auto-ranking supports a hiring decision. It should never make that decision alone." },
];

export default function Landing() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section id="top" className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <Sparkles size={13} strokeWidth={2.4} aria-hidden className="text-primary" />
              <span className="text-gradient">Explainable · bias-guarded ranking</span>
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl">
              Hire fairly.
              <br />
              Get hired <span className="text-gradient animate-gradient">transparently</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-subtle">
              Candidates get a ranked job feed and honest AI feedback. Companies get a shortlist with reasoning
              they can audit and override. Every score arrives with the evidence behind it — never a black box.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="group">
                <Button size="lg" icon={ArrowRight} className="group-hover:shadow-glow-lg">
                  Get started free
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" icon={Briefcase}>Browse open jobs</Button>
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              <Stat value="0–100" label="Hybrid score" />
              <Stat value="5" label="Weighted signals" />
              <Stat value="100%" label="Verifiable quotes" />
            </div>
          </div>

          {/* Hero artwork */}
          <Reveal delay={120} className="relative animate-tilt-in">
            <div className="ring-gradient glass-strong group sheen relative overflow-hidden p-3">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/25 blur-3xl" aria-hidden />
              <img
                src="/illustrations/students.svg"
                alt="Students wearing graduation caps reviewing a ranked shortlist on a laptop"
                className="w-full rounded-xl"
                width={640}
                height={520}
              />
            </div>

            <div className="glass-strong absolute -bottom-6 -left-4 hidden items-center gap-3 px-4 py-3 sm:flex">
              <span className="icon-tile" style={{ width: 38, height: 38 }}>
                <BadgeCheck size={18} strokeWidth={2.1} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-text">Bias guard active</p>
                <p className="text-xs text-subtle">Identity stripped before scoring</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="relative overflow-hidden border-y border-border/50 bg-surface/30 py-4 backdrop-blur-md">
        <div className="flex w-max animate-marquee gap-10 pr-10 text-sm font-medium uppercase tracking-[0.2em] text-subtle">
          {[...Array(2)].flatMap((_, r) =>
            ["Bias-guarded", "Explainable", "Prompt-injection safe", "Audited overrides", "Retention by default", "Anonymous until shortlist"].map((t) => (
              <span key={`${r}-${t}`} className="flex items-center gap-10 whitespace-nowrap">
                {t}
                <Sparkles size={13} className="text-grad-b" aria-hidden />
              </span>
            )),
          )}
        </div>
      </div>

      {/* ================= ABOUT ================= */}
      <Section id="about">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            icon={<Sparkles size={13} className="text-grad-b" aria-hidden />}
            title={<>A hiring decision you can <span className="text-gradient">actually defend</span></>}
            sub="Most automated screening is a black box that quietly reproduces human bias. This one shows its work: which requirement was checked, which resume sentence proved it, and where a human overrode the machine."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 110}>
              <article className="ring-gradient glass group h-full p-6 transition duration-500 hover-lift">
                <IconTile icon={p.icon} size={48} />
                <h3 className="mt-5 text-lg font-semibold text-text">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="ring-gradient glass group mt-6 grid items-center gap-8 overflow-hidden p-8 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <Badge tone="brand" icon={Quote}>Our position</Badge>
              <p className="mt-4 text-lg leading-relaxed text-text">
                “A score without evidence is an opinion. So every verdict here carries the quote it was based on,
                and every override a human makes is recorded and auditable.”
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge tone="good" icon={ShieldCheck}>Hard filters never hide a rejection</Badge>
                <Badge tone="brand" icon={Users}>Names revealed only after shortlisting</Badge>
              </div>
            </div>
            <img
              src="/illustrations/learning.svg"
              alt="An open book with a glowing graduation cap above a skill graph"
              className="w-full"
              width={560}
              height={460}
            />
          </div>
        </Reveal>
      </Section>

      {/* ================= SERVICES ================= */}
      <Section id="services">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            icon={<Sparkles size={13} className="text-grad-b" aria-hidden />}
            title={<>Everything the ranking needs, <span className="text-gradient">nothing it shouldn't have</span></>}
            sub="Six services cover the whole lifecycle: ingesting a resume, judging it fairly, explaining the judgement, and deleting everything afterwards."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 100}>
              <article className="ring-gradient glass group h-full p-6 transition duration-500 hover-lift">
                <div className="flex items-start justify-between gap-3">
                  <IconTile icon={s.icon} size={46} />
                  <span className="text-xs font-semibold tabular-nums text-subtle/70">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ================= HOW RANKING WORKS ================= */}
      <Section id="ranking">
        <Reveal>
          <SectionHeading
            eyebrow="The engine"
            icon={<Sparkles size={13} className="text-grad-b" aria-hidden />}
            title={<>How a score is <span className="text-gradient">built</span></>}
            sub="A hybrid score out of 100, with per-job weights the company can edit — not a single model's opinion."
          />
        </Reveal>

        <div className="mt-14 space-y-3">
          {RANKING_SIGNALS.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <div className="ring-gradient glass group flex flex-wrap items-center gap-4 p-5 transition duration-500 hover-lift sm:flex-nowrap">
                <IconTile icon={r.icon} size={44} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-text">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-subtle">{r.body}</p>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:w-40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-grad-a via-grad-b to-grad-c transition-transform duration-700 origin-left scale-x-0 group-hover:scale-x-100"
                    style={{ width: `${[35, 25, 20, 10, 10][i]}%` }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-6 text-center text-sm text-subtle">
            Hard filters run first — missing must-have, below minimum years, location or work authorisation.
            A failing candidate is marked <span className="font-medium text-text">not eligible with a reason</span>, never silently dropped.
          </p>
        </Reveal>
      </Section>

      {/* ================= FOR STUDENTS ================= */}
      <Section id="students">
        <Reveal>
          <SectionHeading
            eyebrow="For students"
            icon={<GraduationCap size={13} className="text-grad-b" aria-hidden />}
            title={<>Your first job, decided on <span className="text-gradient">evidence</span></>}
            sub="Four steps from upload to an offer you understand — with feedback that tells you what to fix next semester."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STUDENT_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <article className="ring-gradient glass group relative h-full overflow-hidden p-6 transition duration-500 hover-lift">
                <span className="absolute -right-3 -top-5 text-7xl font-bold text-primary/[0.06]" aria-hidden>
                  {i + 1}
                </span>
                <IconTile icon={s.icon} size={44} />
                <h3 className="relative mt-5 font-semibold text-text">{s.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-subtle">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ================= FOR COMPANIES ================= */}
      <Section id="company">
        <Reveal>
          <SectionHeading
            eyebrow="For companies"
            icon={<Building2 size={13} className="text-grad-b" aria-hidden />}
            title={<>Shortlists you can <span className="text-gradient">defend in a meeting</span></>}
            sub="Post a role, let the AI draft the rubric, approve it, close applications and get a ranked shortlist with the reasoning attached."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <ol className="space-y-3">
              {[
                { icon: Briefcase, t: "Post the job", d: "Title, description, required skills, seats and deadline. Optionally attach a requirement file." },
                { icon: FileCheck2, t: "Approve the rubric", d: "The AI proposes must-haves, nice-to-haves and weights. You edit until it matches how you actually hire." },
                { icon: Users, t: "Watch applicants arrive", d: "Every resume is ingested, parsed and scored on a worker queue, with progress shown live." },
                { icon: Scale, t: "Compare, then override", d: "Pick up to four candidates, read the reasoning trace, reorder if you disagree. The audit log records why." },
              ].map((step, i) => (
                <li key={step.t} className="ring-gradient glass group flex items-start gap-4 p-5 transition duration-500 hover-lift">
                  <IconTile icon={step.icon} size={42} />
                  <div>
                    <h3 className="font-semibold text-text">{step.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-subtle">{step.d}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold tabular-nums text-subtle/60">{i + 1}/4</span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={140}>
            <div className="ring-gradient glass-strong group h-full overflow-hidden p-7">
              <Badge tone="brand" icon={ShieldCheck}>Bias guard</Badge>
              <h3 className="mt-4 text-xl font-semibold text-text">Who you see before the shortlist</h3>
              <p className="mt-3 text-sm leading-relaxed text-subtle">
                Candidates arrive as anonymous labels. Identity is attached only after you shortlist someone, so
                who gets read closely never depends on a name, a photo or a postcode.
              </p>
              <div className="divider-glow my-6" />
              <ul className="space-y-4">
                {GUARANTEES.map((g) => (
                  <li key={g.title} className="group/item flex items-start gap-3">
                    <span className="icon-tile-plain h-9 w-9">
                      <g.icon size={16} strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text">{g.title}</p>
                      <p className="text-xs leading-relaxed text-subtle">{g.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ================= CTA ================= */}
      <Section id="cta" className="pb-28">
        <Reveal>
          <div className="ring-gradient glass-strong group relative overflow-hidden px-6 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl transition-transform duration-700 group-hover:scale-125" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-grad-c/25 blur-3xl transition-transform duration-700 group-hover:scale-125" aria-hidden />

            <div className="relative">
              <span className="icon-tile mx-auto" style={{ width: 56, height: 56 }}>
                <Sparkles size={26} strokeWidth={1.9} aria-hidden />
              </span>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Ready to see a ranking you can <span className="text-gradient animate-gradient">explain</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-subtle">
                Create a candidate or company account in under a minute. No resume is uploaded until you choose to.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/register" className="group/btn">
                  <Button size="lg" icon={ArrowRight} className="group-hover/btn:shadow-glow-lg">Create your account</Button>
                </Link>
                <Link to="/jobs">
                  <Button size="lg" variant="outline" icon={Briefcase}>See open roles</Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border/60 bg-surface/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text">Smart Resume Checker</p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-subtle">
              Auto-ranking supports hiring decisions; it should not make them alone. Resumes of non-selected
              applicants are deleted after the retention window.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="/#about" className="text-subtle no-underline transition hover:text-primary">About</a>
            <a href="/#services" className="text-subtle no-underline transition hover:text-primary">Services</a>
            <Link to="/jobs" className="text-subtle no-underline transition hover:text-primary">Jobs</Link>
            <Link to="/login" className="text-subtle no-underline transition hover:text-primary">Sign in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}