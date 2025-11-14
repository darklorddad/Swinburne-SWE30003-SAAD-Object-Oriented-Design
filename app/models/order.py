"""
Pydantic models for Order data structures.
"""
from datetime import date, datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    """Model for creating an item within an order."""

    ticket_type_id: UUID
    quantity: int = Field(..., gt=0)
    visit_date: date


class OrderCreate(BaseModel):
    """Model for creating a new order."""

    items: List[OrderItemCreate]


class OrderItem(BaseModel):
    """Model for representing an item within an order, read from the database."""

    id: UUID
    order_id: UUID
    ticket_type_id: UUID
    quantity: int
    visit_date: date
    price_at_purchase: float

    class Config:
        orm_mode = True


class Order(BaseModel):
    """Model for representing an order read from the database."""

    id: UUID
    customer_id: UUID
    status: str
    total_amount: float
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        orm_mode = True
