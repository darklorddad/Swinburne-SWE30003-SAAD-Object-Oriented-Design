"""
Service layer for order management logic.
"""
from typing import List, Optional
from uuid import UUID

from supabase import Client

from app.models.merchandise import Merchandise
from app.models.order import Order, OrderCreate, OrderItem
from datetime import date


async def create_order(db: Client, order_in: OrderCreate, customer_id: UUID) -> Order:
    """
    Creates a new order for a customer, handling both tickets and merchandise.

    This function validates items, calculates total price, atomically decrements
    stock for merchandise, and then creates the order and its items. It will
    roll back stock changes if the process fails.

    Raises:
        ValueError: If an item is not found, out of stock, or invalid.
    """
    total_amount = 0.0
    item_prices = {}
    merchandise_to_decrement = []

    # First, validate all items and calculate total price
    for item in order_in.items:
        if item.ticket_type_id:
            response = (
                db.table("ticket_types")
                .select("price")
                .eq("id", str(item.ticket_type_id))
                .eq("is_active", True)
                .single()
                .execute()
            )
            if not response.data:
                raise ValueError(
                    f"TicketType with id {item.ticket_type_id} not found or is inactive"
                )
            price = response.data["price"]
            item_prices[item.ticket_type_id] = price
            total_amount += price * item.quantity
        elif item.merchandise_id:
            response = (
                db.table("merchandise")
                .select("price")
                .eq("id", str(item.merchandise_id))
                .eq("is_active", True)
                .single()
                .execute()
            )
            if not response.data:
                raise ValueError(
                    f"Merchandise with id {item.merchandise_id} not found or is inactive"
                )
            price = response.data["price"]
            item_prices[item.merchandise_id] = price
            total_amount += price * item.quantity
            merchandise_to_decrement.append(
                {"id": item.merchandise_id, "quantity": item.quantity}
            )

    # Atomically decrement stock for all merchandise items, with rollback on failure
    decremented_merch = []
    try:
        for merch in merchandise_to_decrement:
            # The RPC function returns true on success, false on failure
            response = db.rpc(
                "decrement_stock",
                {"merch_id": str(merch["id"]), "decrement_by": merch["quantity"]},
            ).execute()

            # If the RPC call fails or returns false, there was not enough stock
            if not response.data:
                raise ValueError(f"Not enough stock for merchandise id {merch['id']}")

            decremented_merch.append(merch)

        # If we get here, all stock was successfully decremented.
        # Now create the order and its items.
        order_data = {
            "customer_id": str(customer_id),
            "total_amount": total_amount,
            "status": "pending",
        }
        order_response = db.table("orders").insert(order_data).execute()
        created_order = order_response.data[0]
        order_id = created_order["id"]

        order_items_to_create = []
        for item in order_in.items:
            item_data = {
                "order_id": order_id,
                "quantity": item.quantity,
                "ticket_type_id": str(item.ticket_type_id)
                if item.ticket_type_id
                else None,
                "merchandise_id": str(item.merchandise_id)
                if item.merchandise_id
                else None,
                "visit_date": str(item.visit_date) if item.visit_date else None,
                "price_at_purchase": item_prices[
                    item.ticket_type_id or item.merchandise_id
                ],
            }
            order_items_to_create.append(item_data)

        items_response = (
            db.table("order_items").insert(order_items_to_create).execute()
        )

        created_order_obj = Order(
            id=order_id,
            customer_id=customer_id,
            status=created_order["status"],
            total_amount=created_order["total_amount"],
            created_at=created_order["created_at"],
            items=[OrderItem(**item) for item in items_response.data],
        )

        return created_order_obj

    except ValueError as e:
        # Rollback: increment stock for items that were successfully decremented
        for merch in decremented_merch:
            db.rpc(
                "increment_stock",
                {"merch_id": str(merch["id"]), "increment_by": merch["quantity"]},
            ).execute()
        raise e


async def get_orders_for_customer(db: Client, customer_id: UUID) -> List[Order]:
    """Fetches all orders for a specific customer with full nested details."""
    response = (
        db.table("orders")
        .select("*, order_items(*, ticket_types(*), merchandise(*))") 
        .eq("customer_id", str(customer_id))
        .order("created_at", desc=True)
        .execute()
    )
    return [Order(**{**o, "items": o.get("order_items", [])}) for o in response.data]


async def get_order_by_id(
    db: Client, order_id: UUID, customer_id: UUID
) -> Optional[Order]:
    """Fetches a single order by its ID with full nested details."""
    response = (
        db.table("orders")
        .select("*, order_items(*, ticket_types(*), merchandise(*))")
        .eq("id", str(order_id))
        .eq("customer_id", str(customer_id))
        .single()
        .execute()
    )
    if response.data:
        data = response.data
        data["items"] = data.get("order_items", [])
        return Order(**data)
    return None


async def cancel_order(db: Client, order_id: UUID, customer_id: UUID) -> Order:
    """
    Cancels an order for a customer and restores stock for merchandise items.

    Raises:
        ValueError: If the order is not found, does not belong to the user,
                    or is already cancelled.
    """
    order = await get_order_by_id(db, order_id, customer_id)
    if not order:
        raise ValueError("Order not found or you do not have permission to cancel it")

    if order.status == "cancelled":
        raise ValueError("Order is already cancelled")

    # Restore stock for any merchandise items in the order
    for item in order.items:
        if item.merchandise_id:
            # Increment stock using an atomic RPC call
            db.rpc(
                "increment_stock",
                {"merch_id": str(item.merchandise_id), "increment_by": item.quantity},
            ).execute()

    response = (
        db.table("orders")
        .update({"status": "cancelled"})
        .eq("id", str(order_id))
        .execute()
    )

    order.status = response.data[0]["status"]
    return order


async def reschedule_order(
    db: Client, order_id: UUID, customer_id: UUID, new_date: date
) -> Order:
    """
    Reschedules an order by updating the visit date of its items.

    Raises:
        ValueError: If order not found, belongs to another user, or is cancelled.
    """
    # 1. Verify the order exists and belongs to the user
    order = await get_order_by_id(db, order_id, customer_id)
    if not order:
        raise ValueError("Order not found or you do not have permission to reschedule it")

    # 2. Business Rule: Cannot reschedule cancelled orders
    if order.status == "cancelled":
        raise ValueError("Cannot reschedule a cancelled order")

    # 3. Update the visit_date for all items in this order (only for tickets)
    # Identify items that are tickets (have a ticket_type_id)
    ticket_item_ids = [
        str(item.id) 
        for item in order.items 
        if item.ticket_type_id is not None
    ]
    
    if ticket_item_ids:
        # Update the identified ticket items
        db.table("order_items")\
            .update({"visit_date": str(new_date)})\
            .in_("id", ticket_item_ids)\
            .execute()
    
    # 4. Return the updated order object
    return await get_order_by_id(db, order_id, customer_id)


async def process_refund(
    db: Client, order_id: UUID, customer_id: UUID, reason: str
) -> Order:
    """
    Processes a refund request: updates status to 'refunded' and saves the reason.
    """
    # 1. Verify order exists and belongs to user
    order = await get_order_by_id(db, order_id, customer_id)
    if not order:
        raise ValueError("Order not found or permission denied")

    # 2. Check if already refunded/cancelled
    if order.status in ["cancelled", "refunded"]:
        raise ValueError(f"Order is already {order.status}")

    # 3. Update DB: Set status to 'refunded' and save reason
    response = (
        db.table("orders")
        .update({
            "status": "refunded",
            "refund_reason": reason
        })
        .eq("id", str(order_id))
        .execute()
    )
    
    # 4. Return updated object
    return await get_order_by_id(db, order_id, customer_id)