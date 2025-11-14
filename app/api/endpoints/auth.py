"""
API endpoints for user authentication and registration.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
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
async def recover_password(email: str, db: Client = Depends(deps.get_db)):
    """
    Password Recovery.
    """
    user = await auth_service.get_user_by_email(db, email)
    if not user:
        # We don't want to reveal if a user exists or not for security reasons.
        # We return a generic message in both cases.
        print(f"Password recovery requested for non-existent user: {email}")
        return {
            "msg": "If an account with this email exists, a password recovery link has been sent."
        }

    password_reset_token = auth_service.create_password_reset_token(email=email)
    # In a real app, you would email this token. For this demo, we print it.
    # This is a simplification for the assignment.
    # The user will have to manually copy this token from the console.
    print(f"Password reset token for {email}: {password_reset_token}")
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
    email = auth_service.get_email_from_password_reset_token(
        token=new_password_data.token
    )
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        )
    user = await auth_service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    await auth_service.reset_user_password(
        db, user=user, new_password=new_password_data.new_password
    )
    return {"msg": "Password updated successfully"}
