Convert the job posting below into a hiring rubric. Return ONLY JSON with exactly these keys:
must_have (list of skill and optional min_years), nice_to_have (list of skill names), min_years (number),
education (min_level one of none, high_school, diploma, bachelor, master, phd; fields list), certifications (list),
other_requirements (list of short free-text requirements that are not skills), domain (IT, engineering, medicine, accounting, business, design, other),
weights (skills, semantic, experience, education, graph; must add up to 100; default 35, 25, 20, 10, 10).
Use short canonical skill names such as Python, JavaScript, PostgreSQL. Only include requirements that are actually stated.

Job title: {title}
Structured fields from the company: {fields}

<document>
{text}
</document>
