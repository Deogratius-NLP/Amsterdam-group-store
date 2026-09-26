from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.inventory_transaction import InventoryTransaction
from app.models.system_setting import SystemSetting
from app.schemas.order import CreateOrderRequest, OrderConfirmationOut, OrderItemOut, OrderItemInput, InvoiceOut
from app.services.whatsapp_service import build_whatsapp_order_message


def generate_next_order_number(db: Session) -> str:
    """
    Generates human-friendly sequential order number: AMG-000101, AMG-000102...
    """
    count = db.query(func.count(Order.id)).scalar() or 0
    next_seq = 101 + count
    return f"AMG-{next_seq:06d}"


def place_customer_order(db: Session, order_data: CreateOrderRequest) -> OrderConfirmationOut:
    """
    Executes atomic order creation, validation, stock deduction, and audit log generation.
    Supports both single-product orders and multi-item cart orders.
    """
    # 1. Normalize items list: support both multi-item 'items' list and single-item fields
    requested_items: List[OrderItemInput] = []
    if order_data.items and len(order_data.items) > 0:
        requested_items = order_data.items
    elif order_data.product_id and order_data.quantity:
        requested_items = [
            OrderItemInput(
                product_id=order_data.product_id,
                quantity=order_data.quantity,
                pricing_mode=order_data.pricing_mode,
                package_name=order_data.package_name
            )
        ]
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must specify at least one product."
        )

    # 2. Determine Order-Level Pricing Mode
    global_pricing_mode = (order_data.pricing_mode or "RETAIL").strip().upper()
    if global_pricing_mode not in {"RETAIL", "WHOLESALE"}:
        global_pricing_mode = "RETAIL"

    # 3. Fetch, validate, and lock all products
    validated_lines = []
    for line in requested_items:
        query = db.query(Product).filter(Product.id == line.product_id)
        if db.bind.dialect.name == "postgresql":
            query = query.with_for_update()
        
        product = query.first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{line.product_id}' was not found."
            )

        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{product.name}' is currently unavailable."
            )

        if product.is_coming_soon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{product.name}' is in our 'Coming Soon' catalog and cannot be ordered yet."
            )

        # Item-specific pricing mode (falls back to order-level mode)
        item_mode = (line.pricing_mode or global_pricing_mode).strip().upper()
        if item_mode not in {"RETAIL", "WHOLESALE"}:
            item_mode = global_pricing_mode

        # Wholesale minimum check
        if item_mode == "WHOLESALE":
            min_qty = product.wholesale_minimum_quantity or 1
            if line.quantity < min_qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Wholesale orders require a minimum of {min_qty} units for '{product.name}'."
                )

        # Inventory check
        if product.stock_quantity < line.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for '{product.name}'. Only {product.stock_quantity} units available, but {line.quantity} requested."
            )

        # Calculate unit price based on selected package if present
        package_obj = None
        if getattr(line, "package_name", None) and hasattr(product, "packages") and product.packages:
            package_obj = next((pkg for pkg in product.packages if pkg.package_name.lower() == line.package_name.lower()), None)

        if package_obj:
            if item_mode == "WHOLESALE":
                chosen_price = package_obj.wholesale_price if (package_obj.wholesale_price is not None and package_obj.wholesale_price > 0) else package_obj.retail_price
            else:
                chosen_price = package_obj.retail_price
        else:
            if item_mode == "WHOLESALE":
                chosen_price = product.wholesale_price if (product.wholesale_price is not None and product.wholesale_price > 0) else product.price
            else:
                chosen_price = product.retail_price if (product.retail_price is not None and product.retail_price > 0) else product.price

        unit_price = Decimal(str(chosen_price))
        subtotal = unit_price * Decimal(str(line.quantity))

        validated_lines.append({
            "product": product,
            "quantity": line.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
            "item_mode": item_mode,
            "package_name": line.package_name if getattr(line, "package_name", None) else None
        })

    # If any item is wholesale, mark order as wholesale
    order_pricing_mode = "WHOLESALE" if any(vl["item_mode"] == "WHOLESALE" for vl in validated_lines) else "RETAIL"

    total_amount = sum(vl["subtotal"] for vl in validated_lines)

    try:
        # 4. Find or create Customer
        clean_phone = order_data.customer_phone.strip()
        customer = db.query(Customer).filter(Customer.phone == clean_phone).first()
        if not customer:
            customer = Customer(
                name=order_data.customer_name.strip(),
                phone=clean_phone,
                location=order_data.customer_location.strip()
            )
            db.add(customer)
            db.flush()
        else:
            customer.name = order_data.customer_name.strip()
            customer.location = order_data.customer_location.strip()
            db.flush()

        # 5. Generate Unique Sequential Order Number
        order_number = generate_next_order_number(db)

        # 6. Create Order Entity
        order = Order(
            order_number=order_number,
            customer_id=customer.id,
            total_amount=total_amount,
            pricing_mode=order_pricing_mode,
            status="PENDING",
            customer_notes=order_data.customer_notes
        )
        db.add(order)
        db.flush()

        # 7. Create OrderItem Records and Deduct Inventory
        order_items_out = []
        whatsapp_items_summary = []

        for vl in validated_lines:
            prod = vl["product"]
            qty = vl["quantity"]
            u_price = vl["unit_price"]
            sub = vl["subtotal"]

            order_item = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                product_name_snapshot=prod.name,
                package_name=vl.get("package_name"),
                unit_price=u_price,
                quantity=qty,
                subtotal=sub
            )
            db.add(order_item)
            db.flush()

            # Deduct stock
            prev_qty = prod.stock_quantity
            new_qty = prev_qty - qty
            prod.stock_quantity = new_qty

            # Log audit transaction
            inv_tx = InventoryTransaction(
                product_id=prod.id,
                quantity_change=-qty,
                previous_quantity=prev_qty,
                new_quantity=new_qty,
                transaction_type="ORDER_DEDUCTION",
                reason=f"Customer Order {order.order_number} ({vl['item_mode']})",
                order_id=order.id
            )
            db.add(inv_tx)

            order_items_out.append(
                OrderItemOut(
                    id=order_item.id,
                    product_id=prod.id,
                    product_name_snapshot=prod.name,
                    package_name=vl.get("package_name"),
                    unit_price=u_price,
                    quantity=qty,
                    subtotal=sub
                )
            )

            pkg_label = f" ({vl['package_name']})" if vl.get("package_name") else ""
            whatsapp_items_summary.append({
                "name": f"{prod.name}{pkg_label}",
                "quantity": qty,
                "unit_price": float(u_price),
                "subtotal": float(sub)
            })

        # 8. Commit Atomic Transaction
        db.commit()
        db.refresh(order)
        db.refresh(customer)

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while finalizing your order: {str(e)}"
        )

    # 9. Build WhatsApp Message Payload
    first_prod_name = validated_lines[0]["product"].name if len(validated_lines) == 1 else None
    first_qty = validated_lines[0]["quantity"] if len(validated_lines) == 1 else None
    first_price = float(validated_lines[0]["unit_price"]) if len(validated_lines) == 1 else None

    # Retrieve dynamic WhatsApp number from system settings if configured
    wa_setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
    active_wa_number = wa_setting.value if wa_setting and wa_setting.value else None

    plain_msg, wa_url = build_whatsapp_order_message(
        order_number=order.order_number,
        total_amount=float(total_amount),
        customer_name=customer.name,
        customer_phone=customer.phone,
        customer_location=customer.location,
        pricing_mode=order_pricing_mode,
        product_name=first_prod_name,
        quantity=first_qty,
        unit_price=first_price,
        items=whatsapp_items_summary if len(whatsapp_items_summary) > 1 else None,
        wa_number=active_wa_number
    )

    return OrderConfirmationOut(
        id=order.id,
        order_number=order.order_number,
        customer_id=customer.id,
        customer_name=customer.name,
        customer_phone=customer.phone,
        customer_location=customer.location,
        pricing_mode=order.pricing_mode,
        total_amount=order.total_amount,
        status=order.status,
        customer_notes=order.customer_notes,
        items=order_items_out,
        created_at=order.created_at,
        updated_at=order.updated_at,
        whatsapp_url=wa_url,
        whatsapp_message=plain_msg
    )


def get_order_invoice_data(db: Session, order: Order) -> InvoiceOut:
    items_out = [
        OrderItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name_snapshot=item.product_name_snapshot,
            package_name=getattr(item, 'package_name', None),
            unit_price=item.unit_price,
            quantity=item.quantity,
            subtotal=item.subtotal
        )
        for item in order.items
    ]
    return InvoiceOut(
        order_number=order.order_number,
        created_at=order.created_at,
        pricing_mode=order.pricing_mode or "RETAIL",
        status=order.status,
        customer_name=order.customer.name if order.customer else "Valued Customer",
        customer_phone=order.customer.phone if order.customer else "",
        customer_location=order.customer.location if order.customer else "",
        customer_notes=order.customer_notes,
        items=items_out,
        total_amount=order.total_amount
    )
