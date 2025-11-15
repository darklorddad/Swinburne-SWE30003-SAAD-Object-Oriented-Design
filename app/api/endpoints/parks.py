"""
API endpoints for public park information.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api import deps
from app.models.merchandise import Merchandise
from app.models.park import Park
from app.models.ticket import TicketType
from app.services import park_service

router = APIRouter()


@router.get("/", response_model=List[Park])
async def read_public_parks(db: Client = Depends(deps.get_db)):
    """
    Retrieve all parks for public viewing.
    """
    return await park_service.get_parks(db)


@router.get("/{park_id}", response_model=Park)
async def read_public_park(park_id: UUID, db: Client = Depends(deps.get_db)):
    """
    Retrieve a single park by its ID for public viewing.
    """
    park = await park_service.get_park_by_id(db, park_id)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    return park


@router.get("/{park_id}/ticket-types/", response_model=List[TicketType])
async def read_public_ticket_types_for_park(
    park_id: UUID, db: Client = Depends(deps.get_db)
):
    """
    Retrieve all ticket types for a specific park for public viewing.
    """
    # Check if park exists first
    park = await park_service.get_park_by_id(db, park_id)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    return await park_service.get_ticket_types_for_park(db, park_id)


@router.get("/{park_id}/merchandise/", response_model=List[Merchandise])
async def read_public_merchandise_for_park(
    park_id: UUID, db: Client = Depends(deps.get_db)
):
    """
    Retrieve all merchandise for a specific park for public viewing.
    """
    park = await park_service.get_park_by_id(db, park_id)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    return await park_service.get_merchandise_for_park(db, park_id)
