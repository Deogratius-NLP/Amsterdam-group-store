import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g. AMG-000101
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    pricing_mode = Column(String(20), default="RETAIL", nullable=False, index=True)
    status = Column(String(30), default="PENDING", nullable=False, index=True)
    # Statuses: PENDING, CONFIRMED, PROCESSING, READY, DELIVERED, CANCELLED
    customer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    inventory_transactions = relationship("InventoryTransaction", back_populates="order")

    def __repr__(self):
        return f"<Order {self.order_number} - {self.status}>"
