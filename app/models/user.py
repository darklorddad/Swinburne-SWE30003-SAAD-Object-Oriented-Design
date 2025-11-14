"""
Pydantic models for User and Token data structures.

These models define the shape of data for creating users, reading user information,
and handling authentication tokens, ensuring type safety and validation.
"""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base model for user attributes."""

    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Model for creating a new user, including the password."""

    password: str


class User(UserBase):
    """Model for representing a user read from the database."""

    id: UUID
    is_active: bool = True
    is_admin: bool = False

    class Config:
        """Pydantic configuration."""

        orm_mode = True


class Token(BaseModel):
    """Model for the access token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Model for the data encoded within the JWT."""

    email: Optional[str] = None
