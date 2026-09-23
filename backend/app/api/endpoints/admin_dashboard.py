from datetime import datetime, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.order import Order
from app.models.customer import Customer
from app.models.product import Product
from app.schemas.dashboard import DashboardStatsOut
from app.api.endpoints.admin_orders import _to_order_out

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("", response_model=DashboardStatsOut)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    now = datetime.now(timezone.utc)
    start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    total_orders = db.query(func.count(Order.id)).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == "PENDING").scalar() or 0
    today_orders = db.query(func.count(Order.id)).filter(Order.created_at >= start_of_today).scalar() or 0
    
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status != "CANCELLED"
    ).scalar() or Decimal("0.00")

    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0

    low_stock_count = db.query(func.count(Product.id)).filter(
        Product.is_active == True,
        Product.stock_quantity > 0,
        Product.stock_quantity <= Product.low_stock_threshold
    ).scalar() or 0

    out_of_stock_count = db.query(func.count(Product.id)).filter(
        Product.is_active == True,
        Product.is_coming_soon == False,
        Product.stock_quantity <= 0
    ).scalar() or 0

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(6).all()
    recent_out = [_to_order_out(o) for o in recent_orders]

    return DashboardStatsOut(
        total_orders=total_orders,
        pending_orders=pending_orders,
        today_orders=today_orders,
        total_revenue=Decimal(str(total_revenue)),
        total_customers=total_customers,
        total_products=total_products,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        recent_orders=recent_out
    )
