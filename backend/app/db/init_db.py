import logging
from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.admin_user import AdminUser
from app.models.product import Product, ProductPackage
from app.models.product_image import ProductImage
from app.models.inventory_transaction import InventoryTransaction
from app.models.system_setting import SystemSetting

logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # 1. Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # Ensure 'instructions' column exists in products table and 'package_name' in order_items
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            if "sqlite" in str(engine.url):
                res = conn.execute(text("PRAGMA table_info(products)"))
                cols = [row[1] for row in res.fetchall()]
                if cols and "instructions" not in cols:
                    conn.execute(text("ALTER TABLE products ADD COLUMN instructions TEXT"))
                    conn.commit()

                res_items = conn.execute(text("PRAGMA table_info(order_items)"))
                item_cols = [row[1] for row in res_items.fetchall()]
                if item_cols and "package_name" not in item_cols:
                    conn.execute(text("ALTER TABLE order_items ADD COLUMN package_name VARCHAR(100)"))
                    conn.commit()
            else:
                conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS instructions TEXT"))
                conn.execute(text("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS package_name VARCHAR(100)"))
                conn.commit()
    except Exception as e:
        logger.warning(f"Schema compatibility check skipped: {e}")

    # Seed Default Settings
    wa_setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
    if not wa_setting:
        wa_setting = SystemSetting(
            key="whatsapp_number",
            value=settings.WHATSAPP_NUMBER,
            description="Official WhatsApp business recipient phone for orders"
        )
        db.add(wa_setting)
        db.commit()

    # 2. Seed Default Admin User
    admin = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_DEFAULT_EMAIL).first()
    if not admin:
        admin = AdminUser(
            name=settings.ADMIN_DEFAULT_NAME,
            email=settings.ADMIN_DEFAULT_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_DEFAULT_PASSWORD),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        logger.info(f"Default admin created: {settings.ADMIN_DEFAULT_EMAIL}")
    elif not admin.is_active:
        admin.is_active = True
        db.commit()
        logger.info(f"Re-activated admin user: {settings.ADMIN_DEFAULT_EMAIL}")

    # 3. Seed Sample Products if table empty
    existing_product_count = db.query(Product).count()
    if existing_product_count == 0:
        logger.info("Seeding initial Amsterdam Group products...")

        products_data = [
            {
                "name": "Vitamix Plus 1kg",
                "slug": "vitamix-plus-1kg",
                "description": "Feed Grade Vitamins formulated for poultry (layers, broilers, and chicks). Contains Vitamin A, D3, E, C, B1, B3, B6, K, B12, C and vital nutrients such as Niacin and Calcium Pantothenate. Guaranteed to improve flock vitality, egg laying rates, and feed efficiency.",
                "category": "Feed Grade Vitamins",
                "price": 25000.00,
                "stock_quantity": 120,
                "low_stock_threshold": 15,
                "is_active": True,
                "is_coming_soon": False,
                "display_order": 1,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vitamix Plus 1kg Front Pack", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vitamix Plus Ingredients & Usage", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Vitamix Plus Packaging Seal", "is_primary": False},
                ]
            },
            {
                "name": "Chick Start Formula 500g",
                "slug": "chick-start-formula-500g",
                "description": "High-concentration amino acid and electrolyte starter pack for day-old chicks. Minimizes transit mortality and stimulates robust digestive enzymes.",
                "category": "Feed Grade Vitamins",
                "price": 18000.00,
                "stock_quantity": 85,
                "low_stock_threshold": 10,
                "is_active": True,
                "is_coming_soon": False,
                "display_order": 2,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Chick Start Formula", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Chick Start Formula Detail", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Chick Start Instructions", "is_primary": False},
                ]
            },
            {
                "name": "Egg Max Layer Booster 1kg",
                "slug": "egg-max-layer-booster-1kg",
                "description": "Premium calcium, phosphorus, and vitamin D3 supplement engineered to eliminate soft shells, prolong peak production periods, and boost egg size.",
                "category": "Supplements",
                "price": 32000.00,
                "stock_quantity": 45,
                "low_stock_threshold": 8,
                "is_active": True,
                "is_coming_soon": False,
                "display_order": 3,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Egg Max Layer Booster", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Egg Max Layer Booster Back", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Egg Max Certificate", "is_primary": False},
                ]
            },
            {
                "name": "Aqua-Vita Poultry Electrolytes 250g",
                "slug": "aqua-vita-poultry-electrolytes-250g",
                "description": "Rapid rehydration salts with Vitamin C designed to shield commercial poultry flocks from heat stroke, dehydration, and vaccination stress.",
                "category": "Supplements",
                "price": 15000.00,
                "stock_quantity": 90,
                "low_stock_threshold": 15,
                "is_active": True,
                "is_coming_soon": False,
                "display_order": 4,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Aqua-Vita Front", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Aqua-Vita Soluble Mix", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Aqua-Vita Dosage", "is_primary": False},
                ]
            },
            {
                "name": "Bio-Shield Disinfectant 5L",
                "slug": "bio-shield-disinfectant-5l",
                "description": "Heavy-duty veterinary disinfectant for poultry sheds, drinkers, incubators, and biosecurity footbaths. Highly active against viruses and bacteria.",
                "category": "Biosecurity",
                "price": 45000.00,
                "stock_quantity": 30,
                "low_stock_threshold": 5,
                "is_active": True,
                "is_coming_soon": False,
                "display_order": 5,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Bio-Shield Canister", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Bio-Shield Dilution Guide", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Bio-Shield Application", "is_primary": False},
                ]
            },
            {
                "name": "Broiler Rapid Weight 5kg",
                "slug": "broiler-rapid-weight-5kg",
                "description": "Specialized microbial feed additive and growth promoter for broiler finishers. Accelerates FCR, carcass quality, and uniform weight gain.",
                "category": "Feed Grade Vitamins",
                "price": 68000.00,
                "stock_quantity": 25,
                "low_stock_threshold": 5,
                "is_active": True,
                "is_coming_soon": False,
                "display_order": 6,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Broiler Rapid Weight Bag", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Broiler Rapid Weight Nutrition Table", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Broiler Rapid Weight Directions", "is_primary": False},
                ]
            },
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
            # Coming Soon items
            {
                "name": "Pro-Gastro Poultry Probiotic",
                "slug": "pro-gastro-poultry-probiotic",
                "description": "Next-generation multi-strain beneficial gut microflora powder to replace prophylactic antibiotics and support optimal intestinal absorption.",
                "category": "Coming Soon",
                "price": 35000.00,
                "stock_quantity": 0,
                "low_stock_threshold": 0,
                "is_active": True,
                "is_coming_soon": True,
                "display_order": 1,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Pro-Gastro Probiotic Upcoming", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Pro-Gastro Research", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Pro-Gastro Sample", "is_primary": False},
                ]
            },
            {
                "name": "Mega-Lact Dairy Bovine Pack",
                "slug": "mega-lact-dairy-bovine-pack",
                "description": "Advanced rumen-bypass protein and mineral premix for high-yield dairy cows in East Africa. Supports continuous lactation and cow body condition.",
                "category": "Coming Soon",
                "price": 55000.00,
                "stock_quantity": 0,
                "low_stock_threshold": 0,
                "is_active": True,
                "is_coming_soon": True,
                "display_order": 2,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Mega-Lact Dairy", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Mega-Lact Nutrition", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Mega-Lact Results", "is_primary": False},
                ]
            },
            {
                "name": "Aqua-Pur Fish Mineralizer",
                "slug": "aqua-pur-fish-mineralizer",
                "description": "Essential water buffering and trace element formulation for tilapia and catfish ponds. Maximizes survival rates and reduces pond turbidity.",
                "category": "Coming Soon",
                "price": 40000.00,
                "stock_quantity": 0,
                "low_stock_threshold": 0,
                "is_active": True,
                "is_coming_soon": True,
                "display_order": 3,
                "images": [
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Aqua-Pur Aquaculture", "is_primary": True},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Aqua-Pur Fish Farm Trial", "is_primary": False},
                    {"url": f"{settings.MEDIA_BASE_URL}/products/vitamix-plus-1.jpg", "alt": "Aqua-Pur Water Mix", "is_primary": False},
                ]
            },
        ]

        for item in products_data:
            images_data = item.pop("images")
            if "retail_price" not in item:
                item["retail_price"] = item["price"]
            if "wholesale_price" not in item:
                item["wholesale_price"] = round(item["price"] * 0.85, 2)
            if "wholesale_minimum_quantity" not in item:
                item["wholesale_minimum_quantity"] = 10
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

            # Record initial inventory transaction if item has initial stock
            if prod.stock_quantity > 0:
                tx = InventoryTransaction(
                    product_id=prod.id,
                    quantity_change=prod.stock_quantity,
                    previous_quantity=0,
                    new_quantity=prod.stock_quantity,
                    transaction_type="RESTOCK",
                    reason="Initial product seed inventory",
                    created_by=admin.id if admin else None
                )
                db.add(tx)

        db.commit()
        logger.info("Products seeded successfully with multi-image carousels and inventory logs.")

    # 4. Seed sample packages for multi-pack products if none exist yet
    try:
        if db.query(ProductPackage).count() == 0:
            logger.info("Seeding initial product packages...")
            all_prods = db.query(Product).all()
            for prod in all_prods:
                pname = prod.name.lower()
                if "chick" in pname or "vita-chick" in pname:
                    db.add_all([
                        ProductPackage(product_id=prod.id, package_name="30g", retail_price=3500.00, wholesale_price=3000.00, display_order=0),
                        ProductPackage(product_id=prod.id, package_name="100g", retail_price=10000.00, wholesale_price=8500.00, display_order=1),
                        ProductPackage(product_id=prod.id, package_name="250g", retail_price=22000.00, wholesale_price=18500.00, display_order=2),
                    ])
                elif "vitamix" in pname or "egg max" in pname:
                    db.add_all([
                        ProductPackage(product_id=prod.id, package_name="100g", retail_price=4000.00, wholesale_price=3400.00, display_order=0),
                        ProductPackage(product_id=prod.id, package_name="250g", retail_price=9000.00, wholesale_price=7650.00, display_order=1),
                        ProductPackage(product_id=prod.id, package_name="1kg", retail_price=prod.retail_price or 25000.00, wholesale_price=prod.wholesale_price or 21250.00, display_order=2),
                    ])
                elif "vital-amino" in pname or "layer" in pname:
                    db.add_all([
                        ProductPackage(product_id=prod.id, package_name="500g", retail_price=15000.00, wholesale_price=12500.00, display_order=0),
                        ProductPackage(product_id=prod.id, package_name="1kg", retail_price=prod.retail_price or 28000.00, wholesale_price=prod.wholesale_price or 23800.00, display_order=1),
                    ])
            db.commit()
            logger.info("Product packages seeded successfully.")
    except Exception as e:
        logger.warning(f"Product package seeding skipped: {e}")
        db.rollback()
