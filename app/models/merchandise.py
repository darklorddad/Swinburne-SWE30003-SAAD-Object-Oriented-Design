"""
Pydantic models for Merchandise data structures.
"""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MerchandiseBase(BaseModel):
    """Base model for merchandise attributes."""

    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)


class MerchandiseCreate(MerchandiseBase):
    """Model for creating new merchandise."""

    pass


class MerchandiseUpdate(BaseModel):
    """Model for updating merchandise."""

    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)


class Merchandise(MerchandiseBase):
    """Model for representing merchandise read from the database."""

    id: UUID
    park_id: UUID

    class Config:
        """Pydantic configuration."""

        from_attributes = True
