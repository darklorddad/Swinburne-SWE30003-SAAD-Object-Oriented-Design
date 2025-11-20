"""
Pydantic models for Order data structures.
"""
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, model_validator
from app.models.ticket import TicketType
from datetime import date


class OrderItemCreate(BaseModel):
    """Model for creating an item within an order."""

    quantity: int = Field(..., gt=0)
    ticket_type_id: Optional[UUID] = None
    merchandise_id: Optional[UUID] = None
    visit_date: Optional[date] = None

    @model_validator(mode="after")
    def check_item_type(self):
        """Ensure item is for a ticket or merchandise, but not both."""
        ticket_id, merch_id = self.ticket_type_id, self.merchandise_id
        visit_date = self.visit_date
        if ticket_id is not None and merch_id is not None:
            raise ValueError("OrderItem cannot be for both a ticket and merchandise")
        if ticket_id is None and merch_id is None:
            raise ValueError("OrderItem must be for either a ticket or merchandise")
        if ticket_id is not None and visit_date is None:
            raise ValueError("Visit date is required for tickets")
        if merch_id is not None and visit_date is not None:
            raise ValueError("Visit date should not be provided for merchandise")
        return self


class OrderCreate(BaseModel):
    """Model for creating a new order."""

    items: List[OrderItemCreate]


class OrderItemTicketTypeInfo(BaseModel):
    """Model for nested ticket type info in an order item."""

    name: str


class OrderItemMerchandiseInfo(BaseModel):
    """Model for nested merchandise info in an order item."""

    name: str


class OrderItem(BaseModel):
    """Model for representing an item within an order, read from the database."""

    id: UUID
    order_id: UUID
    ticket_type_id: Optional[UUID] = None
    merchandise_id: Optional[UUID] = None
    quantity: int
    visit_date: Optional[date] = None
    price_at_purchase: float
    ticket_types: Optional[TicketType] = None
    merchandise: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class Order(BaseModel):
    """Model for representing an order read from the database."""

    id: UUID
    customer_id: UUID
    status: str
    total_amount: float
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True


class OrderReschedule(BaseModel):
    """Model for rescheduling an order."""
    new_visit_date: date


class RefundRequest(BaseModel):
    """Model for requesting a refund."""
    reason: str
