import httpx

from .config import settings


class ListingNotFoundError(Exception):
    """Raised when a listing_id doesn't match any row in Supabase."""


async def fetch_listing(listing_id: str) -> dict:
    """Fetch a single listing row straight from Supabase's PostgREST API.

    Uses the service-role key server-side (bypasses RLS), the same way
    server/lib/supabaseAdmin.ts does for the Node API.
    """
    url = f"{settings.supabase_url}/rest/v1/listings"
    headers = {
        "apikey": settings.supabase_secret_key,
        "Authorization": f"Bearer {settings.supabase_secret_key}",
    }
    params = {"id": f"eq.{listing_id}", "select": "*", "limit": "1"}

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        rows = response.json()

    if not rows:
        raise ListingNotFoundError(listing_id)
    return rows[0]
