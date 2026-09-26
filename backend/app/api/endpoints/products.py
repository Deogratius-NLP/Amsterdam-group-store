from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductOut, ProductDetailOut, ProductImageOut, ProductPackageOut

router = APIRouter(prefix="/products", tags=["Public Products"])


def _to_product_out(p: Product) -> ProductOut:
    primary_img = next((img.image_url for img in p.images if img.is_primary), None)
    if not primary_img and p.images:
        primary_img = p.images[0].image_url
    
    images_out = [
        ProductImageOut(
            id=img.id,
            image_url=img.image_url,
            alt_text=img.alt_text,
            display_order=img.display_order,
            is_primary=img.is_primary
        )
        for img in sorted(p.images, key=lambda x: x.display_order)
    ]

    packages_out = [
        ProductPackageOut(
            id=pkg.id,
            package_name=pkg.package_name,
            retail_price=pkg.retail_price,
            wholesale_price=pkg.wholesale_price,
            display_order=pkg.display_order,
            is_active=pkg.is_active
        )
        for pkg in sorted(p.packages, key=lambda x: x.display_order)
    ] if hasattr(p, "packages") and p.packages else []

    return ProductOut(
        id=p.id,
        name=p.name,
        slug=p.slug,
        description=p.description,
        instructions=getattr(p, 'instructions', None),
        category=p.category,
        price=p.price,
        retail_price=p.retail_price if p.retail_price is not None else p.price,
        wholesale_price=p.wholesale_price if p.wholesale_price is not None else p.price,
        wholesale_minimum_quantity=p.wholesale_minimum_quantity or 1,
        stock_quantity=p.stock_quantity,
        low_stock_threshold=p.low_stock_threshold,
        is_active=p.is_active,
        is_coming_soon=p.is_coming_soon,
        display_order=p.display_order,
        primary_image_url=primary_img,
        images=images_out,
        packages=packages_out,
        created_at=p.created_at,
        updated_at=p.updated_at
    )


@router.get("", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = Query(None, description="Search keyword in product title or description"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    coming_soon: Optional[bool] = Query(False, description="Filter coming-soon products"),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)

    if coming_soon is not None:
        query = query.filter(Product.is_coming_soon == coming_soon)

    if category and category.lower() != "all":
        query = query.filter(Product.category == category)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
                Product.category.ilike(pattern)
            )
        )

    products = query.order_by(Product.display_order, Product.name).all()
    return [_to_product_out(p) for p in products]


@router.get("/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).filter(
        Product.is_active == True,
        Product.is_coming_soon == False
    ).distinct().all()
    return [c[0] for c in categories if c[0]]


@router.get("/{product_id}", response_model=ProductDetailOut)
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or unavailable."
        )

    return _to_product_out(product)
