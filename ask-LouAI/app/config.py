from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# The marketplace project uses a single .env at its root for both the
# Vite frontend and the Node API (see ../../.env.example). Point here
# instead of duplicating SUPABASE_URL / SUPABASE_SECRET_KEY in a second
# .env under ask-LouAI/, which would just be a second place to keep in
# sync.
ROOT_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    # Same Supabase project as the rest of the marketplace app. Server-side
    # only — never expose SUPABASE_SECRET_KEY to a browser.
    supabase_url: str
    supabase_secret_key: str

    # Local, offline sentence-transformers model (downloaded once from
    # Hugging Face on first run, then cached under ~/.cache/torch).
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    # How long a listing's knowledge base stays cached in memory before a
    # question triggers a fresh reload from Supabase.
    kb_cache_ttl_seconds: int = 300

    # Minimum cosine similarity for an answer to be reported as "confident".
    min_confidence: float = 0.35

    # Comma-separated list of origins allowed to call this API.
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=ROOT_ENV_FILE, extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
