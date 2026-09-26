import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.product_image import ProductImage


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), index=True, nullable=False)
    slug = Column(String(220), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    category = Column(String(100), index=True, default="Poultry Care", nullable=False)
    price = Column(Numeric(12, 2), nullable=False)  # e.g. 25000.00
    retail_price = Column(Numeric(12, 2), default=0.0, nullable=False)
    wholesale_price = Column(Numeric(12, 2), default=0.0, nullable=False)
    wholesale_minimum_quantity = Column(Integer, default=1, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_coming_soon = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    packages = relationship("ProductPackage", back_populates="product", cascade="all, delete-orphan", order_by="ProductPackage.display_order")
    order_items = relationship("OrderItem", back_populates="product")
    inventory_transactions = relationship("InventoryTransaction", back_populates="product")

    def __repr__(self):
        return f"<Product {self.name} (Stock: {self.stock_quantity})>"


class ProductPackage(Base):
    __tablename__ = "product_packages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    package_name = Column(String(100), nullable=False)  # e.g. "30g", "100g", "250g", "1kg", "5 Litres"
    retail_price = Column(Numeric(12, 2), nullable=False)
    wholesale_price = Column(Numeric(12, 2), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="packages")

    def __repr__(self):
        return f"<ProductPackage {self.package_name} (Retail: {self.retail_price}, Wholesale: {self.wholesale_price})>"
