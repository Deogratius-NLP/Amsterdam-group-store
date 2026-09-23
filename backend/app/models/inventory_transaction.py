import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    quantity_change = Column(Integer, nullable=False)  # Negative for deduction (e.g. -3), positive for restock (+50)
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False, index=True)
    # Types: ORDER_DEDUCTION, MANUAL_ADJUSTMENT, RESTOCK, RETURN_RESTOCK, ORDER_CANCELLATION
    reason = Column(Text, nullable=False)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=True, index=True)
    created_by = Column(String(36), ForeignKey("admin_users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="inventory_transactions")
    order = relationship("Order", back_populates="inventory_transactions")
    admin = relationship("AdminUser", foreign_keys=[created_by])

    def __repr__(self):
        return f"<InventoryTransaction {self.product_id} ({self.quantity_change}) Type: {self.transaction_type}>"
