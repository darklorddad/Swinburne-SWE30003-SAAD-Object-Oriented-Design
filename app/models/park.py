"""
Pydantic models for National Park data structures.
"""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ParkBase(BaseModel):
    """Base model for park attributes."""

    name: str
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None  # Add this line


class ParkCreate(ParkBase):
    """Model for creating a new park."""

    pass


class ParkUpdate(ParkBase):
    """Model for updating an existing park."""

    pass


class Park(ParkBase):
    """Model for representing a park read from the database."""

    id: UUID
    is_active: bool = True

    class Config:
        """Pydantic configuration."""

        from_attributes = True
