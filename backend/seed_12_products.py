import sys
import os

# Ensure backend directory is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.core.config import settings
from app.models.admin_user import AdminUser
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.inventory_transaction import InventoryTransaction

additional_products = [
    {
        "name": "Calci-Dense Bone & Shell 2kg",
        "slug": "calci-dense-bone-shell-2kg",
        "description": "Bioavailable micro-pulverized oyster shell and coral calcium enriched with Vitamin D3 to fortify skeletal structure, prevent rickets, and eliminate shell fractures in commercial layers.",
        "category": "Supplements",
        "price": 28000.00,
        "stock_quantity": 60,
        "low_stock_threshold": 10,
        "is_active": True,
        "is_coming_soon": False,
        "display_order": 7,
        "images": [
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Calci-Dense Bone & Shell Pack", "is_primary": True},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Calci-Dense Mineral Composition", "is_primary": False},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Calci-Dense Dosage Guide", "is_primary": False},
        ]
    },
    {
        "name": "Toxi-Bind Mycotoxin Inhibitor 1kg",
        "slug": "toxi-bind-mycotoxin-inhibitor-1kg",
        "description": "Broad-spectrum aluminosilicate and yeast cell wall mycotoxin binder designed to neutralize aflatoxins and ochratoxins, safeguard liver function, and maintain high feed conversion.",
        "category": "Biosecurity",
        "price": 38000.00,
        "stock_quantity": 40,
        "low_stock_threshold": 8,
        "is_active": True,
        "is_coming_soon": False,
        "display_order": 8,
        "images": [
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Toxi-Bind Mycotoxin Inhibitor", "is_primary": True},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Toxi-Bind Feed Mixing Guidelines", "is_primary": False},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Toxi-Bind Efficacy Certificate", "is_primary": False},
        ]
    },
    {
        "name": "Oxi-Cleanse Water Sanitizer 1L",
        "slug": "oxi-cleanse-water-sanitizer-1l",
        "description": "Stabilized chlorine dioxide drinking water sanitizer eliminating algae, fungal biofilm, and bacterial pathogens in automatic poultry drinkers and reservoir storage tanks.",
        "category": "Biosecurity",
        "price": 22000.00,
        "stock_quantity": 75,
        "low_stock_threshold": 12,
        "is_active": True,
        "is_coming_soon": False,
        "display_order": 9,
        "images": [
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Oxi-Cleanse Water Sanitizer Bottle", "is_primary": True},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Oxi-Cleanse Water Line Flusher", "is_primary": False},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Oxi-Cleanse Purity Standard", "is_primary": False},
        ]
    },
    {
        "name": "Vital-Amino Booster 500ml",
        "slug": "vital-amino-booster-500ml",
        "description": "Liquid concentrated essential amino acids (Lysine, Methionine, Threonine) with B-complex vitamins for immediate post-vaccination stress recovery and accelerated broiler development.",
        "category": "Feed Grade Vitamins",
        "price": 34000.00,
        "stock_quantity": 50,
        "low_stock_threshold": 10,
        "is_active": True,
        "is_coming_soon": False,
        "display_order": 10,
        "images": [
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vital-Amino Booster Bottle", "is_primary": True},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vital-Amino Nutritional Specs", "is_primary": False},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vital-Amino Water Administration", "is_primary": False},
        ]
    },
    {
        "name": "Immuno-Max Herbal Premix 1kg",
        "slug": "immuno-max-herbal-premix-1kg",
        "description": "Natural phytogenic blend of oregano, garlic, and thyme essential oils stimulating flock cellular immunity and respiratory resistance against common seasonal infections.",
        "category": "Supplements",
        "price": 42000.00,
        "stock_quantity": 35,
        "low_stock_threshold": 6,
        "is_active": True,
        "is_coming_soon": False,
        "display_order": 11,
        "images": [
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Immuno-Max Herbal Premix Pack", "is_primary": True},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Immuno-Max Botanical Formulation", "is_primary": False},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Immuno-Max Organic Certification", "is_primary": False},
        ]
    },
    {
        "name": "Vita-Chick Electrolyte Plus 100g",
        "slug": "vita-chick-electrolyte-plus-100g",
        "description": "Pocket-sized rapid dissolution rehydration powder with dextrose and vital electrolytes for immediate chick intake on arrival and extreme heat wave stress relief.",
        "category": "Supplements",
        "price": 8500.00,
        "stock_quantity": 110,
        "low_stock_threshold": 20,
        "is_active": True,
        "is_coming_soon": False,
        "display_order": 12,
        "images": [
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vita-Chick Electrolyte Sachet", "is_primary": True},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vita-Chick Fast Dissolving Mix", "is_primary": False},
            {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vita-Chick Preparation Steps", "is_primary": False},
        ]
    },
]

def main():
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).first()
        admin_id = admin.id if admin else None

        added_count = 0
        for item in additional_products:
            existing = db.query(Product).filter(Product.slug == item["slug"]).first()
            if existing:
                print(f"Product already exists: {item['name']}")
                continue

            images_data = item.pop("images")
            prod = Product(**item)
            db.add(prod)
            db.flush()

            for idx, img in enumerate(images_data):
                p_img = ProductImage(
                    product_id=prod.id,
                    image_url=img["url"],
                    alt_text=img.get("alt", prod.name),
                    display_order=idx,
                    is_primary=img.get("is_primary", idx == 0)
                )
                db.add(p_img)

            if prod.stock_quantity > 0:
                tx = InventoryTransaction(
                    product_id=prod.id,
                    quantity_change=prod.stock_quantity,
                    previous_quantity=0,
                    new_quantity=prod.stock_quantity,
                    transaction_type="RESTOCK",
                    reason="Initial product seed inventory",
                    created_by=admin_id
                )
                db.add(tx)

            added_count += 1
            print(f"Added product: {prod.name} (ID: {prod.id})")

        db.commit()
        print(f"\nSuccessfully added {added_count} new products.")

        total_active = db.query(Product).filter(Product.is_active == True, Product.is_coming_soon == False).count()
        print(f"Total active products now in database: {total_active}")

    finally:
        db.close()

if __name__ == "__main__":
    main()
