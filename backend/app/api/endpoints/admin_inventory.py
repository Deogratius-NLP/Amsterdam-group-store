from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.product import Product
from app.models.inventory_transaction import InventoryTransaction
from app.schemas.inventory import (
    InventoryItemOut,
    InventoryAdjustmentRequest,
    InventoryTransactionOut
)
from app.services.inventory_service import adjust_inventory, get_inventory_status_list

router = APIRouter(prefix="/admin/inventory", tags=["Admin Inventory"])


@router.get("", response_model=List[InventoryItemOut])
def list_inventory_status(
    status_filter: Optional[str] = Query(None, description="Filter: ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    items = get_inventory_status_list(db)
    if status_filter and status_filter.upper() != "ALL":
        items = [i for i in items if i.status == status_filter.upper()]
    return items


@router.post("/adjustments", response_model=InventoryTransactionOut, status_code=status.HTTP_201_CREATED)
def record_inventory_adjustment(
    data: InventoryAdjustmentRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    tx = adjust_inventory(
        db=db,
        product_id=data.product_id,
        quantity_change=data.quantity_change,
        reason=data.reason,
        transaction_type="MANUAL_ADJUSTMENT",
        admin_id=admin.id
    )
    db.commit()
    db.refresh(tx)

    product = db.query(Product).filter(Product.id == tx.product_id).first()
    return InventoryTransactionOut(
        id=tx.id,
        product_id=tx.product_id,
        product_name=product.name if product else "Unknown",
        quantity_change=tx.quantity_change,
        previous_quantity=tx.previous_quantity,
        new_quantity=tx.new_quantity,
        transaction_type=tx.transaction_type,
        reason=tx.reason,
        order_id=tx.order_id,
        created_by_name=admin.name,
        created_at=tx.created_at
    )


@router.get("/transactions", response_model=List[InventoryTransactionOut])
def list_inventory_transactions(
    product_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    query = db.query(InventoryTransaction)
    if product_id:
        query = query.filter(InventoryTransaction.product_id == product_id)

    transactions = query.order_by(InventoryTransaction.created_at.desc()).offset(offset).limit(limit).all()
    results = []
    for tx in transactions:
        results.append(
            InventoryTransactionOut(
                id=tx.id,
                product_id=tx.product_id,
                product_name=tx.product.name if tx.product else "Unknown",
                quantity_change=tx.quantity_change,
                previous_quantity=tx.previous_quantity,
                new_quantity=tx.new_quantity,
                transaction_type=tx.transaction_type,
                reason=tx.reason,
                order_id=tx.order_id,
                created_by_name=tx.admin.name if tx.admin else "System",
                created_at=tx.created_at
            )
        )
    return results
