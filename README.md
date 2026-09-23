# Amsterdam Group E-Commerce Product Ordering & Operations System

A full-stack, production-ready product ordering and inventory management system built for **Amsterdam Group** (Tanzania).

The customer storefront reproduces the Canva visual reference—including the showroom hero, dimensional 3D lime-green **"Shop"** typography, pill search and ordering bar, responsive product grid, 3D overlapping upcoming products carousel, Amsterdam crimson contact banner, interactive product details modal with multi-image packshot carousel, and automated WhatsApp order dispatch.

The management console provides authenticated operations for orders, product catalog, customer directories, and immutable double-entry inventory audit ledgers.

---

## Architecture Overview

```
amsterdam-ordering-system/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/         # Auth, Products, Orders, Admin Operations
│   │   ├── core/                  # Security (Bcrypt, JWT), Config (.env)
│   │   ├── db/                    # SQLAlchemy Engine, Session, Seed Data
│   │   ├── models/                # Normalized DB Models
│   │   ├── schemas/               # Pydantic Request/Response Schemas
│   │   ├── services/              # Atomic Order Placement & Inventory Transactions
│   │   ├── static/products/       # High-res packshots (e.g. Vitamix Plus)
│   │   └── main.py                # FastAPI app entrypoint
│   ├── alembic/                   # Database migrations
│   ├── tests/                     # 100% passing automated pytest suite
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── storefront/        # Header, Hero, ProductCard, Modals, Carousel, Footer
│   │   │   └── admin/             # AdminLayout, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── StorefrontPage.jsx # Public Customer Storefront
│   │   │   └── admin/             # Login, Dashboard, Orders, Products, Customers, Inventory, Settings
│   │   ├── context/               # AuthContext (JWT Session)
│   │   ├── services/              # Axios API Clients
│   │   └── utils/                 # TSh currency formatter (TSh XX,XXX /=)
│   └── package.json
└── README.md
```

---

## Key Features & Business Rules

1. **Customer Storefront Experience**:
   - Live debounced search across product names, descriptions, and categories.
   - Dynamic category pill navigation loaded from backend.
   - Studio packshot treatment honoring the Vitamix Plus reference sample.
   - East African shilling currency formatting: `TSh 25,000 /=`.
   - 3D layered upcoming products carousel with 5 dot indicators.
   - Amsterdam Crimson Contact Banner with functional inquiry capture.

2. **Interactive Product Details Modal & Carousel**:
   - **Desktop Layout**: 2-column split with product details, stock indicators, and quantity selector on the left, and multi-image packshot carousel on the right.
   - **Mobile Layout**: Responsive vertical stack with the carousel on top and thumb-reachable ordering actions below.
   - Interactive quantity selector (+ / -) strictly bounded by available real-time stock.

3. **Atomic Customer Ordering & WhatsApp Dispatch**:
   - Customer supplies: Full Name, WhatsApp-reachable Phone, Free-Text Delivery Location (e.g. `Kinondoni, Dar es Salaam` without forcing map pins), and optional notes.
   - Concurrency safety: Product inventory is locked via `SELECT ... FOR UPDATE` within an atomic transaction to prevent overselling.
   - Submits to `POST /api/orders`, generates sequential human-readable order number (`AMG-000101`), creates `order_items` price snapshots, logs double-entry `inventory_transactions`, and commits atomically.
   - Generates pre-filled WhatsApp message sent to the designated Amsterdam Group line:
     ```
     Hello Amsterdam Group,

     I would like to place an order.

     Order: AMG-000101

     Product:
     Vitamix Plus 1kg × 3

     Customer:
     John Doe

     Phone:
     +255712345678

     Location:
     Kinondoni, Dar es Salaam

     Total:
     TSh 75,000

     Please confirm my order.

     Thank you.
     ```

4. **Complete Admin Management Console**:
   - Same brand visual identity (not a generic SaaS template).
   - **Executive Dashboard**: Real-time sales, order fulfillment, low-stock alerts, and today's orders.
   - **Order Desk**: View all orders, search, filter by status, and update status (`PENDING` → `CONFIRMED` → `PROCESSING` → `READY` → `DELIVERED`, `CANCELLED`).
   - **Stock Restoration**: Cancelling an order automatically returns reserved items to active inventory with an audit log.
   - **Product Management**: Full CRUD, image gallery manager, stock levels, and coming-soon pipeline toggle.
   - **Customer Directory**: Customer profiles, phone numbers, delivery addresses, order counts, and lifetime value.
   - **Inventory Audit Ledger**: Quick stock adjustments with mandatory audit reason logging and chronological audit trails.

---

## Running the Application Locally

### 1. Backend (FastAPI + Python 3.11)

```bash
cd backend

# Create virtual environment and install dependencies
uv venv .venv
# On Windows:
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# Run migrations and seed initial data
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\python.exe -c "from app.db.session import SessionLocal; from app.db.init_db import init_db; db = SessionLocal(); init_db(db); db.close()"

# Run automated test suite
.\.venv\Scripts\pytest.exe -v

# Start FastAPI development server
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

Backend API Swagger Documentation will be accessible at: `http://127.0.0.1:8000/docs`.

### 2. Frontend (React + Vite + Tailwind)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Customer Storefront will be accessible at: `http://localhost:5173`.
Admin Operations Portal will be accessible at: `http://localhost:5173/admin/login`.

---

## Default Administrator Credentials

- **Email**: `admin@amsterdamgroup.co.tz`
- **Password**: `Admin@Amsterdam2026!`
- **Role**: `admin`
