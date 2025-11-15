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


class UserUpdate(BaseModel):
    """Model for updating a user's information."""

    full_name: Optional[str] = None


class User(UserBase):
    """Model for representing a user read from the database."""

    id: UUID
    is_active: bool = True
    is_admin: bool = False

    class Config:
        """Pydantic configuration."""

        from_attributes = True


class UserInDB(User):
    """Model for user data as stored in the database, including hashed password."""

    password_hash: str


class Token(BaseModel):
    """Model for the access token response."""

    access_token: str
    token_type: str
    user: User


class TokenData(BaseModel):
    """Model for the data encoded within the JWT."""

    email: Optional[str] = None


class NewPassword(BaseModel):
    """Model for resetting a password."""

    token: str
    new_password: str
