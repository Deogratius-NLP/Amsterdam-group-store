from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.order import Order
from app.models.product import Product
from app.models.inventory_transaction import InventoryTransaction
from app.schemas.order import OrderOut, OrderItemOut, UpdateOrderStatusRequest, InvoiceOut
from app.services.order_service import get_order_invoice_data

router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])

VALID_STATUSES = {"PENDING", "CONFIRMED", "PROCESSING", "READY", "DELIVERED", "CANCELLED"}


def _to_order_out(order: Order) -> OrderOut:
    items_out = [
        OrderItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name_snapshot=item.product_name_snapshot,
            package_name=getattr(item, 'package_name', None),
            unit_price=item.unit_price,
            quantity=item.quantity,
            subtotal=item.subtotal
        )
        for item in order.items
    ]
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        customer_id=order.customer_id,
        customer_name=order.customer.name if order.customer else "Unknown",
        customer_phone=order.customer.phone if order.customer else "",
        customer_location=order.customer.location if order.customer else "",
        pricing_mode=order.pricing_mode or "RETAIL",
        total_amount=order.total_amount,
        status=order.status,
        customer_notes=order.customer_notes,
        items=items_out,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.get("", response_model=List[OrderOut])
def list_admin_orders(
    search: Optional[str] = Query(None, description="Search order number, customer name or phone"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    query = db.query(Order)
    if status and status.upper() != "ALL":
        query = query.filter(Order.status == status.upper())

    if search:
        pattern = f"%{search.strip()}%"
        from app.models.customer import Customer
        query = query.join(Order.customer).filter(
            or_(
                Order.order_number.ilike(pattern),
                Customer.name.ilike(pattern),
                Customer.phone.ilike(pattern),
                Customer.location.ilike(pattern)
            )
        )

    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    return [_to_order_out(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_admin_order(
    order_id: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _to_order_out(order)


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: str,
    data: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    new_status = data.status.upper()
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(sorted(VALID_STATUSES))}"
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    old_status = order.status
    if old_status == new_status:
        return _to_order_out(order)

    # If cancelling order that wasn't previously cancelled, return items to inventory
    if new_status == "CANCELLED" and old_status != "CANCELLED":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                prev_qty = product.stock_quantity
                product.stock_quantity += item.quantity
                inv_tx = InventoryTransaction(
                    product_id=product.id,
                    quantity_change=item.quantity,
                    previous_quantity=prev_qty,
                    new_quantity=product.stock_quantity,
                    transaction_type="ORDER_CANCELLATION",
                    reason=f"Restored from Cancelled Order {order.order_number}",
                    order_id=order.id,
                    created_by=admin.id
                )
                db.add(inv_tx)

    order.status = new_status
    db.commit()
    db.refresh(order)
    return _to_order_out(order)


@router.get("/{order_id}/invoice", response_model=InvoiceOut)
def get_admin_order_invoice(
    order_id: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return get_order_invoice_data(db=db, order=order)
