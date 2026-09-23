from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class OrderItemInput(BaseModel):
    product_id: str = Field(..., description="ID of product being purchased")
    quantity: int = Field(..., ge=1, le=1000, description="Quantity of units to order")
    pricing_mode: Optional[str] = Field(default=None, description="Optional per-item override: RETAIL or WHOLESALE")


class CreateOrderRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150, description="Customer's full name")
    customer_phone: str = Field(..., min_length=7, max_length=50, description="Customer phone number")
    customer_location: str = Field(..., min_length=2, max_length=500, description="Free text delivery location")
    product_id: Optional[str] = Field(default=None, description="ID of product being purchased (single-item order)")
    quantity: Optional[int] = Field(default=None, ge=1, le=1000, description="Quantity of units to order")
    items: Optional[List[OrderItemInput]] = Field(default=None, description="List of items for multi-item cart orders")
    pricing_mode: Optional[str] = Field(default="RETAIL", description="Shopping mode: RETAIL or WHOLESALE")
    customer_notes: Optional[str] = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    product_name_snapshot: str
    unit_price: Decimal
    quantity: int
    subtotal: Decimal


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_number: str
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_location: str
    pricing_mode: str = "RETAIL"
    total_amount: Decimal
    status: str
    customer_notes: Optional[str] = None
    items: List[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime


class OrderConfirmationOut(OrderOut):
    whatsapp_url: str
    whatsapp_message: str


class InvoiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_number: str
    created_at: datetime
    pricing_mode: str
    status: str
    customer_name: str
    customer_phone: str
    customer_location: str
    customer_notes: Optional[str] = None
    items: List[OrderItemOut]
    total_amount: Decimal
    company_name: str = "Amsterdam Group"
    company_tagline: str = "Premium Quality Agricultural & Veterinary Solutions"
    company_address: str = "Dar es Salaam, Tanzania"
    company_phone: str = "+255 744 397 500"
    company_email: str = "info@amsterdamgroup.co.tz"


class UpdateOrderStatusRequest(BaseModel):
    status: str = Field(..., description="New order status: PENDING, CONFIRMED, PROCESSING, READY, DELIVERED, CANCELLED")
