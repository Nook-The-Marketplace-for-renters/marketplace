import os

# Dummy values so app.config.Settings() can be constructed during tests
# without a real .env / Supabase project. Nothing here makes a network call.
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SECRET_KEY", "test-secret-key")
