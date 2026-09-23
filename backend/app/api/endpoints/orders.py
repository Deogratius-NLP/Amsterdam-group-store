from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.order import Order
from app.schemas.order import CreateOrderRequest, OrderConfirmationOut, InvoiceOut
from app.services.order_service import place_customer_order, get_order_invoice_data

router = APIRouter(prefix="/orders", tags=["Public Orders"])


@router.post("", response_model=OrderConfirmationOut, status_code=status.HTTP_201_CREATED)
def submit_order(order_data: CreateOrderRequest, db: Session = Depends(get_db)):
    """
    Validates order, verifies inventory, creates atomic records, decrements stock,
    and returns order confirmation with pre-filled WhatsApp link.
    """
    return place_customer_order(db=db, order_data=order_data)


@router.get("/{order_number}/invoice", response_model=InvoiceOut)
def get_order_invoice(order_number: str, db: Session = Depends(get_db)):
    """
    Fetches the immutable snapshot invoice for a given order number.
    """
    order = db.query(Order).filter(Order.order_number == order_number.strip().upper()).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_number}' not found."
        )
    return get_order_invoice_data(db=db, order=order)
