# Moseb Smart Resume Checker v2 — Official Website Policies & Governance Documentation

> **Version:** 2.0.0  
> **Effective Date:** October 2026  
> **Scope:** Smart Resume Checker Portal, Candidate Evaluation Engine, Employer Portal, and Public API Services  
> **Source Directory:** `docs/policies/website_policy.md` and `data/`

---

## 1. Executive Summary & Platform Purpose
Smart Resume Checker v2 (Moseb Job Portal) is an explainable, bias-guarded hiring intelligence platform. The platform connects ambitious candidates with hiring companies through objective, verifiable, and transparent algorithmic evaluation. Unlike legacy ATS (Applicant Tracking Systems) that function as opaque black boxes, Moseb enforces strict privacy guardrails, evidence-grounded scoring, prompt-injection defenses, and auditable human oversight.

---

## 2. Privacy, Candidate Anonymity & Anti-Bias Guardrail Policy
### 2.1 Anonymization Invariant
All candidate resumes entering the processing pipeline are strictly anonymized **before** parsing, chunking, vector embedding, or LLM evaluation.
- **Stripped Attributes:** 
  - Full legal name and preferred names
  - Profile photographs, avatars, and visual likenesses
  - Age, birthdate, and graduation years if used to infer age
  - Gender, marital status, and family status
  - Nationality, citizenship, race, ethnicity, and postal code / residential address
  - Personal contact details (phone number, personal email, social media links)
- **Anonymous Identification:**
  - In company applicant feeds and ranking tables, candidates are identified exclusively by pseudonymized labels (`Candidate 1`, `Candidate 2`, `Candidate 3`).
  - Legal identity and contact details are disclosed to the hiring company **only after** an explicit candidate shortlisting action is recorded.

### 2.2 Objective Screening Guarantee
Screening algorithms evaluate competencies, verified experience, demonstrable technical skills, and educational qualifications strictly against an employer-approved job rubric.

---

## 3. Data Retention, Auto-Purge & Deletion Policy
### 3.1 The 30-Day Retention Window (`RETENTION_DAYS = 30`)
- Resumes of non-selected applicants are retained for a maximum of **30 calendar days** following the closing of an application cycle or rejection.
- Upon expiration of the 30-day window, the scheduled background worker (`app.workers.scheduler`) executes an automatic, permanent purge:
  - Resume source files are deleted from private cloud storage buckets (`storage_bucket`).
  - Text chunks and vector embeddings are deleted from ChromaDB (`chroma_repo.delete_where`).
  - Candidate skill nodes and relational links are pruned from Neo4j (`neo4j_repo`).
  - Parsed application traces and temporary reasoning logs are expunged from the PostgreSQL database.

### 3.2 Right to Erasure (One-Click Deletion)
- Candidates have the unreserved right to request instantaneous deletion of their account and all associated data at any time via Profile Settings.
- When triggered, all stored files, vector chunks, profile records, and application histories are permanently and irreversibly destroyed immediately.

---

## 4. AI Explainability, Verifiable Evidence & Scoring Rubric Policy
### 4.1 Hybrid 5-Signal Scoring Formula (Sum = 100%)
Every candidate is evaluated using a calibrated, multi-signal formula:
1. **Must-Have Skill Coverage (35%):** Exact and related competencies required by the company's approved job rubric, including minimum years of hands-on experience.
2. **Semantic Similarity (25%):** Meaning-level cosine similarity between the job description and candidate resume vectors stored in ChromaDB.
3. **Experience Fit (20%):** Verified duration of relevant industry experience against the minimum requested by the position.
4. **Education & Certifications (10%):** Degree level, relevant field of study, and recognized professional certifications.
5. **Skill-Graph Proximity (10%):** Proximity and transferable skill connectivity in the Neo4j knowledge graph.

### 4.2 Verifiable Quote Requirement
- The AI evaluation engine cannot award a `met` or `partial` verdict without citing an **exact, verifiable quote** directly extracted from the applicant's resume.
- Any model verdict lacking an exact source quote is automatically downgraded to `missing`.
- Hallucinated or speculative skills are strictly rejected by the scoring validator.

---

## 5. Security, Prompt-Injection Defence & Malware Scanning Policy
### 5.1 Untrusted Document Wrapping
- All parsed resume text, uploaded files, and job descriptions are categorized as untrusted user data.
- During AI analysis, document content is encapsulated in strict `<document>` containment tags with explicit system instructions prohibiting execution of enclosed commands or prompt-injection attempts.

### 5.2 Antivirus & File Safety
- All incoming uploads (PDF, DOCX, TXT) undergo antivirus inspection via ClamAV before parsing.
- File sizes are capped at 5 MB (`max_resume_mb`), and page lengths are limited to 10 pages (`max_resume_pages`).
- Executable files, encrypted archives, and macro-enabled documents are rejected.

---

## 6. Human-in-the-Loop Override & Immutable Audit Trail Policy
### 6.1 Decision Support, Not Automated Hiring
- Algorithmic ranking serves strictly as decision support. The platform does not make unilateral hiring or rejection determinations.
- Human recruiters and hiring managers make the final shortlisting and hiring calls.

### 6.2 Audited Overrides
- Hiring managers have the authority to override candidate rankings or adjust candidate status.
- Every manual override requires a mandatory justification reason.
- Overrides, rubric modifications, and status changes are permanently recorded in an immutable audit log (`admin/audit`) visible to compliance officers.

---

## 7. Knowledge Base & Domain Resume Standards
The platform draws domain-specific criteria from curated industry datasets located in `data/knowledge/`:
- **Information Technology (`data/knowledge/it/`):**
  - **AI vs. Human Identification Heuristics (`it_ai_human_rules.json`):** Evaluates excessive buzzword frequency, formulaic achievement phrasing, lack of specific implementation dates, code comment ratios, and edge-case handling.
  - **Technical Stack Standards (`tech_cv_database_v3.json`, `v4.json`):** Full-stack frameworks, database engineering, cloud deployment, and CI/CD competencies.
- **Engineering (`data/knowledge/engineering/`):**
  - Core engineering methodologies, CAD/CAM specifications, structural analysis, and mechanical/electrical compliance standards.
- **Accounting & Financial Services (`data/knowledge/accounting/`):**
  - GAAP/IFRS standards, financial auditing, tax regulations, and ERP software capabilities.
- **Healthcare & Medicine (`data/knowledge/medicine/`):**
  - Clinical credentials, regulatory compliance, patient care management, and health informatics.

---

## 8. Ephemeral Chat Assistant & Temporary Redis Storage Policy
- The Moseb AI Assistant on the landing page provides instant guidance on website policies, privacy rights, and screening standards.
- **Temporary Storage in Redis:**
  - Chat session histories are saved exclusively in the Redis database under ephemeral session keys (`bot:session:{session_id}:messages`).
  - Session data has an automatic Time-to-Live (TTL) expiration window (24 hours).
  - Conversation histories are completely temporary and never persisted to relational databases or permanent storage.
  - Users can click "Clear Chat" at any time to purge their Redis conversation session immediately.
