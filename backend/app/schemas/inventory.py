from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class InventoryAdjustmentRequest(BaseModel):
    product_id: str
    quantity_change: int = Field(..., description="Positive to add stock, negative to subtract stock")
    reason: str = Field(..., min_length=3, max_length=500, description="Mandatory reason for audit trail")


class InventoryTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    product_name: str
    quantity_change: int
    previous_quantity: int
    new_quantity: int
    transaction_type: str
    reason: str
    order_id: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime


class InventoryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: str
    product_name: str
    category: str
    price: Decimal
    stock_quantity: int
    low_stock_threshold: int
    status: str  # 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
    is_active: bool
