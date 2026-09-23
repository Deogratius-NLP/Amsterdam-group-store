from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    products,
    orders,
    admin_products,
    admin_orders,
    admin_customers,
    admin_inventory,
    admin_dashboard,
    settings
)

api_router = APIRouter(prefix="/api")

# Public Storefront Routers
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(settings.public_router)

# Admin Protected Routers
api_router.include_router(auth.router)
api_router.include_router(admin_products.router)
api_router.include_router(admin_orders.router)
api_router.include_router(admin_customers.router)
api_router.include_router(admin_inventory.router)
api_router.include_router(admin_dashboard.router)
api_router.include_router(settings.admin_router)
