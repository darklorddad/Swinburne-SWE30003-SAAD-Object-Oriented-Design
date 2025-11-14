"""
API endpoints for customer orders.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api import deps
from app.models.order import Order, OrderCreate
from app.models.user import User
from app.services import order_service

router = APIRouter()


@router.post(
    "/orders/",
    response_model=Order,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_order(
    order_in: OrderCreate,
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Create a new order for the current user.
    """
    try:
        order = await order_service.create_order(
            db, order_in=order_in, customer_id=current_user.id
        )
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
