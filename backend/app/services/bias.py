"""Bias guard: the scoring agent never sees name, photo, age, gender, nationality (or contact data).

`sanitize_resume` strips identity fields from the structured resume and redacts any leftovers in text."""
import re

IDENTITY_FIELDS = {
    "name", "full_name", "first_name", "last_name", "photo", "photo_url", "image", "age", "date_of_birth",
    "dob", "birth_date", "gender", "sex", "nationality", "citizenship", "marital_status", "religion",
    "email", "phone", "address", "location", "linkedin", "github", "website", "personal", "contact", "personal_details",
}
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE = re.compile(r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)")
_URL = re.compile(r"https?://\S+|(?:www\.)\S+|linkedin\.com/\S+|github\.com/\S+", re.I)
_GENDER = re.compile(r"\b(?:gender|sex|age|nationality|marital status|date of birth|dob)\s*[:\-]\s*[^\n,;]+", re.I)
_PRONOUNS = re.compile(r"\b(?:he/him|she/her|they/them)\b", re.I)


def identity_terms(structured: dict) -> list[str]:
    p = structured.get("personal") or {}
    terms = [p.get("name"), p.get("full_name")]
    if p.get("name"):
        terms += str(p["name"]).split()
    return [t for t in terms if t and len(t) > 2]


def redact_text(text: str, terms: list[str] | None = None) -> str:
    out = _EMAIL.sub("[email]", text)
    out = _URL.sub("[link]", out)
    out = _GENDER.sub("[redacted]", out)
    out = _PRONOUNS.sub("[redacted]", out)
    out = _PHONE.sub("[phone]", out)
    for t in sorted(terms or [], key=len, reverse=True):
        out = re.sub(re.escape(t), "[candidate]", out, flags=re.I)
    return out


def sanitize_resume(structured: dict) -> dict:
    """Return a copy with identity fields removed at every level and free text redacted."""
    terms = identity_terms(structured)

    def walk(v):
        if isinstance(v, dict):
            return {k: walk(x) for k, x in v.items() if k.lower() not in IDENTITY_FIELDS}
        if isinstance(v, list):
            return [walk(x) for x in v]
        if isinstance(v, str):
            return redact_text(v, terms)
        return v

    return walk(structured)
