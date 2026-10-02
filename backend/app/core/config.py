"""Environment-based configuration. No secrets live in code."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "dev"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    database_url: str = ""
    storage_bucket: str = "resumes"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_embed_model: str = "gemini-embedding-001"
    gemini_daily_call_cap: int = 2000

    chroma_host: str = "chromadb"
    chroma_port: int = 8000
    neo4j_uri: str = "bolt://neo4j:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = ""
    redis_url: str = "redis://redis:6379/0"

    yolo_weights_path: str = ""
    retention_days: int = 30
    max_resume_mb: int = 5
    max_resume_pages: int = 10
    clamav_host: str = ""
    cors_origins: str = Field(default="http://localhost:5173")
    knowledge_dir: str = "/data/knowledge"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
