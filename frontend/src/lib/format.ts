export const pct = (n: number) => `${Math.round(n)}%`;
export const shortDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");
export const humanize = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
export const parseSkills = (s: string) => Array.from(new Set(s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean)));
export const weightsTotal = (w: Record<string, number>) => Object.values(w).reduce((a, b) => a + b, 0);
