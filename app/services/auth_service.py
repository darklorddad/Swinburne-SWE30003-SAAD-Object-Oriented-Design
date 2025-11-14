"""
Service layer for handling authentication and user management logic.

This includes password hashing, JWT creation, and database interactions for
creating, fetching, and authenticating users.
"""
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from supabase import Client

from app.core.config import get_settings
from app.models.user import User, UserCreate, UserInDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


async def get_user_by_email(db: Client, email: str) -> Optional[UserInDB]:
    """Fetches a user from the database by email."""
    response = db.table("users").select("*").eq("email", email).single().execute()
    if response.data:
        return UserInDB(**response.data)
    return None


async def authenticate_user(
    db: Client, email: str, password: str
) -> Optional[UserInDB]:
    """Authenticates a user by email and password."""
    user_in_db = await get_user_by_email(db, email)
    if not user_in_db:
        return None
    if not verify_password(password, user_in_db.password_hash):
        return None
    return user_in_db


async def create_user(db: Client, user: UserCreate) -> User:
    """
    Creates a new user in the database.

    Raises:
        ValueError: If a user with the same email already exists.
    """
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("User with this email already exists")

    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "full_name": user.full_name,
        "password_hash": hashed_password,
    }
    response = db.table("users").insert(user_data).execute()

    created_user_data = response.data[0]

    return User(**created_user_data)
