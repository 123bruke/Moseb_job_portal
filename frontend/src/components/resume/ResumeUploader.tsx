import { useRef, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { IconTile } from "@/components/marketing/Icon";

const MAX_MB = 5;
const OK = [".pdf", ".docx", ".txt"];

/** Client-side pre-checks only for UX. The server re-validates type (magic bytes), size, pages and malware. */
export default function ResumeUploader({ onFile, progress }: { onFile: (f: File | null) => void; progress?: "idle" | "uploading" | "parsing" | "done" }) {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);

  const pick = (f: File | undefined) => {
    setErr("");
    if (!f) return;
    if (!OK.some((e) => f.name.toLowerCase().endsWith(e))) return setErr("Use a PDF, DOCX or TXT file.");
    if (f.size > MAX_MB * 1024 * 1024) return setErr(`File is larger than ${MAX_MB} MB.`);
    setFile(f); onFile(f);
  };
  const tone = progress === "done" ? "good" : progress === "idle" || !progress ? "neutral" : "brand";

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
      className={`group glass relative p-8 text-center transition duration-500 ${
        over ? "-translate-y-0.5 border-primary/70 bg-primary/[0.06] shadow-glow" : "hover-lift"
      }`}
    >
      <input ref={ref} type="file" accept={OK.join(",")} hidden onChange={(e) => pick(e.target.files?.[0])} />

      {file ? (
        <div className="space-y-3">
          <IconTile icon={FileText} size={46} className="mx-auto" />
          <p className="text-sm font-medium text-text">
            {file.name} <span className="text-subtle">({(file.size / 1024).toFixed(0)} KB)</span>
          </p>
          {progress && (
            <Badge tone={tone} className="mx-auto">
              {{ idle: "Ready", uploading: "Uploading…", parsing: "Reading your resume…", done: "Processed" }[progress]}
            </Badge>
          )}
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { setFile(null); onFile(null); }}>
            Remove
          </Button>
        </div>
      ) : (
        <>
          <IconTile icon={UploadCloud} size={52} className="mx-auto" />
          <p className="mt-4 text-sm font-medium text-text">Drag your resume here</p>
          <p className="mt-1 text-xs text-subtle">PDF, DOCX or TXT · max {MAX_MB} MB</p>
          <Button variant="outline" icon={UploadCloud} className="mt-5" onClick={() => ref.current?.click()}>
            Choose file
          </Button>
        </>
      )}
      {err && <p role="alert" className="mt-3 text-sm text-bad">{err}</p>}
    </div>
  );
}