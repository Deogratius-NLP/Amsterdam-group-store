from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.inventory_transaction import InventoryTransaction
from app.models.admin_user import AdminUser
from app.schemas.inventory import InventoryTransactionOut, InventoryItemOut


def adjust_inventory(
    db: Session,
    product_id: str,
    quantity_change: int,
    reason: str,
    transaction_type: str = "MANUAL_ADJUSTMENT",
    order_id: Optional[str] = None,
    admin_id: Optional[str] = None
) -> InventoryTransaction:
    """
    Safely adjusts product inventory with atomic update and transaction log.
    """
    # Attempt row-level lock if supported
    query = db.query(Product).filter(Product.id == product_id)
    if db.bind.dialect.name == "postgresql":
        query = query.with_for_update()
    
    product = query.first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    previous_quantity = product.stock_quantity
    new_quantity = previous_quantity + quantity_change

    if new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Adjustment would result in negative stock. Current: {previous_quantity}, Change: {quantity_change}"
        )

    product.stock_quantity = new_quantity

    inv_tx = InventoryTransaction(
        product_id=product.id,
        quantity_change=quantity_change,
        previous_quantity=previous_quantity,
        new_quantity=new_quantity,
        transaction_type=transaction_type,
        reason=reason,
        order_id=order_id,
        created_by=admin_id
    )
    db.add(inv_tx)
    db.flush()
    return inv_tx


def get_inventory_status_list(db: Session) -> List[InventoryItemOut]:
    products = db.query(Product).order_by(Product.category, Product.name).all()
    results = []
    for p in products:
        if p.stock_quantity <= 0:
            stock_status = "OUT_OF_STOCK"
        elif p.stock_quantity <= p.low_stock_threshold:
            stock_status = "LOW_STOCK"
        else:
            stock_status = "IN_STOCK"

        results.append(
            InventoryItemOut(
                product_id=p.id,
                product_name=p.name,
                category=p.category,
                price=p.price,
                stock_quantity=p.stock_quantity,
                low_stock_threshold=p.low_stock_threshold,
                status=stock_status,
                is_active=p.is_active
            )
        )
    return results
