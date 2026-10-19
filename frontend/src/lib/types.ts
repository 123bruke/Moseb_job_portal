export type Role = "candidate" | "company" | "admin";
export interface Me { id: string; role: Role; full_name: string; email: string; nationality?: string; phone?: string; location?: string }
export interface Job {
  id: string; title: string; description: string; domain?: string; min_experience: number; education_required?: string;
  location?: string; seats: number; deadline?: string; status: string; company_name: string; logo_url?: string; brand_color?: string;
  rubric_json?: Rubric; applicants?: number; rubric_status?: string; match_score?: number; explanation?: string; matched_skills?: string[];
}
export interface Weights { skills: number; semantic: number; experience: number; education: number; graph: number }
export interface Rubric {
  must_have: { skill: string; min_years?: number }[]; nice_to_have: string[]; min_years: number;
  education: { min_level: string; fields: string[] }; certifications: string[]; other_requirements: string[]; domain: string;
  weights: Weights;
  hard_filters: { max_missing_must_have: number; enforce_min_years: boolean; location: string | null; work_authorization_required: boolean };
  shortlist_size: number;
}
export interface Requirement { requirement: string; kind: string; importance: string; status: "met" | "partial" | "missing"; quote: string }
export interface RankRow {
  application_id: string; label: string; status: string; total: number; rank: number | null; eligible: boolean;
  ineligible_reasons: string[]; confidence: number;
  breakdown_json: { contributions: Record<string, number>; verification: Requirement[];
    explanation: { strengths: string[]; gaps: string[]; risk_flags: string[]; reasoning: string; recommendation: string } };
}
export interface Trace { step: number; name: string; content: string; evidence_refs: string[]; created_at: string }
export interface AppRow { id: string; status: string; created_at: string; job_id: string; title: string; company_name: string }
