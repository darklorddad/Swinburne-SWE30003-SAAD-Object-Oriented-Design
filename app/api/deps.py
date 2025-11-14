"""
Dependencies for API endpoints.

This module provides functions to get shared dependencies, such as the database
client or the current user, which can be injected into path operation functions.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from supabase import Client

from app.core.config import get_settings
from app.core.database import supabase
from app.models.user import TokenData, UserInDB
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
) -> UserInDB:
    """
    Decodes the JWT token to get the current user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await auth_service.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user),
) -> UserInDB:
    """
    Checks if the current user is active.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_active_admin(
    current_user: UserInDB = Depends(get_current_user),
) -> UserInDB:
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
