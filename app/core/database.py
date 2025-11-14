from supabase import Client, create_client

from app.core.config import get_settings

settings = get_settings()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
