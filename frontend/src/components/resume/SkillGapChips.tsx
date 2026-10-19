import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui";

export default function SkillGapChips({ have, missing }: { have?: string[]; missing?: string[] }) {
  const empty = !have?.length && !missing?.length;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {have?.map((s) => (
        <Badge key={s} tone="good" icon={Check} className="hover:-translate-y-0.5 hover:shadow-glow">{s}</Badge>
      ))}
      {missing?.map((s) => (
        <Badge key={s} tone="bad" icon={X} className="hover:-translate-y-0.5 hover:shadow-glow">{s}</Badge>
      ))}
      {empty && <span className="text-sm text-subtle">Nothing to show yet.</span>}
    </div>
  );
}