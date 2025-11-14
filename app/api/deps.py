"""
Dependencies for API endpoints.

This module provides functions to get shared dependencies, such as the database
client, which can be injected into path operation functions.
"""
from supabase import Client

from app.core.database import supabase


def get_db() -> Client:
    """
    Returns a Supabase client instance.
    """
    return supabase
