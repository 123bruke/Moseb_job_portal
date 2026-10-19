import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { Button, ErrorBox, Input, Spinner } from "@/components/ui";
import { api } from "@/lib/api";

interface Msg { role: "user" | "assistant"; content: string }

/** RAG chatbot. Candidates: career help. Companies: pass jobId to ask about that job's (anonymous) candidates. */
export default function Chatbot({ jobId, placeholder }: { jobId?: string; placeholder?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const send = useMutation({
    mutationFn: (message: string) => api.post<{ reply: string }>("/chat", { message, history: msgs, job_id: jobId }),
    onSuccess: (r) => { setMsgs((m) => [...m, { role: "assistant", content: r.reply }]); setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50); },
  });
  const submit = () => {
    const t = text.trim();
    if (!t || send.isPending) return;
    setMsgs((m) => [...m, { role: "user", content: t }]);
    setText("");
    send.mutate(t);
  };
  return (
    <div className="glass flex h-[30rem] flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
        <span className="icon-tile" style={{ width: 30, height: 30, borderRadius: 10 }}>
          <Sparkles size={15} strokeWidth={2.2} aria-hidden />
        </span>
        <p className="text-sm font-medium text-text">Ask AI</p>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-subtle">
          <Bot size={13} aria-hidden /> answers cite evidence
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="icon-tile" style={{ width: 48, height: 48 }}>
              <Bot size={23} strokeWidth={1.9} aria-hidden />
            </span>
            <p className="max-w-xs text-sm text-subtle">{placeholder ?? "Ask me anything."}</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`group flex max-w-[85%] gap-2.5 ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition duration-300 group-hover:scale-110 ${
              m.role === "user" ? "bg-brand text-primary-fg" : "bg-gradient-to-br from-grad-a/20 to-grad-c/20 text-primary"
            }`}>
              {m.role === "user" ? <UserRound size={14} aria-hidden /> : <Bot size={14} aria-hidden />}
            </span>
            <div className={`whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm shadow-sm transition duration-300 ${
              m.role === "user" ? "bg-brand text-primary-fg" : "border border-border/60 bg-surface/70 text-text"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {send.isPending && <Spinner label="Thinking…" />}
        <div ref={end} />
      </div>

      <div className="border-t border-border/60 p-3">
        <ErrorBox error={send.error} />
        <div className="mt-2 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Type your question…" maxLength={2000} />
          <Button icon={Send} onClick={submit} disabled={send.isPending}>Send</Button>
        </div>
      </div>
    </div>
  );
}