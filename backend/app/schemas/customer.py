from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class CustomerOrderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_number: str
    total_amount: Decimal
    status: str
    created_at: datetime


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    phone: str
    location: str
    total_orders: int = 0
    total_spent: Decimal = Decimal("0.00")
    created_at: datetime
    updated_at: datetime


class CustomerDetailOut(CustomerOut):
    orders: List[CustomerOrderSummary] = []
