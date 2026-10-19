import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  ChevronDown,
  CheckCircle2,
  Moon,
  Sun,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  History,
  FileText,
} from "lucide-react";
import IconA from "./IconA";
import { api } from "@/lib/api";
import { useTheme } from "@/app/theme";

interface SourceItem {
  title: string;
  source: string;
  category?: string;
  similarity?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
  timestamp?: string;
}

interface HistoryTopic {
  id: string;
  title: string;
  prompt: string;
}

const HISTORY_TOPICS: HistoryTopic[] = [
  {
    id: "about",
    title: "About Moseb Job Portal",
    prompt: "What is Moseb Job Portal and what are its key features?",
  },
  {
    id: "retention",
    title: "Resume Retention Policy",
    prompt: "What is your resume retention and deletion policy?",
  },
  {
    id: "score",
    title: "5-Signal Scoring Formula",
    prompt: "How does the explainable 5-signal scoring formula work?",
  },
  {
    id: "bias",
    title: "Candidate Anonymity & Anti-Bias",
    prompt: "How does the bias guard protect candidate privacy during review?",
  },
  {
    id: "it",
    title: "IT AI vs Human Screening",
    prompt: "What are the IT CV AI vs Human screening rules?",
  },
];

// Fallback client-side policy answers in case backend is starting or offline
const CLIENT_POLICY_FALLBACKS: Record<string, { reply: string; sources: SourceItem[] }> = {
  about: {
    reply: "### 🌐 About Moseb Job Portal\n\n**Moseb Job Portal** is an international, merit-first career ecosystem connecting students, software engineers, and specialized professionals with forward-thinking employers across 64+ countries.\n\n- **Skills-First Matching:** Rather than filtering candidates through keyword-stuffed resumes or prestige metrics, our ranking engine assesses verified project evidence and hands-on competencies.\n- **Anti-Bias Pre-Screening:** Personal identifying details (photos, age, gender, address) are automatically masked during initial rubric reviews.\n- **Student & Graduate Launchpad:** Tailored pathways for university co-ops, summer internships, and structured early-career programs.\n- **100% Free for Job Seekers:** Zero placement fees or hidden paywalls for candidates.\n- **Data Sovereignty:** Resumes of non-selected applicants are auto-purged after 30 calendar days, with an unreserved 1-click permanent erasure right.",
    sources: [{ title: "Moseb Platform Overview & Operational Charter", source: "docs/policies/website_policy.md", category: "platform" }],
  },
  retention: {
    reply: "### 📋 Resume Retention & Deletion Policy\n\nUnder our official **Website Data Lifecycle Policy** (`docs/policies/website_policy.md`):\n\n- **30-Day Auto-Purge:** Resumes of non-selected applicants are retained for a maximum of **30 calendar days** (`RETENTION_DAYS = 30`). After 30 days, files in storage buckets, vector chunks in ChromaDB, skill edges in Neo4j, and reasoning logs in Postgres are permanently purged.\n- **One-Click Right to Erasure:** Candidates can delete their account and all attached data at any time from Profile Settings with immediate permanent effect.\n- **Temporary Assistant History:** Note that this chat session is stored temporarily in Redis and automatically expires.",
    sources: [{ title: "Resume Retention & One-Click Deletion Policy", source: "docs/policies/website_policy.md", category: "data_lifecycle" }],
  },
  bias: {
    reply: "### 🛡️ Candidate Anonymity & Bias Guard Policy\n\nMoseb enforces strict **pre-evaluation anonymization** (`docs/policies/website_policy.md`):\n\n- **PII Stripping:** Before any chunking, vector embedding, or scoring, candidate names, photos, age, gender, nationality, postal codes, and contact numbers are stripped.\n- **Anonymous Labels:** Employers review candidates strictly by pseudonymized labels (e.g. *Candidate 1*, *Candidate 2*) until a shortlist decision is made.\n- **Objective Screening:** Only proven competencies, verified years of experience, and rubric compliance are scored.",
    sources: [{ title: "Privacy, Candidate Anonymity & Anti-Bias Guardrail Policy", source: "docs/policies/website_policy.md", category: "privacy" }],
  },
  score: {
    reply: "### 🧠 Explainable 5-Signal Scoring Formula\n\nOur ranking model never uses an opaque black box. Every score (0–100) is calculated via 5 weighted signals:\n\n1. **Must-Have Skill Coverage (35%):** Skills matching the employer's approved rubric.\n2. **Semantic Similarity (25%):** Vector similarity in ChromaDB between job requirements and resume.\n3. **Experience Fit (20%):** Verified duration in relevant roles.\n4. **Education & Certifications (10%):** Degree level and verified certificates.\n5. **Skill-Graph Proximity (10%):** Knowledge graph distance in Neo4j.\n\n> **Verifiable Quotes Guarantee:** A requirement verdict of *met* or *partial* must be supported by an exact quote from the resume; otherwise it is marked *missing*.",
    sources: [{ title: "Explainable AI Scoring & Verifiable Quotes Policy", source: "docs/policies/website_policy.md", category: "evaluation" }],
  },
  delete: {
    reply: "### 🗑️ Right to Erasure & Immediate Deletion\n\nCandidates have the unreserved right to request instantaneous deletion of their account and all associated data at any time via Profile Settings.\n\n- When triggered, all stored resume files, ChromaDB vector chunks, Neo4j graph nodes, profile records, and application histories are permanently and irreversibly destroyed immediately.",
    sources: [{ title: "Data Retention, Auto-Purge & Deletion Policy", source: "docs/policies/website_policy.md", category: "data_lifecycle" }],
  },
  it: {
    reply: "### 💻 Technical IT Screening & AI vs Human Rules\n\nAccording to our knowledge datasets (`data/knowledge/it/it_ai_human_rules.json`):\n\n- **AI-Generated Indicators:** Identifies excessive buzzwords, generic descriptions without dates, repetitive sentence structure, and lack of real-world implementation nuances.\n- **Human-Generated Indicators:** Evaluates specific project context, varied sentence structure, realistic technology pairings, and nuanced technical achievements.\n- **Technology Stacks:** Validates core languages, cloud platforms, containerization, and database competencies.",
    sources: [{ title: "IT AI vs Human CV Screening Rules & Patterns", source: "data/knowledge/it/it_ai_human_rules.json", category: "knowledge_it" }],
  },
  redis: {
    reply: "### ⚡ Temporary Chat Storage (Redis Database)\n\nTo preserve your privacy:\n\n- **Stored in Redis Only:** Conversation history for this Moseb Assistant is stored exclusively in our **Redis database** under ephemeral session keys (`bot:session:{session_id}`).\n- **Automatic Expiration (TTL):** All messages automatically expire and are purged after **24 hours** of inactivity.\n- **No Permanent Logs:** Conversations are never stored in PostgreSQL or persistent relational tables.\n- **Instant Clear:** You can click the **+ New Chat** or **Clear History** button at any moment to delete your session history immediately.",
    sources: [{ title: "Landing Page Assistant Temporary Redis Storage Policy", source: "docs/policies/website_policy.md", category: "chat_assistant" }],
  },
};

export default function PhoneAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // History is hidden by default
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [showSourcesIdx, setShowSourcesIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { theme, toggle } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize unique session ID for temporary Redis storage
  useEffect(() => {
    let sId = sessionStorage.getItem("moseb_bot_session_id");
    if (!sId) {
      sId = "sess_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem("moseb_bot_session_id", sId);
    }
    setSessionId(sId);
  }, []);

  // Fetch temporary history from Redis when session ID is set
  useEffect(() => {
    if (!sessionId) return;
    api.get<{ session_id: string; messages: Message[] }>(`/assistant/history?session_id=${sessionId}`)
      .then((res) => {
        if (res?.messages && res.messages.length > 0) {
          setMessages(res.messages);
        }
      })
      .catch(() => {
        // Backend Redis might be starting up or in offline dev mode
      });
  }, [sessionId]);

  // Listen to custom global event: "open-moseb-assistant"
  useEffect(() => {
    const handleOpen = (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      if (customEvent.detail?.prompt) {
        setTimeout(() => {
          handleSend(customEvent.detail.prompt);
        }, 300);
      }
    };
    window.addEventListener("open-moseb-assistant", handleOpen);
    return () => window.removeEventListener("open-moseb-assistant", handleOpen);
  }, [sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    setInput("");
    setShowHistory(false);
    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.post<{
        session_id: string;
        reply: string;
        sources: SourceItem[];
        history: Message[];
      }>("/assistant/chat", {
        session_id: sessionId || "sess_default",
        message: text,
      });

      if (res?.reply) {
        const assistantMsg: Message = {
          role: "assistant",
          content: res.reply,
          sources: res.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
        return;
      }
    } catch {
      // Graceful fallback to client-side policy retrieval if backend route is unreachable
    }

    // Client-side fallback matching
    setTimeout(() => {
      const q = text.toLowerCase();
      let matched = CLIENT_POLICY_FALLBACKS.about;

      if (q.includes("about") || q.includes("moseb") || q.includes("what is") || q.includes("feature") || q.includes("overview")) {
        matched = CLIENT_POLICY_FALLBACKS.about;
      } else if (q.includes("bias") || q.includes("privacy") || q.includes("anonym") || q.includes("pii") || q.includes("name")) {
        matched = CLIENT_POLICY_FALLBACKS.bias;
      } else if (q.includes("score") || q.includes("formula") || q.includes("weight") || q.includes("signal") || q.includes("ranking")) {
        matched = CLIENT_POLICY_FALLBACKS.score;
      } else if (q.includes("delete") || q.includes("erasure") || q.includes("purge") || q.includes("remove")) {
        matched = CLIENT_POLICY_FALLBACKS.delete;
      } else if (q.includes("it") || q.includes("code") || q.includes("developer") || q.includes("human") || q.includes("cv")) {
        matched = CLIENT_POLICY_FALLBACKS.it;
      } else if (q.includes("redis") || q.includes("temporary") || q.includes("store") || q.includes("history")) {
        matched = CLIENT_POLICY_FALLBACKS.redis;
      } else if (q.includes("retention") || q.includes("resume") || q.includes("30") || q.includes("day")) {
        matched = CLIENT_POLICY_FALLBACKS.retention;
      }

      const fallbackMsg: Message = {
        role: "assistant",
        content: matched.reply,
        sources: matched.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsLoading(false);
    }, 450);
  };

  const handleNewChat = () => {
    const newSessionId = "sess_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    sessionStorage.setItem("moseb_bot_session_id", newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setShowSourcesIdx(null);
    setShowHistory(false);
    setInput("");
    inputRef.current?.focus();
  };

  const handleClearHistory = async () => {
    if (!sessionId) return;
    try {
      await api.del(`/assistant/history?session_id=${sessionId}`);
    } catch {
      // Local ignore
    }
    setMessages([]);
    setShowSourcesIdx(null);
    setShowHistory(false);
  };

  const copyToClipboard = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Helper to render markdown-like lines simply and cleanly
  const renderFormattedText = (content: string) => {
    return content.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-text text-xs sm:text-sm mt-1.5 mb-1 flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        const text = line.replace("- ", "");
        const parts = text.split("**");
        return (
          <li key={idx} className="ml-3 list-disc text-xs text-subtle my-0.5">
            {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-text font-semibold">{p}</strong> : p))}
          </li>
        );
      }
      if (line.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-2 border-[#147D4A] dark:border-[#22C55E] pl-2.5 my-1.5 text-[11px] italic text-subtle bg-[#147D4A]/5 py-1 rounded-r">
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, "");
        const parts = text.split("**");
        return (
          <li key={idx} className="ml-3 list-decimal text-xs text-subtle my-0.5">
            {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-text font-semibold">{p}</strong> : p))}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-1" />;
      }
      const parts = line.split("**");
      return (
        <p key={idx} className="text-xs text-subtle leading-relaxed">
          {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-text font-semibold">{p}</strong> : p))}
        </p>
      );
    });
  };

  return (
    <>
      {/* =========================================================================
          1. COMPACT LAUNCHER BUTTON (GREEN, SMALL & SIMPLE)
         ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 cursor-pointer bg-surface/90 hover:bg-surface border border-border/80 text-text px-3 py-1 rounded-full shadow-md text-xs font-medium backdrop-blur-md transition-all duration-200 hover:scale-105"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#147D4A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#147D4A]"></span>
            </span>
            <span>Ask Moseb AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Moseb Assistant" : "Open Moseb Assistant"}
          className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-lg focus:outline-none ${
            isOpen
              ? "w-9 h-9 bg-surface border border-border text-subtle hover:text-text hover:rotate-90"
              : "w-11 h-11 bg-[#147D4A] hover:bg-[#11693e] dark:bg-[#1EB368] dark:hover:bg-[#189656] hover:scale-105 active:scale-95 text-white"
          }`}
        >
          {isOpen ? (
            <ChevronDown size={18} strokeWidth={2.4} />
          ) : (
            <div className="relative flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19V6.5L12 13.5L20 6.5V19" />
                <path d="M12 4.5L16 8.5" opacity="0.6" strokeWidth="2" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* =========================================================================
          2. COMPACT, PHONE-RESPONSIVE AI ASSISTANT WINDOW (CLEAN, NO RECOM-QUESTIONS)
         ========================================================================= */}
      {isOpen && (
        <div
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-5 z-50 w-auto sm:w-[380px] md:w-[400px] h-[520px] max-h-[82vh] flex flex-col rounded-2xl border border-border/80 bg-surface/95 dark:bg-surface/90 backdrop-blur-2xl shadow-2xl overflow-hidden animate-fade-up text-text"
          style={{ filter: "drop-shadow(0 20px 35px rgba(0, 0, 0, 0.35))" }}
        >
          {/* ----------------- COMPACT HEADER ----------------- */}
          <div className="px-3.5 py-2.5 border-b border-border/60 bg-surface/85 backdrop-blur-md flex items-center justify-between shrink-0">
            {/* Assistant Identity */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#147D4A] text-white shadow-sm shrink-0">
                <IconA size={16} />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-text leading-tight">Moseb AI</h3>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1">
              {/* + New Chat Button (Clean, Small) */}
              <button
                type="button"
                onClick={handleNewChat}
                title="New chat"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-subtle hover:text-text hover:bg-muted/70 transition"
              >
                <Plus size={13} strokeWidth={2.4} />
                <span className="hidden xs:inline">New</span>
              </button>

              {/* History Toggle (Hidden by default, user can toggle overlay if needed) */}
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                title={showHistory ? "Hide history" : "View history"}
                className={`p-1.5 rounded-md transition ${
                  showHistory
                    ? "bg-[#147D4A]/10 text-[#147D4A] dark:text-[#22C55E]"
                    : "text-subtle hover:text-text hover:bg-muted/70"
                }`}
              >
                <History size={14} />
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggle}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                className="p-1.5 rounded-md text-subtle hover:text-text hover:bg-muted/70 transition"
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-md text-subtle hover:text-text hover:bg-muted/70 transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ----------------- HIDDEN HISTORY OVERLAY DRAWER ----------------- */}
          {showHistory && (
            <div className="border-b border-border/60 bg-muted/70 p-3 text-xs space-y-2 animate-fade-down shrink-0">
              <div className="flex items-center justify-between text-[11px] font-bold text-subtle uppercase tracking-wider">
                <span>Recent Topics</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-[10px] text-bad hover:underline font-normal normal-case"
                >
                  <Trash2 size={11} />
                  <span>Clear</span>
                </button>
              </div>

              <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {HISTORY_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSend(topic.prompt)}
                    className="w-full text-left p-1.5 rounded-md hover:bg-surface text-subtle hover:text-text text-[11px] truncate flex items-center gap-1.5 transition-colors"
                  >
                    <FileText size={11} className="shrink-0 text-[#147D4A] dark:text-[#22C55E]" />
                    <span className="truncate">{topic.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- CLEAN CHAT MESSAGES AREA (NO PROMPT CHIPS) ----------------- */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar text-xs">
            {/* Clean, Minimalist Welcome State (No recommendation questions) */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#147D4A]/10 text-[#147D4A] dark:text-[#22C55E] border border-[#147D4A]/20 mb-3 shadow-sm">
                  <IconA size={24} glow />
                </div>
                <h4 className="text-sm font-bold text-text">How can I help you today?</h4>
                <p className="mt-1 text-[11px] text-subtle max-w-[240px] leading-relaxed">
                  Ask about job opportunities, verified skills scoring, or platform policies.
                </p>
              </div>
            )}

            {/* Message Stream */}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`flex items-start gap-2 max-w-[92%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#147D4A] text-white shrink-0 shadow-sm mt-0.5">
                      <IconA size={12} />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div
                      className={`rounded-2xl px-3 py-2 leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-[#147D4A] text-white rounded-tr-none text-xs"
                          : "bg-surface border border-border/80 text-text rounded-tl-none"
                      }`}
                    >
                      {m.role === "user" ? (
                        <p className="text-xs font-medium">{m.content}</p>
                      ) : (
                        <div>
                          {renderFormattedText(m.content)}

                          {/* Citations & Copy */}
                          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between gap-1 text-[10px]">
                            {m.sources && m.sources.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowSourcesIdx(showSourcesIdx === idx ? null : idx)}
                                className="inline-flex items-center gap-1 font-semibold text-[#147D4A] dark:text-[#22C55E] hover:underline"
                              >
                                <BookOpen size={10} />
                                <span>{m.sources.length} Verified Citation{m.sources.length > 1 ? "s" : ""}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => copyToClipboard(m.content, idx)}
                              title="Copy answer"
                              className="inline-flex items-center gap-1 text-subtle hover:text-text transition-colors ml-auto"
                            >
                              {copiedIdx === idx ? (
                                <>
                                  <Check size={10} className="text-emerald-500" />
                                  <span className="text-emerald-500 text-[9px]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={10} />
                                  <span className="text-[9px]">Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Expanded Citations */}
                          {showSourcesIdx === idx && m.sources && m.sources.length > 0 && (
                            <div className="mt-1.5 space-y-1 bg-muted/60 p-2 rounded-lg border border-border/50 text-[9px]">
                              {m.sources.map((s, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-1 text-subtle">
                                  <CheckCircle2 size={9} className="text-emerald-500 shrink-0" />
                                  <span className="font-semibold text-text">{s.title}:</span>
                                  <code className="text-[#147D4A] dark:text-[#22C55E] font-mono text-[9px]">
                                    {s.source}
                                  </code>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] text-subtle mt-0.5 px-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                      {m.timestamp || ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#147D4A] text-white shrink-0 shadow-sm mt-0.5">
                  <IconA size={12} />
                </div>
                <div className="bg-surface border border-border/80 rounded-2xl rounded-tl-none px-3 py-2 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#147D4A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#147D4A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#147D4A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ----------------- COMPACT INPUT BAR ----------------- */}
          <div className="p-2.5 border-t border-border/60 bg-surface/90 backdrop-blur-md shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 focus-within:border-[#147D4A] dark:focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#147D4A]/20 transition-all shadow-sm"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Moseb AI a question..."
                className="flex-1 bg-transparent text-xs text-text placeholder:text-subtle focus:outline-none"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send"
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                  input.trim() && !isLoading
                    ? "bg-[#147D4A] text-white shadow-sm hover:scale-105 active:scale-95"
                    : "bg-surface text-subtle/40 cursor-not-allowed"
                }`}
              >
                <Send size={11} className="ml-0.2" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
