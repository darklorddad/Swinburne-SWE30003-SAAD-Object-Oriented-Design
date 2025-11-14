"""
Service layer for order management logic.
"""
from typing import List, Optional
from uuid import UUID

from supabase import Client

from app.models.order import Order, OrderCreate, OrderItem


async def create_order(db: Client, order_in: OrderCreate, customer_id: UUID) -> Order:
    """
    Creates a new order for a customer.

    This function calculates the total price based on the current ticket prices,
    creates an order record, and then creates the associated order item records.

    Raises:
        ValueError: If any of the provided ticket_type_ids are not found.
    """
    total_amount = 0.0
    order_items_to_create = []
    ticket_type_prices = {}

    # First, validate all ticket types and calculate total price
    for item in order_in.items:
        response = (
            db.table("ticket_types")
            .select("price")
            .eq("id", str(item.ticket_type_id))
            .single()
            .execute()
        )
        if not response.data:
            raise ValueError(f"TicketType with id {item.ticket_type_id} not found")

        price = response.data["price"]
        ticket_type_prices[item.ticket_type_id] = price
        total_amount += price * item.quantity

    # Create the order record
    order_data = {
        "customer_id": str(customer_id),
        "total_amount": total_amount,
        "status": "pending",
    }
    order_response = db.table("orders").insert(order_data).execute()
    created_order = order_response.data[0]
    order_id = created_order["id"]

    # Prepare order items for batch insert
    for item in order_in.items:
        order_items_to_create.append(
            {
                "order_id": order_id,
                "ticket_type_id": str(item.ticket_type_id),
                "quantity": item.quantity,
                "visit_date": str(item.visit_date),
                "price_at_purchase": ticket_type_prices[item.ticket_type_id],
            }
        )

    # Batch insert order items
    items_response = db.table("order_items").insert(order_items_to_create).execute()

    # Construct the final Order object to return
    created_order_obj = Order(
        id=order_id,
        customer_id=customer_id,
        status=created_order["status"],
        total_amount=created_order["total_amount"],
        created_at=created_order["created_at"],
        items=[OrderItem(**item) for item in items_response.data],
    )

    return created_order_obj


async def get_orders_for_customer(db: Client, customer_id: UUID) -> List[Order]:
    """Fetches all orders for a specific customer."""
    response = (
        db.table("orders")
        .select("*, order_items(*)")
        .eq("customer_id", str(customer_id))
        .order("created_at", desc=True)
        .execute()
    )
    return [Order(**o) for o in response.data]


async def get_order_by_id(
    db: Client, order_id: UUID, customer_id: UUID
) -> Optional[Order]:
    """Fetches a single order by its ID, ensuring it belongs to the customer."""
    response = (
        db.table("orders")
        .select("*, order_items(*)")
        .eq("id", str(order_id))
        .eq("customer_id", str(customer_id))
        .single()
        .execute()
    )
    if response.data:
        return Order(**response.data)
    return None


async def cancel_order(db: Client, order_id: UUID, customer_id: UUID) -> Order:
    """
    Cancels an order for a customer.

    Raises:
        ValueError: If the order is not found, does not belong to the user,
                    or is already cancelled.
    """
    order = await get_order_by_id(db, order_id, customer_id)
    if not order:
        raise ValueError("Order not found or you do not have permission to cancel it")

    if order.status == "cancelled":
        raise ValueError("Order is already cancelled")

    response = (
        db.table("orders")
        .update({"status": "cancelled"})
        .eq("id", str(order_id))
        .execute()
    )

    order.status = response.data[0]["status"]
    return order
