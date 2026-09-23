from typing import List
from decimal import Decimal
from pydantic import BaseModel
from app.schemas.order import OrderOut


class DashboardStatsOut(BaseModel):
    total_orders: int
    pending_orders: int
    today_orders: int
    total_revenue: Decimal
    total_customers: int
    total_products: int
    low_stock_count: int
    out_of_stock_count: int
    recent_orders: List[OrderOut] = []
