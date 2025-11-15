"""
Dependencies for API endpoints.

This module provides functions to get shared dependencies, such as the database
client or the current user, which can be injected into path operation functions.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client

from app.core.config import get_settings
from app.core.database import supabase
from app.models.user import User
from app.services import auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")
settings = get_settings()


def get_db() -> Client:
    """
    Returns a Supabase client instance.
    """
    return supabase


async def get_current_user(
    db: Client = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Decodes the JWT token to get the current user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        auth_user = db.auth.get_user(token).user
        if not auth_user:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    # Fetch the user's public profile
    user_profile = await auth_service.get_user_profile_by_id(db, user_id=auth_user.id)
    if user_profile is None:
        raise credentials_exception
    return user_profile


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Checks if the current user is active.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Checks if the current user is an active admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
