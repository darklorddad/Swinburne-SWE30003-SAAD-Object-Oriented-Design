"""
Service layer for administrator-specific logic.
"""
from collections import defaultdict
from typing import List, Optional
from uuid import UUID

from supabase import Client

from app.models.park import Park, ParkCreate, ParkUpdate
from app.models.report import ParkStatistic, VisitorStatistics
from app.models.ticket import TicketType, TicketTypeCreate, TicketTypeUpdate


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


async def create_ticket_type(
    db: Client, ticket_type_in: TicketTypeCreate, park_id: UUID
) -> TicketType:
    """Creates a new ticket type for a park."""
    park = await get_park_by_id(db, park_id)
    if not park:
        raise ValueError("Park not found")

    data = ticket_type_in.dict()
    data["park_id"] = str(park_id)
    response = db.table("ticket_types").insert(data).execute()
    return TicketType(**response.data[0])


async def get_ticket_types_for_park(db: Client, park_id: UUID) -> List[TicketType]:
    """Fetches all ticket types for a specific park."""
    response = (
        db.table("ticket_types").select("*").eq("park_id", str(park_id)).execute()
    )
    return [TicketType(**tt) for tt in response.data]


async def update_ticket_type(
    db: Client,
    park_id: UUID,
    ticket_type_id: UUID,
    ticket_type_update: TicketTypeUpdate,
) -> Optional[TicketType]:
    """Updates an existing ticket type, ensuring it belongs to the correct park."""
    # First, verify the ticket type exists and belongs to the park.
    verify_response = (
        db.table("ticket_types")
        .select("id")
        .eq("id", str(ticket_type_id))
        .eq("park_id", str(park_id))
        .single()
        .execute()
    )
    if not verify_response.data:
        return None

    update_data = ticket_type_update.dict(exclude_unset=True)
    if not update_data:
        # If nothing to update, fetch full data and return
        get_response = (
            db.table("ticket_types")
            .select("*")
            .eq("id", str(ticket_type_id))
            .single()
            .execute()
        )
        return TicketType(**get_response.data) if get_response.data else None

    response = (
        db.table("ticket_types")
        .update(update_data)
        .eq("id", str(ticket_type_id))
        .execute()
    )
    if response.data:
        return TicketType(**response.data[0])
    return None


async def delete_ticket_type(db: Client, park_id: UUID, ticket_type_id: UUID) -> bool:
    """Deletes a ticket type, ensuring it belongs to the correct park."""
    response = (
        db.table("ticket_types")
        .delete()
        .eq("id", str(ticket_type_id))
        .eq("park_id", str(park_id))
        .execute()
    )
    return bool(response.data)


async def get_visitor_statistics(db: Client) -> VisitorStatistics:
    """
    Generates a report on visitor statistics, including revenue and ticket sales.

    This report considers all non-cancelled orders as valid for statistics.
    """
    # Fetch all non-cancelled orders with their items and related park info
    response = (
        db.table("orders")
        .select(
            "status, order_items(quantity, price_at_purchase, ticket_types(park_id, parks(name)))"
        )
        .neq("status", "cancelled")
        .execute()
    )

    if not response.data:
        return VisitorStatistics(
            total_revenue=0, total_tickets_sold=0, revenue_by_park=[]
        )

    total_revenue = 0.0
    total_tickets_sold = 0
    park_stats_raw = defaultdict(lambda: {"revenue": 0.0, "tickets": 0, "name": ""})

    for order in response.data:
        for item in order["order_items"]:
            # Ensure nested data exists before processing
            if item.get("ticket_types") and item["ticket_types"].get("parks"):
                park_id = item["ticket_types"]["park_id"]
                park_name = item["ticket_types"]["parks"]["name"]
                quantity = item["quantity"]
                price = item["price_at_purchase"]
                revenue = quantity * price

                total_revenue += revenue
                total_tickets_sold += quantity

                park_stats_raw[park_id]["revenue"] += revenue
                park_stats_raw[park_id]["tickets"] += quantity
                park_stats_raw[park_id]["name"] = park_name

    revenue_by_park = [
        ParkStatistic(
            park_id=pid,
            park_name=stats["name"],
            total_revenue=stats["revenue"],
            tickets_sold=stats["tickets"],
        )
        for pid, stats in park_stats_raw.items()
    ]

    # Sort the park statistics by park name for consistent ordering
    revenue_by_park.sort(key=lambda p: p.park_name)

    return VisitorStatistics(
        total_revenue=total_revenue,
        total_tickets_sold=total_tickets_sold,
        revenue_by_park=revenue_by_park,
    )
