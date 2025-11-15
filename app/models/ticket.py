"""
Pydantic models for Ticket data structures.
"""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TicketTypeBase(BaseModel):
    """Base model for ticket type attributes."""

    name: str
    price: float = Field(..., gt=0)


class TicketTypeCreate(TicketTypeBase):
    """Model for creating a new ticket type."""

    pass


class TicketTypeUpdate(BaseModel):
    """Model for updating a ticket type."""

    name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)


class TicketType(TicketTypeBase):
    """Model for representing a ticket type read from the database."""

    id: UUID
    park_id: UUID
    is_active: bool = True

    class Config:
        """Pydantic configuration."""

        from_attributes = True
