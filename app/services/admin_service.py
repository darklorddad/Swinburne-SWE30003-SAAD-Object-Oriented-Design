"""
Service layer for administrator-specific logic.
"""
from typing import List, Optional
from uuid import UUID

from supabase import Client

from app.models.park import Park, ParkCreate, ParkUpdate


async def create_park(db: Client, park: ParkCreate) -> Park:
    """Creates a new park in the database."""
    response = db.table("parks").insert(park.dict()).execute()
    created_park_data = response.data[0]
    return Park(**created_park_data)


async def get_parks(db: Client) -> List[Park]:
    """Fetches all parks from the database."""
    response = db.table("parks").select("*").execute()
    parks = [Park(**park_data) for park_data in response.data]
    return parks


async def get_park_by_id(db: Client, park_id: UUID) -> Optional[Park]:
    """Fetches a single park by its ID."""
    response = db.table("parks").select("*").eq("id", str(park_id)).single().execute()
    if response.data:
        return Park(**response.data)
    return None


async def update_park(
    db: Client, park_id: UUID, park_update: ParkUpdate
) -> Optional[Park]:
    """Updates an existing park in the database."""
    response = (
        db.table("parks")
        .update(park_update.dict(exclude_unset=True))
        .eq("id", str(park_id))
        .execute()
    )
    if response.data:
        return Park(**response.data[0])
    return None


async def delete_park(db: Client, park_id: UUID) -> bool:
    """Deletes a park from the database."""
    response = db.table("parks").delete().eq("id", str(park_id)).execute()
    return bool(response.data)
