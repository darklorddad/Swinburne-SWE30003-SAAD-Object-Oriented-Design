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


class ParkCreate(ParkBase):
    """Model for creating a new park."""

    pass


class ParkUpdate(ParkBase):
    """Model for updating an existing park."""

    pass


class Park(ParkBase):
    """Model for representing a park read from the database."""

    id: UUID

    class Config:
        """Pydantic configuration."""

        orm_mode = True
