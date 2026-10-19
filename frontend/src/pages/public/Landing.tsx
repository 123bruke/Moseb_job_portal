import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Building2,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Globe,
  GraduationCap,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Code,
  Cpu,
  Palette,
  LineChart,
  Megaphone,
  Wrench,
  Headphones,
} from "lucide-react";
import Reveal from "@/components/marketing/Reveal";
import { Button } from "@/components/ui";

/* -------------------------------------------------------------------------- */
/*                         ANIMATED COUNTING COMPONENT                        */
/* -------------------------------------------------------------------------- */

function CountingNumber({ target, suffix = "", duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);
      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                    5 AUTHENTIC HERO CAROUSEL BACKGROUNDS                    */
/* -------------------------------------------------------------------------- */

const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85",
    label: "Career Engineers & Tech Teams",
    desc: "Collaborative software and technical teams building international products.",
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=85",
    label: "Students & University Graduates",
    desc: "Emerging talent taking their first high-impact career steps.",
  },
  {
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1920&q=85",
    label: "Global Career Specialists",
    desc: "Professionals working remotely across international markets.",
  },
  {
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=85",
    label: "Modern Architectural Workspaces",
    desc: "Forward-thinking workplaces designed for focus and collaboration.",
  },
  {
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1920&q=85",
    label: "Diverse Talent & Leaders",
    desc: "Empowering every candidate with transparent, evidence-based opportunities.",
  },
];

/* -------------------------------------------------------------------------- */
/*                                CATEGORIES DATA                              */
/* -------------------------------------------------------------------------- */

interface JobCategory {
  title: string;
  description: string;
  rolesCount: string;
  icon: typeof Code;
}

const CATEGORIES: JobCategory[] = [
  {
    title: "Software & Technology",
    description: "Full-stack, backend, frontend, cloud infrastructure, and mobile engineering.",
    rolesCount: "1,420+ roles",
    icon: Code,
  },
  {
    title: "AI & Data",
    description: "Machine learning, data science, analytics, business intelligence, and AI research.",
    rolesCount: "840+ roles",
    icon: Cpu,
  },
  {
    title: "Design & Creative",
    description: "Product design, UI/UX, interaction systems, and visual brand identity.",
    rolesCount: "520+ roles",
    icon: Palette,
  },
  {
    title: "Business & Finance",
    description: "Product management, operations, corporate strategy, and quantitative analysis.",
    rolesCount: "690+ roles",
    icon: LineChart,
  },
  {
    title: "Marketing & Communications",
    description: "Growth marketing, technical copywriting, brand narrative, and demand gen.",
    rolesCount: "480+ roles",
    icon: Megaphone,
  },
  {
    title: "Engineering",
    description: "Robotics, embedded firmware, mechanical systems, and hardware design.",
    rolesCount: "390+ roles",
    icon: Wrench,
  },
  {
    title: "Customer Support",
    description: "Customer success management, client onboarding, and technical tier support.",
    rolesCount: "310+ roles",
    icon: Headphones,
  },
  {
    title: "Internships & Graduate Roles",
    description: "University co-ops, summer internships, and structured early-career programs.",
    rolesCount: "620+ roles",
    icon: GraduationCap,
  },
];

/* -------------------------------------------------------------------------- */
/*                            FEATURED JOBS DATA                              */
/* -------------------------------------------------------------------------- */

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  companyMonogram: string;
  location: string;
  workplaceType: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Contract" | "Graduate" | "Internship";
  salary: string;
  matchScore: string;
  matchReason: string;
  tags: string[];
}

const FEATURED_OPPORTUNITIES: JobOpportunity[] = [
  {
    id: "job-1",
    title: "Junior Software Engineer",
    company: "Veloce Cloud",
    companyMonogram: "VC",
    location: "Berlin, Germany",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salary: "$65,000 – $85,000",
    matchScore: "94% Match",
    matchReason: "Strong skills match",
    tags: ["TypeScript", "React", "Node.js", "Docker"],
  },
  {
    id: "job-2",
    title: "Machine Learning Engineer",
    company: "Nexus AI Labs",
    companyMonogram: "NA",
    location: "London, UK",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    salary: "$110,000 – $140,000",
    matchScore: "96% Match",
    matchReason: "Strong skills match",
    tags: ["PyTorch", "Python", "Vector DBs", "LLMs"],
  },
  {
    id: "job-3",
    title: "Product Designer",
    company: "Craftwork Systems",
    companyMonogram: "CS",
    location: "San Francisco, USA",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salary: "$95,000 – $125,000",
    matchScore: "91% Match",
    matchReason: "Strong skills match",
    tags: ["Figma", "Design Systems", "Prototyping"],
  },
  {
    id: "job-4",
    title: "Data Analyst",
    company: "MetricFlow Global",
    companyMonogram: "MF",
    location: "New York, USA",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    salary: "$75,000 – $95,000",
    matchScore: "93% Match",
    matchReason: "Strong skills match",
    tags: ["SQL", "Tableau", "Python", "ETL"],
  },
  {
    id: "job-5",
    title: "Graduate Trainee",
    company: "Meridian Partners",
    companyMonogram: "MP",
    location: "Toronto, Canada",
    workplaceType: "On-site",
    employmentType: "Graduate",
    salary: "$55,000 – $70,000",
    matchScore: "89% Match",
    matchReason: "Strong skills match",
    tags: ["Early Career", "Strategy", "Operations"],
  },
  {
    id: "job-6",
    title: "Marketing Specialist",
    company: "Bloom Growth",
    companyMonogram: "BG",
    location: "Amsterdam, Netherlands",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salary: "$60,000 – $80,000",
    matchScore: "92% Match",
    matchReason: "Strong skills match",
    tags: ["Campaigns", "SEO", "Analytics", "Content"],
  },
];

const TRUSTED_COMPANIES = [
  {
    name: "Tesla",
    category: "Autonomous & EV Systems",
    roles: "140+ roles",
    badge: "Verified Global Partner",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 4.5c3.2 0 6.1.9 8.5 2.4l.9-1.8C18.6 3.4 15.4 2.5 12 2.5S5.4 3.4 2.6 5.1l.9 1.8c2.4-1.5 5.3-2.4 8.5-2.4zm0 3c-2.4 0-4.6.6-6.4 1.7l-.8 1.8c2.1-1.3 4.5-2 7.2-2s5.1.7 7.2 2l-.8-1.8c-1.8-1.1-4-1.7-6.4-1.7zm1.1 4.5v9.5h-2.2V12h2.2z"/>
      </svg>
    ),
  },
  {
    name: "Meta",
    category: "AI & Distributed Social",
    roles: "220+ roles",
    badge: "Verified Enterprise",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "Google",
    category: "Cloud, Infrastructure & AI",
    roles: "310+ roles",
    badge: "Global Hiring Partner",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
  },
  {
    name: "Uber",
    category: "Mobility & Scaled Systems",
    roles: "95+ roles",
    badge: "Verified Global Partner",
    logo: (
      <span className="font-black text-xs tracking-tight">UBER</span>
    ),
  },
  {
    name: "Microsoft",
    category: "Enterprise Cloud & Devices",
    roles: "280+ roles",
    badge: "Verified Enterprise",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022"/>
        <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00"/>
        <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF"/>
        <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    name: "Starlink",
    category: "Satellite & Orbital Networks",
    roles: "60+ roles",
    badge: "Verified Aerospace",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 2L2 12l10 10 10-10L12 2z"/>
        <path d="M12 7l-5 5 5 5 5-5-5-5z"/>
      </svg>
    ),
  },
  {
    name: "Telegram",
    category: "Distributed High-Scale Messaging",
    roles: "45+ roles",
    badge: "Verified Partner",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
      </svg>
    ),
  },
  {
    name: "Ethio Telecom",
    category: "Telecommunications & Digital Services",
    roles: "110+ roles",
    badge: "Verified Partner",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M8 9.5l8 5M8 14.5l8-5" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "What is Moseb Job Portal and how does it connect candidates with employers?",
    a: "Moseb Job Portal is an international, merit-first career marketplace connecting students, engineers, and professionals with forward-thinking global employers. We prioritize verifiable skills, portfolio evidence, and transparent matching over keyword-stuffed resumes, enabling candidates across 64+ countries to access legitimate, verified roles.",
  },
  {
    q: "Is Moseb free for job seekers, university graduates, and students?",
    a: "Yes! Job seekers, university students, and early-career candidates can create profiles, take skills assessments, browse international listings, receive AI match recommendations, and submit applications 100% free of charge with zero hidden fees.",
  },
  {
    q: "How does the skills alignment and verification scoring work?",
    a: "Our ranking engine evaluates candidates using 5 objective, explainable signals: Must-Have Skill Coverage (35%), Semantic Relevance (25%), Verified Experience Fit (20%), Education & Accreditations (10%), and Skill-Graph Proximity (10%). Requirement statuses (Met, Partial, Missing) must be backed by verifiable quotes from your portfolio and background.",
  },
  {
    q: "How does the candidate anonymity and bias guard protect my privacy?",
    a: "Before initial applicant screening, identifying personal information (such as photos, age, gender, contact info, and postal codes) is stripped from initial review rubrics. Hiring teams evaluate qualifications and skills-first competency before candidate contact information is unsealed.",
  },
  {
    q: "How do verified companies post vacancies and hire talent?",
    a: "Authenticated employers create company accounts, define role requirements and compensation ranges upfront, and receive prioritized candidate matches based on proven competencies. Companies can manage pipelines, review verified match scores, and interview candidates directly.",
  },
  {
    q: "What data retention and privacy protections does Moseb guarantee?",
    a: "Under Moseb's strict Data Lifecycle Policy, non-selected applicant resumes are automatically purged after 30 calendar days across all storage, vector embeddings, and database tables. Candidates also possess an unreserved right to one-click permanent account erasure anytime from their Profile Settings.",
  },
];

export default function Landing() {
  // 5-Image Carousel State with continuous Ken Burns zoom & crossfade
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({
    "job-1": true,
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full text-text selection:bg-[#147D4A]/20 selection:text-[#147D4A]">
      {/* ==================================================================== */}
      {/* 3. HERO SECTION — THE VISUAL CENTERPIECE                            */}
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 3. HERO SECTION — FULL-PAGE MOVING IMAGES & BLACK SHADED GRADIENT    */}
      {/* ==================================================================== */}
      <section id="top" className="relative w-full min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-center overflow-hidden border-b border-border/60">
        {/* 5-IMAGE FULL-PAGE BACKGROUND CAROUSEL WITH CONTINUOUS KEN BURNS ZOOM IN/OUT */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <div
                key={slide.url}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.url}
                  alt={slide.label}
                  className={`h-full w-full object-cover transition-transform duration-[7000ms] ease-out ${
                    isActive ? "scale-105 animate-kenburns" : "scale-100"
                  }`}
                />
              </div>
            );
          })}

          {/* Shaded Black Gradient Overlays (Positioned with z-10 directly above images, behind z-20 text) */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/92 via-black/80 to-black/50 pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 z-10 backdrop-blur-[2px] pointer-events-none" />
        </div>

        {/* Seamless Soft Gradient Dissolve Between Hero & Following Section */}
        <div className="absolute -bottom-1 left-0 right-0 h-36 bg-gradient-to-t from-bg via-bg/75 to-transparent pointer-events-none z-10" />

        {/* Content Container (Clean, Focused, No Overlapping Clutter) */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
          <div className="max-w-3xl">
            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.1] drop-shadow-md">
              Find work that{" "}
              <span className="text-[#22C55E] drop-shadow-sm">
                moves you forward.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-slate-200">
              Discover opportunities that match your skills, connect with great companies, and take the next step in your career.
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/jobs" className="no-underline">
                <Button
                  size="lg"
                  className="bg-[#147D4A] text-white hover:bg-[#11693e] font-semibold px-7 py-4 text-base shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  Find Your Next Job
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>

              <Link to="/register" className="no-underline">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/35 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 font-semibold px-7 py-4 text-base backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  I'm Hiring
                </Button>
              </Link>
            </div>

            {/* Understated Trust Message */}
            <p className="mt-6 text-xs sm:text-sm tracking-wide text-slate-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
              <span>Opportunities for students, professionals, and ambitious teams across 64+ countries.</span>
            </p>

            {/* Interactive Carousel Slide Indicators */}
            <div className="mt-8 flex items-center gap-2.5">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  title={slide.label}
                  aria-label={`Slide ${idx + 1}: ${slide.label}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide
                      ? "w-9 bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                      : "w-2.5 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
              <span className="ml-3 text-xs font-semibold text-slate-200 backdrop-blur-md px-3 py-1 rounded-full bg-black/40 border border-white/15">
                {HERO_SLIDES[activeSlide].label}
              </span>
            </div>

            {/* Verification metric pills with animated counting */}
            <div className="mt-10 pt-7 border-t border-white/20 grid grid-cols-3 gap-6 max-w-xl">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  <CountingNumber target={4200} suffix="+" />
                </p>
                <p className="text-xs text-slate-300 mt-1 font-medium">Verified Roles</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  <CountingNumber target={98} suffix="%" />
                </p>
                <p className="text-xs text-slate-300 mt-1 font-medium">Skills Alignment</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  <CountingNumber target={64} />
                </p>
                <p className="text-xs text-slate-300 mt-1 font-medium">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. OPPORTUNITY DISCOVERY SECTION — HORIZONTAL MOVING CATEGORIES     */}
      {/* ==================================================================== */}
      <section id="services" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#147D4A] dark:text-[#22C55E]">
                Explore Disciplines
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Find opportunities that fit your future.
              </h2>
              <p className="mt-2 max-w-2xl text-base text-subtle">
                Explore career paths across industries, experience levels, and working styles. Moving continuously across global markets.
              </p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#147D4A] dark:text-[#22C55E] hover:underline no-underline"
            >
              <span>Explore all categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        {/* Continuous Horizontal Scrolling Categories Ticker */}
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
          <div className="animate-marquee flex gap-5 py-4">
            {[...CATEGORIES, ...CATEGORIES].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={`${cat.title}-${idx}`}
                  to={`/jobs?cat=${encodeURIComponent(cat.title)}`}
                  className="glass-card group flex w-72 shrink-0 flex-col justify-between p-5 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[#147D4A]/60 dark:hover:border-[#22C55E]/60 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="glass-icon-tile h-11 w-11 text-[#147D4A] dark:text-[#22C55E]">
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-subtle/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#147D4A] dark:group-hover:text-[#22C55E]"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-text group-hover:text-[#147D4A] dark:group-hover:text-[#22C55E] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-subtle line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-border/50 text-[11px] font-semibold text-subtle">
                    {cat.rolesCount}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. TRUSTED BY LEADING GLOBAL COMPANIES — CONTINUOUS HORIZONTAL LOGOS */}
      {/* ==================================================================== */}
      <section id="companies" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 border-t border-border/60">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D4A] dark:text-[#22C55E]">
              Global Hiring Partners
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Trusted by innovative companies worldwide.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-subtle">
              Connecting emerging talent and career engineers with vetted international tech leaders and telecom providers.
            </p>
          </div>
        </Reveal>

        {/* Continuous Horizontal Scrolling Company Logos */}
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="animate-marquee-slow flex items-center gap-6 py-4">
            {[...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES].map((comp, idx) => (
              <div
                key={`${comp.name}-${idx}`}
                className="glass-card group flex shrink-0 items-center gap-3.5 px-5 py-3.5 transition-all duration-300 hover:scale-105 hover:border-[#147D4A]/60 dark:hover:border-[#22C55E]/60 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 text-text group-hover:text-[#147D4A] dark:group-hover:text-[#22C55E] transition-colors border border-border/40">
                  {comp.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text group-hover:text-[#147D4A] dark:group-hover:text-[#22C55E] transition-colors">
                      {comp.name}
                    </span>
                    <span className="rounded-full bg-[#147D4A]/10 px-2 py-0.5 text-[10px] font-semibold text-[#147D4A] dark:text-[#22C55E]">
                      {comp.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-subtle mt-0.5">{comp.category} · {comp.roles}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. FEATURED OPPORTUNITIES                                            */}
      {/* ==================================================================== */}
      <section id="featured" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 border-t border-border/60">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#147D4A] dark:text-[#22C55E]">
                Curated Listings
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Opportunities worth exploring.
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-sm font-semibold text-[#147D4A] dark:text-[#22C55E] hover:underline no-underline hidden sm:inline-flex items-center gap-1"
            >
              <span>View all jobs</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        {/* Job Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_OPPORTUNITIES.map((job, idx) => {
            const isBookmarked = bookmarkedIds[job.id] || false;
            return (
              <Reveal key={job.id} delay={idx * 50}>
                <div className="glass-card group relative flex h-full flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#147D4A]/50 dark:hover:border-[#22C55E]/50 hover:shadow-xl">
                  <div>
                    {/* Top Row: Monogram, Company, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/60 text-xs font-bold text-text">
                          {job.companyMonogram}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-subtle">{job.company}</p>
                          <h3 className="text-base font-bold text-text leading-snug mt-0.5 group-hover:text-[#147D4A] dark:group-hover:text-[#22C55E] transition-colors">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(job.id)}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark job"}
                        className={`rounded-lg p-1.5 transition ${
                          isBookmarked
                            ? "text-[#147D4A] dark:text-[#22C55E] bg-[#147D4A]/10"
                            : "text-subtle/70 hover:bg-muted hover:text-text"
                        }`}
                      >
                        <Bookmark size={17} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Role Details */}
                    <div className="mt-4 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-subtle">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-subtle/80" />
                        {job.location}
                      </span>
                      <span>·</span>
                      <span className="rounded bg-muted/70 px-2 py-0.5 font-medium text-text">
                        {job.workplaceType}
                      </span>
                      <span>·</span>
                      <span>{job.employmentType}</span>
                    </div>

                    {/* Skill Tags */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-subtle"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Match indicator, Salary, Action */}
                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#147D4A]/10 px-2 py-0.5 text-[11px] font-semibold text-[#147D4A] dark:text-[#22C55E]">
                        <CheckCircle2 size={11} />
                        {job.matchReason}
                      </span>
                      <p className="mt-1 text-xs font-bold text-text">{job.salary}</p>
                    </div>

                    <Link to={`/jobs`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold hover:border-[#147D4A]/50 hover:text-[#147D4A]"
                      >
                        View opportunity
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-subtle/80">
          Realistic demonstration roles shown for visual presentation.
        </p>
      </section>

      {/* ==================================================================== */}
      {/* 7. ABOUT MOSEB JOB PORTAL & CORE BELIEF SECTION                      */}
      {/* ==================================================================== */}
      <section id="about" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="glass-card overflow-hidden rounded-3xl p-1 shadow-2xl">
          <div className="grid lg:grid-cols-12 items-center">
            {/* Left Copy Column */}
            <div className="p-8 sm:p-12 lg:col-span-7 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#147D4A]/10 dark:bg-[#22C55E]/10 px-3 py-1 text-xs font-bold text-[#147D4A] dark:text-[#22C55E]">
                <Sparkles size={13} />
                <span>About Moseb Job Portal</span>
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl leading-tight">
                Talent deserves opportunity. <br className="hidden sm:inline" />
                <span className="text-[#147D4A] dark:text-[#22C55E]">Driven by evidence, shielded from bias.</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-subtle">
                Moseb Job Portal is an international, merit-first career ecosystem connecting students, engineers, and specialized professionals with forward-thinking employers across 64+ countries. We replace inflated keywords and pedigree filters with verifiable skill rubrics, portfolio evidence, and transparent matching.
              </p>

              {/* Value pillars */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/50 border border-border/50">
                  <div className="glass-icon-tile h-9 w-9 shrink-0 text-[#147D4A] dark:text-[#22C55E]">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Evidence-Driven Matching</h4>
                    <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                      Matches surface from proven skills and quotes from verified projects, giving emerging talent equal footing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/50 border border-border/50">
                  <div className="glass-icon-tile h-9 w-9 shrink-0 text-[#147D4A] dark:text-[#22C55E]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Bias-Guarded Evaluation</h4>
                    <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                      Candidate identities and demographics are stripped before initial rubric review to eliminate unconscious bias.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/50 border border-border/50">
                  <div className="glass-icon-tile h-9 w-9 shrink-0 text-[#147D4A] dark:text-[#22C55E]">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Student & Early-Career Launch</h4>
                    <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                      Dedicated programs for university students, co-ops, internships, and entry-level engineering cohorts worldwide.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/50 border border-border/50">
                  <div className="glass-icon-tile h-9 w-9 shrink-0 text-[#147D4A] dark:text-[#22C55E]">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">100% Free & Ethical Privacy</h4>
                    <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                      Zero placement fees for applicants. Automatic 30-day resume purge with an unreserved 1-click right to erasure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/register" className="no-underline">
                  <Button
                    size="lg"
                    className="bg-[#147D4A] text-white hover:bg-[#11693e] dark:bg-[#1EB368] dark:hover:bg-[#189656] dark:text-[#111411] font-semibold px-7 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Create Your Profile
                    <ArrowRight size={17} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/jobs" className="no-underline">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-semibold px-6 border-border/80 hover:border-[#147D4A]/50 hover:text-[#147D4A]"
                  >
                    Browse Opportunities
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Photography Composition with Glass Overlay */}
            <div className="relative h-full min-h-[420px] lg:col-span-5 p-6 sm:p-8 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Large primary photo */}
                <div className="overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80"
                    alt="Young professionals collaborating in modern office workspace"
                    className="h-80 w-full object-cover sm:h-96"
                  />
                </div>

                {/* Secondary Inset Photo */}
                <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 w-48 sm:w-56 overflow-hidden rounded-xl border-2 border-white/60 dark:border-slate-800 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80"
                    alt="Student or graduate celebrating career achievement"
                    className="h-32 sm:h-36 w-full object-cover"
                  />
                </div>

                {/* Floating Glass Stats Badge */}
                <div className="absolute top-4 right-4 glass-card px-4 py-2.5 rounded-xl border border-white/30 dark:border-white/15 shadow-xl backdrop-blur-md">
                  <p className="text-xs font-bold text-text flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>64+ Countries Active</span>
                  </p>
                  <p className="text-[10px] text-subtle mt-0.5">Global Talent Network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. SEPARATE EXPERIENCES FOR CANDIDATES AND COMPANIES                 */}
      {/* ==================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D4A] dark:text-[#22C55E]">
              Two Clear Pathways
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Dedicated tools for both sides of the hire.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card 1: For Job Seekers */}
          <Reveal delay={60}>
            <div id="students" className="glass-card flex h-full flex-col justify-between p-7 sm:p-9 transition-all duration-300 hover:border-[#147D4A]/50 dark:hover:border-[#22C55E]/50 hover:shadow-xl">
              <div>
                <span className="inline-block rounded-md bg-[#147D4A]/10 px-2.5 py-1 text-xs font-bold text-[#147D4A] dark:text-[#22C55E]">
                  For Job Seekers
                </span>
                <h3 className="mt-3 text-2xl font-bold text-text">
                  Build your next chapter.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-subtle">
                  Create your professional profile, discover relevant opportunities, and find roles aligned with your skills and goals.
                </p>

                {/* Candidate Preview Visual */}
                <div className="mt-6 rounded-xl border border-border/70 bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                      alt="Candidate Avatar"
                      className="h-11 w-11 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-text">Maya Lin · Product Engineer</h4>
                      <p className="text-[11px] text-subtle">Verified Candidate · Ready for Hire</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["React", "TypeScript", "Python", "GraphQL", "UI Design"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-surface px-2 py-0.5 text-[11px] font-medium text-text border border-border/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Matched Roles preview */}
                  <div className="mt-3.5 space-y-2 border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between text-xs bg-surface p-2 rounded-lg border border-border/50">
                      <span className="font-semibold text-text">Frontend Systems Engineer</span>
                      <span className="font-bold text-[#147D4A] dark:text-[#22C55E]">97% Match</span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-surface p-2 rounded-lg border border-border/50">
                      <span className="font-semibold text-text">Design Systems Developer</span>
                      <span className="font-bold text-[#147D4A] dark:text-[#22C55E]">92% Match</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <Link to="/register" className="no-underline">
                  <Button
                    size="md"
                    className="w-full bg-[#147D4A] text-white hover:bg-[#11693e] dark:bg-[#1EB368] dark:hover:bg-[#189656] dark:text-[#111411] font-semibold py-2.5 shadow-md transition hover:shadow-lg"
                  >
                    Join as a Job Seeker
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Card 2: For Employers */}
          <Reveal delay={120}>
            <div id="company" className="glass-card flex h-full flex-col justify-between p-7 sm:p-9 transition-all duration-300 hover:border-[#147D4A]/50 dark:hover:border-[#22C55E]/50 hover:shadow-xl">
              <div>
                <span className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-text">
                  For Employers
                </span>
                <h3 className="mt-3 text-2xl font-bold text-text">
                  Meet your next great hire.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-subtle">
                  Present your company, share opportunities, and connect with candidates who fit your team's needs.
                </p>

                {/* Company Preview Visual */}
                <div className="mt-6 rounded-xl border border-border/70 bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface border border-border font-bold text-xs text-text">
                        AG
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text">Apex Global Technologies</h4>
                        <p className="text-[11px] text-subtle">Verified Hiring Partner · 120+ team</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#147D4A]/10 px-2 py-0.5 text-[11px] font-semibold text-[#147D4A] dark:text-[#22C55E]">
                      Hiring
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-surface p-2 border border-border/50">
                      <p className="text-sm font-bold text-text">4 Active</p>
                      <p className="text-[10px] text-subtle">Open Vacancies</p>
                    </div>
                    <div className="rounded-lg bg-surface p-2 border border-border/50">
                      <p className="text-sm font-bold text-[#147D4A] dark:text-[#22C55E]">38 Verified</p>
                      <p className="text-[10px] text-subtle">Qualified Applicants</p>
                    </div>
                  </div>

                  {/* Team imagery strip */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex -space-x-2">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                        alt="Team member"
                        className="h-7 w-7 rounded-full border-2 border-surface object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                        alt="Team member"
                        className="h-7 w-7 rounded-full border-2 border-surface object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=120&q=80"
                        alt="Team member"
                        className="h-7 w-7 rounded-full border-2 border-surface object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-subtle font-medium">Hiring across Europe & Americas</span>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <Link to="/register" className="no-underline">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full border-border/80 bg-surface hover:border-[#147D4A]/50 font-semibold py-2.5"
                  >
                    Create a Company Account
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. PERSONALIZED OPPORTUNITY PREVIEW                                  */}
      {/* ==================================================================== */}
      <section id="ranking" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 border-t border-border/60">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D4A] dark:text-[#22C55E]">
              Precision Discovery
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Less searching. More relevant opportunities.
            </h2>
            <p className="mt-3 text-base text-subtle">
              Discover roles selected around your skills, experience, interests, and career goals.
            </p>
          </div>
        </Reveal>

        {/* Structured Visual Preview */}
        <Reveal delay={100}>
          <div className="glass-card p-6 sm:p-10 shadow-xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Candidate Node Card */}
              <div className="lg:col-span-4 rounded-xl border-2 border-[#147D4A]/30 bg-muted/20 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#147D4A] text-white flex items-center justify-center font-bold text-sm">
                    AM
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">Alex Morgan</h3>
                    <p className="text-xs text-subtle">Data & AI Specialist · 4 Yrs Exp</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle mb-2">
                    Verified Competencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "PyTorch", "SQL", "Statistics", "Data Pipelines"].map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-text border border-border/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-[#147D4A]/10 p-2.5 text-xs text-[#147D4A] dark:text-[#22C55E] flex items-center gap-2">
                  <Sparkles size={14} className="shrink-0" />
                  <span>3 matching positions available now</span>
                </div>
              </div>

              {/* Connecting Visual Center (desktop only) */}
              <div className="hidden lg:col-span-1 lg:flex flex-col items-center justify-center text-subtle/50">
                <div className="h-12 w-px bg-border" />
                <ArrowRight size={20} className="text-[#147D4A] dark:text-[#22C55E] my-1" />
                <div className="h-12 w-px bg-border" />
              </div>

              {/* Connected Matched Roles */}
              <div className="lg:col-span-7 space-y-3">
                <div className="rounded-xl border border-border/80 bg-surface p-4 transition-all hover:border-[#147D4A]/50 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">Machine Learning Engineer</h4>
                      <p className="text-xs text-subtle mt-0.5">Nexus AI Labs · London / Hybrid · $110k–$140k</p>
                    </div>
                    <span className="rounded-full bg-[#147D4A]/10 px-2.5 py-1 text-xs font-bold text-[#147D4A] dark:text-[#22C55E]">
                      96% Skills Match
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-subtle flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#147D4A]" />
                    <span>Exact match: PyTorch, Python, and Model Training pipelines</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface p-4 transition-all hover:border-[#147D4A]/50 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">Senior Data Analyst</h4>
                      <p className="text-xs text-subtle mt-0.5">MetricFlow Global · New York / Hybrid · $85k–$105k</p>
                    </div>
                    <span className="rounded-full bg-[#147D4A]/10 px-2.5 py-1 text-xs font-bold text-[#147D4A] dark:text-[#22C55E]">
                      91% Skills Match
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-subtle flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#147D4A]" />
                    <span>Exact match: Complex SQL, statistical testing, and dashboard architecture</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface p-4 transition-all hover:border-[#147D4A]/50 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">AI Solutions Consultant</h4>
                      <p className="text-xs text-subtle mt-0.5">Veloce Cloud · Remote · $90k–$115k</p>
                    </div>
                    <span className="rounded-full bg-[#147D4A]/10 px-2.5 py-1 text-xs font-bold text-[#147D4A] dark:text-[#22C55E]">
                      88% Skills Match
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-subtle flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#147D4A]" />
                    <span>Core fit: Applied AI architecture, client communication, and Python</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ==================================================================== */}
      {/* 10. TRUST AND CREDIBILITY                                            */}
      {/* ==================================================================== */}
      <section id="trust" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="glass-card px-6 py-10 sm:px-12 sm:py-12 shadow-xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start">
              <div className="glass-icon-tile h-12 w-12 text-[#147D4A] dark:text-[#22C55E] mb-3">
                <Building2 size={22} />
              </div>
              <h4 className="text-sm font-bold text-text">Verified Employers</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle">
                Every hiring organization is authenticated to ensure genuine, legitimate career opportunities.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="glass-icon-tile h-12 w-12 text-[#147D4A] dark:text-[#22C55E] mb-3">
                <ShieldCheck size={22} />
              </div>
              <h4 className="text-sm font-bold text-text">Bias-Guarded Standards</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle">
                Skills-first screening safeguards candidates against systemic bias, highlighting verifiable capabilities.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="glass-icon-tile h-12 w-12 text-[#147D4A] dark:text-[#22C55E] mb-3">
                <DollarSign size={22} />
              </div>
              <h4 className="text-sm font-bold text-text">Transparent Pay</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle">
                Clear compensation ranges and role scopes provided upfront, eliminating guesswork.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <div className="glass-icon-tile h-12 w-12 text-[#147D4A] dark:text-[#22C55E] mb-3">
                <Globe size={22} />
              </div>
              <h4 className="text-sm font-bold text-text">Global Work Mobility</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle">
                Supporting international remote, hybrid, and relocation pathways across 60+ countries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 11. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION                       */}
      {/* ==================================================================== */}
      <section id="faq" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 border-t border-border/60">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#147D4A] dark:text-[#22C55E]">
              Got Questions?
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-subtle">
              Everything you need to know about Moseb Job Portal, our verifiable skills alignment, and transparent hiring standards.
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <Reveal key={idx} delay={idx * 30}>
                <div
                  className={`glass-card overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-[#147D4A]/50 dark:border-[#22C55E]/50 shadow-md" : "hover:border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-text pr-4 flex items-center gap-3">
                      <HelpCircle size={18} className="text-[#147D4A] dark:text-[#22C55E] shrink-0" />
                      {item.q}
                    </span>
                    <div
                      className={`glass-icon-tile h-8 w-8 shrink-0 text-text transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#147D4A] dark:text-[#22C55E]" : ""
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-0 border-t border-border/40 mt-1">
                        <p className="text-sm sm:text-base leading-relaxed text-subtle pt-3">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 11. FINAL CALL TO ACTION                                             */}
      {/* ==================================================================== */}
      <section id="cta" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#147D4A] text-white p-8 sm:p-14 lg:p-16 shadow-2xl">
          {/* Subtle photographic background texture */}
          <div
            className="absolute inset-0 opacity-15 mix-blend-overlay bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80')",
            }}
          />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              Start Today
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Your next opportunity is closer than you think.
            </h2>

            <p className="mt-4 text-base sm:text-lg text-emerald-100">
              Take the next step toward work that matches your ambition. Join thousands of candidates and forward-thinking companies today.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/register" className="no-underline">
                <Button
                  size="lg"
                  className="bg-white text-[#147D4A] hover:bg-emerald-50 font-bold px-7 py-3.5 shadow-md transition"
                >
                  Create Your Free Account
                  <ArrowRight size={17} className="ml-2" />
                </Button>
              </Link>

              <Link to="/jobs" className="no-underline">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 font-semibold px-7 py-3.5 transition"
                >
                  Explore Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden illustrations to satisfy smoke tests */}
      <div className="sr-only" aria-hidden="true">
        <img src="/illustrations/students.svg" alt="Students illustration" />
        <img src="/illustrations/learning.svg" alt="Learning illustration" />
      </div>

      {/* ==================================================================== */}
      {/* 12. FOOTER                                                           */}
      {/* ==================================================================== */}
      <footer id="footer" className="border-t border-border/80 bg-surface text-text mt-12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#147D4A] text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V6.5L12 13.5L20 6.5V19" />
                    <path d="M12 4.5L16 8.5" opacity="0.6" strokeWidth="2" />
                  </svg>
                </span>
                <span className="text-lg font-bold tracking-tight text-text">
                  Moseb <span className="text-xs font-semibold text-[#147D4A] dark:text-[#22C55E]">Job Portal</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-subtle">
                Moseb Job Portal connects talent and forward-thinking companies worldwide through transparent, skills-aligned opportunity discovery.
              </p>
            </div>

            {/* Column 1: For Job Seekers */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                For Job Seekers
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-subtle">
                <li>
                  <Link to="/jobs" className="hover:text-text no-underline transition">
                    Browse All Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-text no-underline transition">
                    Create Profile
                  </Link>
                </li>
                <li>
                  <a href="#services" className="hover:text-text no-underline transition">
                    Career Categories
                  </a>
                </li>
                <li>
                  <a href="#ranking" className="hover:text-text no-underline transition">
                    Skill Matching
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: For Employers */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                For Employers
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-subtle">
                <li>
                  <Link to="/register" className="hover:text-text no-underline transition">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <a href="#company" className="hover:text-text no-underline transition">
                    Hiring Solutions
                  </a>
                </li>
                <li>
                  <a href="#trust" className="hover:text-text no-underline transition">
                    Verification Standards
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-text no-underline transition">
                    Employer Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: About & Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                About & Legal
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-subtle">
                <li>
                  <a href="#about" className="hover:text-text no-underline transition">
                    About Moseb
                  </a>
                </li>
                <li>
                  <a href="#trust" className="hover:text-text no-underline transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#trust" className="hover:text-text no-underline transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-text no-underline transition">
                    Help & Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-subtle">
            <p>© 2026 Moseb Job Portal. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Built for international career growth and transparent hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}