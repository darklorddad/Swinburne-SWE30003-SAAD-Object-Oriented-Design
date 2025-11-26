"""
API endpoints for administrator-specific tasks.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from supabase import Client

from app.api import deps
from app.models.park import Park, ParkUpdate
from app.models.merchandise import Merchandise, MerchandiseCreate, MerchandiseUpdate
from app.models.report import VisitorStatistics
from app.models.ticket import TicketType, TicketTypeCreate, TicketTypeUpdate
from app.services import admin_service, park_service

router = APIRouter()


@router.post(
    "/parks/",
    response_model=Park,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def create_new_park(
    name: str = Form(...),
    location: str = Form(None),
    description: str = Form(None),
    image: UploadFile = File(None),
    db: Client = Depends(deps.get_db),
):
    """
    Create a new national park. (Admin only)
    """
    return await admin_service.create_park(db, name, location, description, image)


@router.get(
    "/parks/",
    response_model=List[Park],
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def read_parks(db: Client = Depends(deps.get_db)):
    """
    Retrieve all parks (active and inactive). (Admin only)
    """
    return await admin_service.get_all_parks(db)


@router.put(
    "/parks/{park_id}",
    response_model=Park,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def update_existing_park(
    park_id: UUID, park_in: ParkUpdate, db: Client = Depends(deps.get_db)
):
    """
    Update a park's information. (Admin only)
    """
    park = await admin_service.update_park(db, park_id, park_in)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    return park


@router.delete(
    "/parks/{park_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def delete_existing_park(park_id: UUID, db: Client = Depends(deps.get_db)):
    """
    Delete a park. (Admin only)
    """
    success = await admin_service.delete_park(db, park_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )


@router.post(
    "/parks/{park_id}/ticket-types/",
    response_model=TicketType,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def create_new_ticket_type_for_park(
    park_id: UUID,
    ticket_type_in: TicketTypeCreate,
    db: Client = Depends(deps.get_db),
):
    """
    Create a new ticket type for a specific park. (Admin only)
    """
    try:
        return await admin_service.create_ticket_type(db, ticket_type_in, park_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/parks/{park_id}/ticket-types/",
    response_model=List[TicketType],
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def read_ticket_types_for_park(
    park_id: UUID, db: Client = Depends(deps.get_db)
):
    """
    Retrieve all ticket types for a specific park. (Admin only)
    """
    # Check if park exists first
    park = await park_service.get_park_by_id(db, park_id)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    return await admin_service.get_all_ticket_types_for_park(db, park_id)


@router.put(
    "/parks/{park_id}/ticket-types/{ticket_type_id}",
    response_model=TicketType,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def update_ticket_type_for_park(
    park_id: UUID,
    ticket_type_id: UUID,
    ticket_type_in: TicketTypeUpdate,
    db: Client = Depends(deps.get_db),
):
    """
    Update a ticket type for a specific park. (Admin only)
    """
    ticket_type = await admin_service.update_ticket_type(
        db, park_id, ticket_type_id, ticket_type_in
    )
    if not ticket_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found or does not belong to this park",
        )
    return ticket_type


@router.delete(
    "/parks/{park_id}/ticket-types/{ticket_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def delete_ticket_type_for_park(
    park_id: UUID, ticket_type_id: UUID, db: Client = Depends(deps.get_db)
):
    """
    Soft-delete a ticket type for a specific park. (Admin only)

    This archives the ticket type by setting it to inactive, rather than
    deleting it, to preserve historical order data.
    """
    success = await admin_service.delete_ticket_type(db, park_id, ticket_type_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found or does not belong to this park",
        )


@router.get(
    "/parks/{park_id}/merchandise/",
    response_model=List[Merchandise],
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def read_merchandise_for_park(
    park_id: UUID, db: Client = Depends(deps.get_db)
):
    """
    Retrieve all merchandise for a specific park. (Admin only)
    """
    # Check if park exists first
    park = await park_service.get_park_by_id(db, park_id)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    return await admin_service.get_all_merchandise_for_park(db, park_id)


@router.post(
    "/parks/{park_id}/merchandise/",
    response_model=Merchandise,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def create_new_merchandise_for_park(
    park_id: UUID,
    merchandise_in: MerchandiseCreate,
    db: Client = Depends(deps.get_db),
):
    """
    Create new merchandise for a specific park. (Admin only)
    """
    try:
        return await admin_service.create_merchandise(db, merchandise_in, park_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/parks/{park_id}/merchandise/{merchandise_id}",
    response_model=Merchandise,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def update_merchandise_for_park(
    park_id: UUID,
    merchandise_id: UUID,
    merchandise_in: MerchandiseUpdate,
    db: Client = Depends(deps.get_db),
):
    """
    Update merchandise for a specific park. (Admin only)
    """
    merchandise = await admin_service.update_merchandise(
        db, park_id, merchandise_id, merchandise_in
    )
    if not merchandise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchandise not found or does not belong to this park",
        )
    return merchandise


@router.delete(
    "/parks/{park_id}/merchandise/{merchandise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def delete_merchandise_for_park(
    park_id: UUID, merchandise_id: UUID, db: Client = Depends(deps.get_db)
):
    """
    Delete merchandise for a specific park. (Admin only)
    """
    success = await admin_service.delete_merchandise(db, park_id, merchandise_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchandise not found or does not belong to this park",
        )


@router.get(
    "/statistics/visitors/",
    response_model=VisitorStatistics,
    dependencies=[Depends(deps.get_current_active_admin)],
)
async def get_visitor_statistics_report(db: Client = Depends(deps.get_db)):
    """
    Retrieve a report on visitor statistics. (Admin only)
    """
    return await admin_service.get_visitor_statistics(db)
