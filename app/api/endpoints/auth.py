"""
API endpoints for user authentication and registration.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from supabase import Client

from app.api import deps
from app.core.config import get_settings
from app.models.user import Token, User, UserCreate
from app.services import auth_service

router = APIRouter()
settings = get_settings()


@router.post("/token", response_model=Token)
async def login_for_access_token(
    db: Client = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await auth_service.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_new_user(user_in: UserCreate, db: Client = Depends(deps.get_db)):
    """
    Create a new user.
    """
    try:
        user = await auth_service.create_user(db, user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(deps.get_current_active_user)):
    """
    Fetch the current logged in user.
    """
    return current_user
