"""
Service layer for public-facing park and ticket type logic.
"""
from typing import List, Optional
from uuid import UUID

from supabase import Client

from app.models.park import Park
from app.models.ticket import TicketType


async def get_parks(db: Client) -> List[Park]:
    """Fetches all parks from the database."""
    response = db.table("parks").select("*").order("name").execute()
    parks = [Park(**park_data) for park_data in response.data]
    return parks


async def get_park_by_id(db: Client, park_id: UUID) -> Optional[Park]:
    """Fetches a single park by its ID."""
    response = db.table("parks").select("*").eq("id", str(park_id)).single().execute()
    if response.data:
        return Park(**response.data)
    return None


async def get_ticket_types_for_park(db: Client, park_id: UUID) -> List[TicketType]:
    """Fetches all ticket types for a specific park."""
    response = (
        db.table("ticket_types")
        .select("*")
        .eq("park_id", str(park_id))
        .order("price")
        .execute()
    )
    return [TicketType(**tt) for tt in response.data]
