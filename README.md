# POS & Inventory Management System

A production-ready Point of Sale and inventory management system built with NestJS, Prisma, PostgreSQL, and React.

## Features

- 🔐 JWT Authentication with role-based access control
- 📦 Product management with barcode support
- 🛒 POS sales with automatic stock movements
- 📊 Inventory tracking (event-sourced design)
- 📥 Goods Receipt Notes (GRN) with purchasing
- 🏪 Multi-branch support
- 💰 Daily sales summaries (Z-reports)

## Tech Stack

**Backend:**
- NestJS (Node.js + TypeScript)
- Prisma ORM
- PostgreSQL
- Passport JWT Authentication

**Frontend:**
- React 18 + TypeScript
- Vite
- Axios
- React Router

## Quick Start

### Prerequisites

- Node.js 18+ (Node 20+ recommended for Vite)
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create a PostgreSQL database
createdb pos_db

# Or using psql:
psql -U postgres
CREATE DATABASE pos_db;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial data (creates admin user, sample products, roles)
npx prisma db seed

# Start development server
npm run start:dev
```

Backend will run on **http://localhost:3000**

### 3. Test Backend API

Login to get access token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Test barcode lookup:

```bash
curl http://localhost:3000/api/products/by-barcode/1234567890123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. POS Client Setup (In Progress)

```bash
cd pos-client
npm install
npm run dev
```

POS client will run on **http://localhost:5173**

---

## Default Credentials

After running the seed script:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Cashier | cashier | cashier123 |

---

## API Documentation

### Authentication

- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Products

- `GET /api/products` - List products (with search, filters, pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/by-barcode/:barcode` - **Get product by barcode (for POS)**
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product

### POS / Sales

- `POST /api/pos/sales` - **Create sale (with stock movements)**
- `GET /api/pos/sales/:id` - Get invoice details
- `GET /api/pos/daily-summary?branchId=1&date=2024-12-17` - Daily sales summary for Z-report

### Stock

- `GET /api/stock/on-hand` - Get stock quantities by product/location
- `GET /api/stock/locations` - List stock locations
- `GET /api/stock/movements` - Movement history
- `POST /api/stock/adjustments` - Manual stock adjustment

### Purchasing

- `GET /api/purchasing/suppliers` - List suppliers
- `POST /api/purchasing/suppliers` - Create supplier
- `POST /api/purchasing/grn` - **Create Goods Receipt Note (with stock movements)**
- `GET /api/purchasing/grn` - List GRNs
- `GET /api/purchasing/grn/:id` - Get GRN details

---

## Database Schema

See [backend/prisma/schema.prisma](backend/prisma/schema.prisma) for complete schema.

**Key Tables:**
- `users`, `roles`, `permissions` - Authentication & authorization
- `products`, `categories` - Product catalog
- `stock_locations`, `stock_movements` - Inventory tracking
- `sales_invoices`, `sales_lines` - POS sales
- `goods_receipts`, `goods_receipt_lines` - Purchasing/receiving
- `suppliers` - Supplier management

---

## Project Structure

```
city-tools-system/
├── backend/                # NestJS API server
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data script
│   ├── src/
│   │   ├── auth/          # Authentication (JWT, login, refresh)
│   │   ├── products/      # Product management
│   │   ├── sales/         # POS sales module
│   │   ├── stock/         # Stock/inventory management
│   │   ├── purchasing/    # Suppliers & GRN
│   │   └── main.ts        # App entry point
│   └── .env.example
├── pos-client/            # React POS terminal app
└── backoffice/            # React admin/back-office app (planned)
```

---

## Key Features Explained

### Barcode-Driven POS

Products have unique barcodes. The POS workflow:
1. Scan barcode → `GET /api/products/by-barcode/:barcode`
2. Add to cart
3. Submit sale → `POST /api/pos/sales` (creates invoice + updates stock)

### Event-Sourced Inventory

Stock quantities are calculated from `stock_movements` table:
- Sales create **negative** movements  
- GRN creates **positive** movements
- Adjustments create movements with type `ADJUSTMENT`
- Stock on-hand = SUM of all movements

### Transactional Safety

Critical operations use database transactions:
- **Sale**: Invoice + LineItems + StockMovements (atomic)
- **GRN**: Receipt + LineItems + StockMovements + CostUpdate (atomic)

### Auto-Generated Document Numbers

- Invoices: `BR001-20241217-0001` (BranchCode-Date-Sequence)
- GRNs: `GRN-BR001-20241217-0001`

---

## Development Commands

### Backend

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database
npx prisma studio          # GUI for database
npx prisma db push         # Push schema changes
npx prisma db seed         # Run seed script
npx prisma migrate dev     # Create migration
```

### Frontend (POS Client)

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Deployment

### Local Shop Deployment

1. **Server PC** (Windows or Linux):
   - Install Node.js and PostgreSQL
   - Clone repository
   - Run backend setup steps
   - Configure static IP (e.g., 192.168.10.10)

2. **Client PCs** (same LAN):
   - Set `VITE_API_URL=http://192.168.10.10:3000/api` in frontend
   - Build and serve frontend or run dev server

3. **Backup**:
   - Schedule daily `pg_dump` to backup database
   - Copy backups to external drive or cloud

---

## Roadmap

**V1 (Current)**:
- ✅ Backend API (complete)
- 🚧 POS Client UI
- ⏳ Back Office UI

**V2 (Future)**:
- Sales returns
- Purchase Orders UI
- Advanced reports (profit, top sellers, low stock alerts)
- Thermal printer integration
- Multi-branch sync via cloud
- Mobile apps

---

## Support

For issues or questions, please review:
1. [Walkthrough Document](C:\Users\GIGABYTE\.gemini\antigravity\brain\44e3a43a-850b-47d5-87cc-4fc003d48284\walkthrough.md) - Detailed documentation
2. [Implementation Plan](C:\Users\GIGABYTE\.gemini\antigravity\brain\44e3a43a-850b-47d5-87cc-4fc003d48284\implementation_plan.md) - Technical design

---

## License

Proprietary - All rights reserved
