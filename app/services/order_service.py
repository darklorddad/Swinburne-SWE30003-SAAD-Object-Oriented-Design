"""
Service layer for order management logic.
"""
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
