from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    image_url: str
    alt_text: Optional[str] = None
    display_order: int
    is_primary: bool


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: str
    price: Decimal
    retail_price: Decimal
    wholesale_price: Decimal
    wholesale_minimum_quantity: int
    stock_quantity: int
    low_stock_threshold: int
    is_active: bool
    is_coming_soon: bool
    display_order: int
    primary_image_url: Optional[str] = None
    images: List[ProductImageOut] = []
    created_at: datetime
    updated_at: datetime


class ProductDetailOut(ProductOut):
    pass


class ProductImageCreate(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 0
    is_primary: bool = False


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: str = Field(..., min_length=2, max_length=100)
    price: Optional[Decimal] = Field(default=None, gt=0)
    retail_price: Optional[Decimal] = Field(default=None, gt=0)
    wholesale_price: Optional[Decimal] = Field(default=None, gt=0)
    wholesale_minimum_quantity: int = Field(default=10, ge=1)
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)
    is_active: bool = True
    is_coming_soon: bool = False
    display_order: int = 0
    images: List[ProductImageCreate] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, gt=0)
    retail_price: Optional[Decimal] = Field(default=None, gt=0)
    wholesale_price: Optional[Decimal] = Field(default=None, gt=0)
    wholesale_minimum_quantity: Optional[int] = Field(default=None, ge=1)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    is_coming_soon: Optional[bool] = None
    display_order: Optional[int] = None
    images: Optional[List[ProductImageCreate]] = None
