import uuid
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    product_name_snapshot = Column(String(200), nullable=False)  # Preserves name at time of order
    package_name = Column(String(100), nullable=True)  # Preserves package size at time of order (e.g. 100g)
    unit_price = Column(Numeric(12, 2), nullable=False)  # Preserves price at time of order
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem {self.product_name_snapshot} x {self.quantity}>"
