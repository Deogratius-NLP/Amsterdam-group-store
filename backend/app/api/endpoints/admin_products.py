import os
import re
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.config import settings
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser
from app.models.product import Product, ProductPackage
from app.models.product_image import ProductImage
from app.models.inventory_transaction import InventoryTransaction
from app.schemas.product import ProductOut, ProductDetailOut, ProductCreate, ProductUpdate, ReorderProductsRequest
from app.api.endpoints.products import _to_product_out

router = APIRouter(prefix="/admin/products", tags=["Admin Products"])


def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", slug).strip("-")


@router.post("/upload-image")
def upload_product_image(
    file: UploadFile = File(...),
    admin: AdminUser = Depends(get_current_admin)
):
    filename = file.filename or "product_image.jpg"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Allowed formats: JPG, PNG, WEBP, SVG"
        )

    # Static destination directory
    upload_dir = Path(settings.STATIC_DIR) / "products"
    upload_dir.mkdir(parents=True, exist_ok=True)

    clean_base = re.sub(r"[^a-zA-Z0-9_-]", "_", os.path.splitext(filename)[0])[:30]
    unique_filename = f"{clean_base}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = upload_dir / unique_filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Sync to frontend public/products as a local fallback
    frontend_dir = Path("..") / "frontend" / "public" / "products"
    try:
        if frontend_dir.parent.exists():
            frontend_dir.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(dest_path, frontend_dir / unique_filename)
    except Exception:
        pass

    return {
        "image_url": f"/static/products/{unique_filename}",
        "filename": unique_filename
    }


@router.get("", response_model=List[ProductOut])
def list_admin_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    query = db.query(Product)
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    if category and category.lower() != "all":
        query = query.filter(Product.category == category)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.category.ilike(pattern),
                Product.description.ilike(pattern)
            )
        )
    products = query.order_by(Product.display_order, Product.created_at.desc()).all()
    return [_to_product_out(p) for p in products]


@router.post("", response_model=ProductDetailOut, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    base_slug = data.slug or slugify(data.name)
    slug = base_slug
    counter = 1
    while db.query(Product).filter(Product.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    retail_price = data.retail_price or data.price
    price = data.price or retail_price
    wholesale_price = data.wholesale_price or (round(price * 0.85, 2) if price else 0.0)
    wholesale_min_qty = data.wholesale_minimum_quantity or 10

    product = Product(
        name=data.name,
        slug=slug,
        description=data.description,
        instructions=data.instructions,
        category=data.category,
        price=price,
        retail_price=retail_price,
        wholesale_price=wholesale_price,
        wholesale_minimum_quantity=wholesale_min_qty,
        stock_quantity=data.stock_quantity,
        low_stock_threshold=data.low_stock_threshold,
        is_active=data.is_active,
        is_coming_soon=data.is_coming_soon,
        display_order=data.display_order
    )
    db.add(product)
    db.flush()

    # Add images
    for idx, img in enumerate(data.images):
        p_img = ProductImage(
            product_id=product.id,
            image_url=img.image_url,
            alt_text=img.alt_text or product.name,
            display_order=img.display_order or idx,
            is_primary=img.is_primary or (idx == 0)
        )
        db.add(p_img)

    # Add packages if provided
    for idx, pkg_data in enumerate(data.packages or []):
        pkg = ProductPackage(
            product_id=product.id,
            package_name=pkg_data.package_name.strip(),
            retail_price=pkg_data.retail_price,
            wholesale_price=pkg_data.wholesale_price,
            display_order=pkg_data.display_order if pkg_data.display_order is not None else idx,
            is_active=pkg_data.is_active
        )
        db.add(pkg)

    # Initial inventory log if stock > 0
    if product.stock_quantity > 0:
        tx = InventoryTransaction(
            product_id=product.id,
            quantity_change=product.stock_quantity,
            previous_quantity=0,
            new_quantity=product.stock_quantity,
            transaction_type="RESTOCK",
            reason="Initial product creation inventory",
            created_by=admin.id
        )
        db.add(tx)

    db.commit()
    db.refresh(product)
    return _to_product_out(product)


@router.put("/reorder", response_model=List[ProductOut])
def reorder_products(
    data: ReorderProductsRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    for index, prod_id in enumerate(data.product_ids):
        db.query(Product).filter(Product.id == prod_id).update({"display_order": index})
    db.commit()
    products = db.query(Product).order_by(Product.display_order, Product.created_at.desc()).all()
    return [_to_product_out(p) for p in products]


@router.get("/{product_id}", response_model=ProductDetailOut)
def get_admin_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _to_product_out(product)


@router.put("/{product_id}", response_model=ProductDetailOut)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_fields = data.model_dump(exclude_unset=True)
    images_data = update_fields.pop("images", None)
    packages_data = update_fields.pop("packages", None)

    # Sync price and retail_price if one was updated
    if "retail_price" in update_fields and "price" not in update_fields:
        update_fields["price"] = update_fields["retail_price"]
    elif "price" in update_fields and "retail_price" not in update_fields:
        update_fields["retail_price"] = update_fields["price"]

    # Check if stock is being manually updated via product edit
    if "stock_quantity" in update_fields and update_fields["stock_quantity"] != product.stock_quantity:
        new_stock = update_fields["stock_quantity"]
        diff = new_stock - product.stock_quantity
        tx = InventoryTransaction(
            product_id=product.id,
            quantity_change=diff,
            previous_quantity=product.stock_quantity,
            new_quantity=new_stock,
            transaction_type="MANUAL_ADJUSTMENT",
            reason="Manual product edit stock adjustment",
            created_by=admin.id
        )
        db.add(tx)

    for field, val in update_fields.items():
        setattr(product, field, val)

    if images_data is not None:
        # Replace images
        db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        for idx, img in enumerate(images_data):
            p_img = ProductImage(
                product_id=product.id,
                image_url=img["image_url"],
                alt_text=img.get("alt_text") or product.name,
                display_order=img.get("display_order", idx),
                is_primary=img.get("is_primary", idx == 0)
            )
            db.add(p_img)

    if packages_data is not None:
        # Replace packages
        db.query(ProductPackage).filter(ProductPackage.product_id == product.id).delete()
        for idx, pkg_dict in enumerate(packages_data):
            pkg = ProductPackage(
                product_id=product.id,
                package_name=pkg_dict["package_name"].strip(),
                retail_price=pkg_dict["retail_price"],
                wholesale_price=pkg_dict["wholesale_price"],
                display_order=pkg_dict.get("display_order", idx),
                is_active=pkg_dict.get("is_active", True)
            )
            db.add(pkg)

    db.commit()
    db.refresh(product)
    return _to_product_out(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Soft delete / deactivate to preserve historical orders
    product.is_active = False
    db.commit()
    return {"message": "Product successfully deactivated", "id": product_id}
