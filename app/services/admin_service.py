"""
Service layer for administrator-specific logic.
"""
import time
from collections import defaultdict
from typing import List, Optional
from uuid import UUID

from fastapi import UploadFile
from supabase import Client, create_client

from app.core.config import get_settings
from app.models.park import Park, ParkUpdate
from app.models.merchandise import Merchandise, MerchandiseCreate, MerchandiseUpdate
from app.models.report import ParkStatistic, VisitorStatistics
from app.models.ticket import TicketType, TicketTypeCreate, TicketTypeUpdate
from app.services.park_service import get_park_by_id


async def create_park(
    db: Client,
    name: str,
    location: Optional[str],
    description: Optional[str],
    image: Optional[UploadFile],
    token: Optional[str] = None,
) -> Park:
    """Creates a new park in the database, handling image upload."""
    settings = get_settings()

    image_url = None
    if image:
        file_content = await image.read()
        # Create a unique filename
        file_ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        file_name = f"public/{int(time.time())}_{name.replace(' ', '_')}.{file_ext}"

        # Upload to Supabase Storage using the client library
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        if token:
            # Ensure the storage client uses the user's auth token
            client.storage.session.headers["Authorization"] = f"Bearer {token}"

        client.storage.from_("park-images").upload(
            file_name,
            file_content,
            {"content-type": image.content_type or "application/octet-stream"},
        )

        # Get public URL
        image_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/park-images/{file_name}"

    # Use a dedicated client for the DB insert to satisfy RLS without modifying global db
    if token:
        db_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        db_client.postgrest.auth(token)
    else:
        db_client = db

    park_data = {
        "name": name,
        "location": location,
        "description": description,
        "image_url": image_url,
    }

    response = db_client.table("parks").insert(park_data).execute()
    created_park_data = response.data[0]
    return Park(**created_park_data)


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


async def delete_park(
    db: Client, park_id: UUID, token: Optional[str] = None, permanent: bool = False
) -> bool:
    """
    Deletes a park.
    If permanent is True, performs a hard delete (and attempts to delete image).
    Otherwise, performs a soft delete (sets is_active=False).
    """
    if token:
        settings = get_settings()
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        client.postgrest.auth(token)
    else:
        client = db

    if permanent:
        # 1. Attempt to get image URL to delete from storage
        park_res = (
            client.table("parks")
            .select("image_url")
            .eq("id", str(park_id))
            .single()
            .execute()
        )
        if park_res.data and park_res.data.get("image_url"):
            image_url = park_res.data["image_url"]
            # Extract filename from URL (assuming standard Supabase structure)
            # URL format: .../park-images/public/filename.jpg
            if "park-images" in image_url:
                try:
                    file_path = "public/" + image_url.split("/public/")[-1]
                    client.storage.from_("park-images").remove([file_path])
                except Exception:
                    pass  # Fail silently on image delete, prioritize DB delete

        # 2. Delete children first (if cascade isn't set up in DB)
        client.table("merchandise").delete().eq("park_id", str(park_id)).execute()
        client.table("ticket_types").delete().eq("park_id", str(park_id)).execute()

        # 3. Delete Park
        response = client.table("parks").delete().eq("id", str(park_id)).execute()
        return bool(response.data)

    else:
        # Soft Delete Logic
        client.table("merchandise").update({"is_active": False}).eq(
            "park_id", str(park_id)
        ).execute()

        client.table("ticket_types").update({"is_active": False}).eq(
            "park_id", str(park_id)
        ).execute()

        response = (
            client.table("parks")
            .update({"is_active": False})
            .eq("id", str(park_id))
            .execute()
        )
        return bool(response.data)


async def get_all_parks(db: Client) -> List[Park]:
    """Fetches all parks (active and inactive) from the database."""
    response = db.table("parks").select("*").order("name").execute()
    return [Park(**park_data) for park_data in response.data]


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


async def delete_ticket_type(
    db: Client,
    park_id: UUID,
    ticket_type_id: UUID,
    token: Optional[str] = None,
    permanent: bool = False,
) -> bool:
    """
    Deletes a ticket type.
    """
    if token:
        settings = get_settings()
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        client.postgrest.auth(token)
    else:
        client = db

    if permanent:
        response = (
            client.table("ticket_types")
            .delete()
            .eq("id", str(ticket_type_id))
            .eq("park_id", str(park_id))
            .execute()
        )
    else:
        response = (
            client.table("ticket_types")
            .update({"is_active": False})
            .eq("id", str(ticket_type_id))
            .eq("park_id", str(park_id))
            .execute()
        )
    return bool(response.data)


async def get_all_ticket_types_for_park(db: Client, park_id: UUID) -> List[TicketType]:
    """Fetches all ticket types (active and inactive) for a park."""
    response = (
        db.table("ticket_types")
        .select("*")
        .eq("park_id", str(park_id))
        .order("name")
        .execute()
    )
    return [TicketType(**tt) for tt in response.data]


async def get_all_merchandise_for_park(db: Client, park_id: UUID) -> List[Merchandise]:
    """Fetches all merchandise (active and inactive) for a park."""
    response = (
        db.table("merchandise")
        .select("*")
        .eq("park_id", str(park_id))
        .order("name")
        .execute()
    )
    return [Merchandise(**m) for m in response.data]


async def create_merchandise(
    db: Client, merchandise_in: MerchandiseCreate, park_id: UUID
) -> Merchandise:
    """Creates new merchandise for a park."""
    park = await get_park_by_id(db, park_id)
    if not park:
        raise ValueError("Park not found")

    data = merchandise_in.dict()
    data["park_id"] = str(park_id)
    response = db.table("merchandise").insert(data).execute()
    return Merchandise(**response.data[0])


async def update_merchandise(
    db: Client,
    park_id: UUID,
    merchandise_id: UUID,
    merchandise_update: MerchandiseUpdate,
) -> Optional[Merchandise]:
    """Updates existing merchandise, ensuring it belongs to the correct park."""
    verify_response = (
        db.table("merchandise")
        .select("id")
        .eq("id", str(merchandise_id))
        .eq("park_id", str(park_id))
        .single()
        .execute()
    )
    if not verify_response.data:
        return None

    update_data = merchandise_update.dict(exclude_unset=True)
    if not update_data:
        get_response = (
            db.table("merchandise")
            .select("*")
            .eq("id", str(merchandise_id))
            .single()
            .execute()
        )
        return Merchandise(**get_response.data) if get_response.data else None

    response = (
        db.table("merchandise")
        .update(update_data)
        .eq("id", str(merchandise_id))
        .execute()
    )
    if response.data:
        return Merchandise(**response.data[0])
    return None


async def delete_merchandise(
    db: Client,
    park_id: UUID,
    merchandise_id: UUID,
    token: Optional[str] = None,
    permanent: bool = False,
) -> bool:
    """
    Deletes merchandise.
    """
    if token:
        settings = get_settings()
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        client.postgrest.auth(token)
    else:
        client = db

    if permanent:
        response = (
            client.table("merchandise")
            .delete()
            .eq("id", str(merchandise_id))
            .eq("park_id", str(park_id))
            .execute()
        )
    else:
        response = (
            client.table("merchandise")
            .update({"is_active": False})
            .eq("id", str(merchandise_id))
            .eq("park_id", str(park_id))
            .execute()
        )
    return bool(response.data)


async def get_visitor_statistics(db: Client) -> VisitorStatistics:
    """
    Generates a report on visitor statistics, including revenue and ticket sales.

    This report considers all non-cancelled orders as valid for statistics.
    """
    # Fetch all paid orders with their items and related park info
    # We exclude cancelled AND refunded orders from revenue stats
    response = (
        db.table("orders")
        .select(
            "status, order_items(quantity, price_at_purchase, ticket_types(park_id, parks(name)), merchandise(park_id, parks(name)))"
        )
        .eq("status", "paid")
        .execute()
    )

    if not response.data:
        return VisitorStatistics(
            total_revenue=0,
            total_tickets_sold=0,
            total_merchandise_items_sold=0,
            revenue_by_park=[],
        )

    total_revenue = 0.0
    total_tickets_sold = 0
    total_merchandise_items_sold = 0
    park_stats_raw = defaultdict(
        lambda: {"revenue": 0.0, "tickets": 0, "merch": 0, "name": ""}
    )

    for order in response.data:
        for item in order["order_items"]:
            park_id = None
            park_name = None
            is_ticket = False
            is_merch = False

            if item.get("ticket_types") and item["ticket_types"].get("parks"):
                park_id = item["ticket_types"]["park_id"]
                park_name = item["ticket_types"]["parks"]["name"]
                is_ticket = True
            elif item.get("merchandise") and item["merchandise"].get("parks"):
                park_id = item["merchandise"]["park_id"]
                park_name = item["merchandise"]["parks"]["name"]
                is_merch = True

            if park_id and park_name:
                quantity = item["quantity"]
                price = item["price_at_purchase"]
                revenue = quantity * price

                total_revenue += revenue
                park_stats_raw[park_id]["revenue"] += revenue
                park_stats_raw[park_id]["name"] = park_name

                if is_ticket:
                    total_tickets_sold += quantity
                    park_stats_raw[park_id]["tickets"] += quantity
                elif is_merch:
                    total_merchandise_items_sold += quantity
                    park_stats_raw[park_id]["merch"] += quantity

    revenue_by_park = [
        ParkStatistic(
            park_id=pid,
            park_name=stats["name"],
            total_revenue=stats["revenue"],
            tickets_sold=stats["tickets"],
            merchandise_items_sold=stats["merch"],
        )
        for pid, stats in park_stats_raw.items()
    ]

    # Sort the park statistics by park name for consistent ordering
    revenue_by_park.sort(key=lambda p: p.park_name)

    return VisitorStatistics(
        total_revenue=total_revenue,
        total_tickets_sold=total_tickets_sold,
        total_merchandise_items_sold=total_merchandise_items_sold,
        revenue_by_park=revenue_by_park,
    )
