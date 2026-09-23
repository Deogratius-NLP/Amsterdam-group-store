from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerOut, CustomerDetailOut, CustomerOrderSummary

router = APIRouter(prefix="/admin/customers", tags=["Admin Customers"])


def _to_customer_out(c: Customer, db: Session) -> CustomerOut:
    total_orders = db.query(func.count(Order.id)).filter(Order.customer_id == c.id).scalar() or 0
    total_spent = db.query(func.sum(Order.total_amount)).filter(
        Order.customer_id == c.id,
        Order.status != "CANCELLED"
    ).scalar() or Decimal("0.00")

    return CustomerOut(
        id=c.id,
        name=c.name,
        phone=c.phone,
        location=c.location,
        total_orders=total_orders,
        total_spent=Decimal(str(total_spent)),
        created_at=c.created_at,
        updated_at=c.updated_at
    )


@router.get("", response_model=List[CustomerOut])
def list_admin_customers(
    search: Optional[str] = Query(None, description="Search customer name, phone or location"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    query = db.query(Customer)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.name.ilike(pattern),
                Customer.phone.ilike(pattern),
                Customer.location.ilike(pattern)
            )
        )
    customers = query.order_by(Customer.created_at.desc()).offset(offset).limit(limit).all()
    return [_to_customer_out(c, db) for c in customers]


@router.get("/{customer_id}", response_model=CustomerDetailOut)
def get_admin_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    base_out = _to_customer_out(customer, db)
    orders = db.query(Order).filter(Order.customer_id == customer.id).order_by(Order.created_at.desc()).all()
    order_summaries = [
        CustomerOrderSummary(
            id=o.id,
            order_number=o.order_number,
            total_amount=o.total_amount,
            status=o.status,
            created_at=o.created_at
        )
        for o in orders
    ]

    return CustomerDetailOut(
        id=base_out.id,
        name=base_out.name,
        phone=base_out.phone,
        location=base_out.location,
        total_orders=base_out.total_orders,
        total_spent=base_out.total_spent,
        created_at=base_out.created_at,
        updated_at=base_out.updated_at,
        orders=order_summaries
    )
