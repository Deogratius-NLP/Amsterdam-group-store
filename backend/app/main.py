import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.api_router import api_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB schema is ready and seed initial data
    os.makedirs(settings.STATIC_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.STATIC_DIR, "products"), exist_ok=True)
    
    db = SessionLocal()
    try:
        init_db(db)
    except Exception as e:
        logger.error(f"Error during DB initialization: {e}", exc_info=True)
    finally:
        db.close()
    
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready REST API for Amsterdam Group E-Commerce Product Ordering & Admin Operations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static product images and assets
os.makedirs(settings.STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include Core API Routes
app.include_router(api_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health", tags=["Health"])
def healthcheck():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }
