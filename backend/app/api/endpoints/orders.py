from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.order import Order
from app.models.admin_user import AdminUser
from app.schemas.order import CreateOrderRequest, OrderConfirmationOut, InvoiceOut
from app.services.order_service import place_customer_order, get_order_invoice_data
from app.core.rate_limiter import limit_orders
from app.core.security import decode_access_token

router = APIRouter(prefix="/orders", tags=["Public Orders"])


@router.post("", response_model=OrderConfirmationOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(limit_orders)])
def submit_order(order_data: CreateOrderRequest, db: Session = Depends(get_db)):
    """
    Validates order, verifies inventory, creates atomic records, decrements stock,
    and returns order confirmation with pre-filled WhatsApp link.
    Rate-limited to 5 orders per 10 minutes per client IP.
    """
    return place_customer_order(db=db, order_data=order_data)


@router.get("/{order_number}/invoice", response_model=InvoiceOut)
def get_order_invoice(
    order_number: str,
    token: Optional[str] = Query(None, description="Cryptographic invoice access token"),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Fetches the immutable snapshot invoice for a given order number.
    Requires either a valid cryptographic order access token or an authenticated admin session,
    preventing automated scrapers from harvesting customer PII.
    """
    order = db.query(Order).filter(Order.order_number == order_number.strip().upper()).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_number}' not found."
        )

    # 1. Check if token matches order.access_token
    token_valid = bool(token and order.access_token and token.strip() == order.access_token.strip())

    # 2. If token is invalid or absent, check if request is by an authenticated admin
    is_admin = False
    if not token_valid and authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split("Bearer ")[1].strip()
        payload = decode_access_token(jwt_token)
        if payload and payload.get("sub"):
            admin = db.query(AdminUser).filter(AdminUser.id == payload.get("sub")).first()
            if admin and admin.is_active:
                is_admin = True

    if not token_valid and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. A valid invoice access token or admin authorization is required to view this invoice."
        )

    return get_order_invoice_data(db=db, order=order)

