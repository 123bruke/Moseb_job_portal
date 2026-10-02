Extract a structured resume from the document below. Return ONLY JSON with exactly these keys:
personal (name, email, phone, location, nationality, links), headline, summary, skills (list of strings),
experience (list of title, company, start, end, summary; dates as YYYY-MM or YYYY, end may be present),
education (list of institution, degree, field, level, start, end; level is one of high_school, diploma, bachelor, master, phd),
certificates (list of strings), languages (list of strings), projects (list of name, description, skills),
domain (one of IT, engineering, medicine, accounting, business, design, other), parse_confidence (0 to 1).
Use null or empty lists when something is absent. Never invent facts.

<document>
{text}
</document>
