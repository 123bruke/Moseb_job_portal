from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Level = Literal["none", "high_school", "diploma", "bachelor", "master", "phd"]


class MeUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=120)
    nationality: str | None = Field(None, max_length=80)
    phone: str | None = Field(None, max_length=40)
    location: str | None = Field(None, max_length=120)


class CandidateProfileIn(BaseModel):
    headline: str | None = Field(None, max_length=160)
    years_experience: float = Field(0, ge=0, le=60)
    domain: str | None = None
    education_level: Level | None = None
    languages: list[str] = []
    expected_salary: float | None = Field(None, ge=0)
    skills: list[str] = Field(default_factory=list, max_length=80)


class CompanyIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    industry: str | None = None
    website: str | None = None
    size: str | None = None
    logo_url: str | None = None
    brand_color: str = Field("#4f46e5", pattern=r"^#[0-9a-fA-F]{6}$")


class JobIn(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=10, max_length=20000)
    domain: str | None = None
    min_experience: float = Field(0, ge=0, le=40)
    education_required: Level | None = None
    location: str | None = None
    seats: int = Field(1, ge=1, le=500)
    deadline: datetime | None = None
    required_skills: list[str] = []


class MustSkill(BaseModel):
    skill: str
    min_years: float | None = None


class Weights(BaseModel):
    skills: float = 35
    semantic: float = 25
    experience: float = 20
    education: float = 10
    graph: float = 10


class HardFilters(BaseModel):
    max_missing_must_have: int = 0
    enforce_min_years: bool = True
    location: str | None = None
    work_authorization_required: bool = False


class EducationReq(BaseModel):
    min_level: Level = "none"
    fields: list[str] = []


class Rubric(BaseModel):
    must_have: list[MustSkill]
    nice_to_have: list[str] = []
    min_years: float = Field(0, ge=0)
    education: EducationReq = EducationReq()
    certifications: list[str] = []
    other_requirements: list[str] = []
    domain: str = ""
    weights: Weights = Weights()
    hard_filters: HardFilters = HardFilters()
    shortlist_size: int = Field(5, ge=1, le=100)

    @field_validator("weights")
    @classmethod
    def sum_100(cls, w: Weights) -> Weights:
        if abs(sum(w.model_dump().values()) - 100) > 0.5:
            raise ValueError("weights must add up to 100")
        return w


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[dict] = Field(default_factory=list, max_length=20)
    job_id: str | None = None


class OverrideIn(BaseModel):
    application_id: str
    new_rank: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


class EventIn(BaseModel):
    job_id: str
    type: Literal["view", "save", "apply"]


class RoleIn(BaseModel):
    role: Literal["candidate", "company", "admin"]
