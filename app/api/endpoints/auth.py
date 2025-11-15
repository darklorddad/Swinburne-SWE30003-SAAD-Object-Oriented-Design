"""
API endpoints for user authentication and registration.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from supabase_auth.errors import AuthApiError
from supabase import Client

from app.api import deps
from app.core.config import get_settings
from app.models.user import NewPassword, Token, User, UserCreate, UserUpdate
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
    try:
        session = db.auth.sign_in_with_password(
            {"email": form_data.username, "password": form_data.password}
        )
        if not session.user or not session.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Login failed",
            )
        # Fetch the full user profile from the public table
        user_profile = await auth_service.get_user_profile_by_id(db, session.user.id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )
        return {
            "access_token": session.session.access_token,
            "token_type": "bearer",
            "user": user_profile,
        }

    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)


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


@router.put("/users/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate,
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Update current user's information.
    """
    user = await auth_service.update_user(
        db, user_id=current_user.id, user_update=user_update
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.post("/password-recovery/{email}", status_code=status.HTTP_200_OK)
async def recover_password(email: str, request: Request, db: Client = Depends(deps.get_db)):
    """
    Password Recovery.
    """
    try:
        reset_url = f"{request.url.scheme}://{request.url.netloc}/reset-password"
        db.auth.reset_password_for_email(email, redirect_to=reset_url)
    except AuthApiError as e:
        # Still return a generic message to avoid leaking user existence
        print(f"Password recovery error for {email}: {e.message}")

    # We don't want to reveal if a user exists or not for security reasons.
    # We return a generic message in both cases.
    return {
        "msg": "If an account with this email exists, a password recovery link has been sent."
    }


@router.post("/reset-password/", status_code=status.HTTP_200_OK)
async def reset_password(
    new_password_data: NewPassword, db: Client = Depends(deps.get_db)
):
    """
    Reset password.
    """
    try:
        # The token from the password reset email is a short-lived access token.
        # We use it to authenticate the user and update their password.
        db.auth.update_user(
            {"password": new_password_data.new_password},
            jwt=new_password_data.token,
        )
        return {"msg": "Password updated successfully"}
    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
