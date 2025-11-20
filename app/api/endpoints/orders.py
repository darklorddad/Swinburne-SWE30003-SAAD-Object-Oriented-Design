"""
API endpoints for customer orders.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api import deps
from app.models.order import Order, OrderCreate
from app.models.user import User
from app.services import order_service
from app.models.order import Order, OrderCreate, OrderReschedule, RefundRequest

router = APIRouter()


@router.post(
    "/",
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


@router.get("/", response_model=List[Order])
async def read_user_orders(
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Retrieve all orders for the current user.
    """
    return await order_service.get_orders_for_customer(db, customer_id=current_user.id)


@router.get("/{order_id}", response_model=Order)
async def read_user_order(
    order_id: UUID,
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Retrieve a specific order for the current user.
    """
    order = await order_service.get_order_by_id(
        db, order_id=order_id, customer_id=current_user.id
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or you do not have permission to view it",
        )
    return order


@router.delete("/{order_id}", response_model=Order)
async def cancel_user_order(
    order_id: UUID,
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Cancel an order for the current user.
    """
    try:
        order = await order_service.cancel_order(
            db, order_id=order_id, customer_id=current_user.id
        )
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{order_id}/reschedule", response_model=Order)
async def reschedule_user_order(
    order_id: UUID,
    reschedule_in: OrderReschedule,
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Reschedule an existing order to a new date.
    """
    try:
        order = await order_service.reschedule_order(
            db, 
            order_id=order_id, 
            customer_id=current_user.id, 
            new_date=reschedule_in.new_visit_date
        )
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/{order_id}/refund", response_model=Order)
async def refund_user_order(
    order_id: UUID,
    refund_in: RefundRequest,
    db: Client = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Request and process a refund for an order.
    """
    try:
        order = await order_service.process_refund(
            db, 
            order_id=order_id, 
            customer_id=current_user.id, 
            reason=refund_in.reason
        )
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )