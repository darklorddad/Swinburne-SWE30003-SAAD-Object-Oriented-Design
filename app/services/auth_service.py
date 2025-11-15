"""
Service layer for handling authentication and user management logic.

This includes database interactions for creating and fetching user profiles.
Core authentication is handled by Supabase.
"""
from typing import Optional
from uuid import UUID

from gotrue.errors import AuthApiError
from supabase import Client

from app.models.user import User, UserCreate, UserUpdate


async def get_user_by_email(db: Client, email: str) -> Optional[User]:
    """Fetches a user's public profile from the database by email."""
    response = db.table("users").select("*").eq("email", email).execute()
    if response.data:
        return User(**response.data[0])
    return None


async def get_user_profile_by_id(db: Client, user_id: UUID) -> Optional[User]:
    """Fetches a user's public profile from the database by ID."""
    response = db.table("users").select("*").eq("id", str(user_id)).single().execute()
    if response.data:
        return User(**response.data)
    return None


async def create_user(db: Client, user: UserCreate) -> User:
    """
    Creates a new user in the database.

    Raises:
        ValueError: If a user with the same email already exists.
    """
    try:
        # Create user in Supabase Auth
        auth_response = db.auth.sign_up(
            {"email": user.email, "password": user.password}
        )
        auth_user = auth_response.user
        if not auth_user:
            raise ValueError("Could not create user in Supabase Auth")

        # Create corresponding public profile in 'users' table
        profile_data = {
            "id": str(auth_user.id),
            "email": auth_user.email,
            "full_name": user.full_name,
        }
        profile_response = db.table("users").insert(profile_data).execute()

        return User(**profile_response.data[0])
    except AuthApiError as e:
        raise ValueError(e.message)


async def update_user(
    db: Client, user_id: UUID, user_update: UserUpdate
) -> Optional[User]:
    """Updates a user's information in the database."""
    update_data = user_update.dict(exclude_unset=True)
    if not update_data:
        # If nothing to update, just fetch and return the user
        response = (
            db.table("users").select("*").eq("id", str(user_id)).single().execute()
        )
        if response.data:
            return User(**response.data)
        return None

    response = (
        db.table("users")
        .update(update_data)
        .eq("id", str(user_id))
        .execute()
    )
    if response.data:
        return User(**response.data[0])
    return None
