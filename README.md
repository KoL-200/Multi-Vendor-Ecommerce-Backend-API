# Multi-Vendor E-Commerce Backend API

A Node.js + Express backend for a multi-vendor marketplace. The API supports user authentication, vendor onboarding, store management, product catalog management, cart flows, order checkout, review handling, and admin dashboards.

## Overview

This project is built around a modular controller/service/repository structure and uses PostgreSQL via Prisma for data persistence. It exposes a REST API under the `/api/v1` prefix and includes validation with Zod, JWT-based authentication (with refresh token rotation and reuse detection), and role- and ownership-based authorization.

## Tech Stack

- Node.js / Express.js
- PostgreSQL + Prisma ORM
- JWT authentication (access + refresh tokens, bcrypt-hashed refresh token storage)
- Zod validation
- Jest + Supertest for API tests
- Pino / pino-http for structured logging

## Core Features

- User registration and login, with hashed passwords
- JWT access tokens (15m) and rotating refresh tokens (7d) with reuse detection and mass session revocation on replay
- Vendor application and admin approval workflow (`vendorStatus`: NONE -> PENDING -> APPROVED/REJECTED/SUSPENDED)
- Store creation (one per approved vendor) with ownership-or-admin update rules
- Product catalog with search, category/price filtering, sorting, and pagination
- Shopping cart with upsert-on-add behavior, stock ceiling enforcement, and computed (never stored) totals
- Checkout via atomic transaction: re-validates stock/active status, creates order + snapshotted order items, decrements inventory, clears cart
- Order cancellation with inventory restoration, gated by status and ownership
- Product reviews restricted to verified (delivered) purchases, with computed-on-read average rating
- Admin dashboard: user/vendor/product/order totals, revenue, best-sellers, vendor application management

## Project Structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
├── tests/
│   ├── auth.test.js
│   ├── product.test.js
│   ├── cart.test.js
│   ├── store.test.js
│   ├── order.test.js
│   ├── review.test.js
│   ├── category.test.js
│   ├── adminStats.test.js
│   ├── setup.js
│   └── helpers.js
├── .env.example
├── package.json
├── prisma.config.ts
├── server.js
└── README.md
```

## Architecture

- **Routes** — define HTTP endpoints, mounted under `/api/v1`
- **Controllers** — extract request data, call services, shape responses; no business logic
- **Services** — business rules, ownership/permission checks, orchestration across repositories
- **Repositories** — the only layer that talks to Prisma; pure data access, no decision-making
- **Validators** — Zod schemas enforcing request shape before a request reaches a controller
- **Middleware** — `authenticate` (JWT verification), `requireAdmin` (flat role gate), `validate`, centralized error handling, 404 handling

## Environment Configuration

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

Required variables (see `.env.example` for the full list): `DATABASE_URL`, `PORT`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`.

## Database Setup

**Development database:**
```bash
npx prisma migrate dev --name init
```

**Test database** (separate from dev — see `.env.test`):
```bash
npm run test:db:push
```
This uses `cross-env` to set `DATABASE_URL` directly on the command line rather than relying on `.env.test`, because `prisma.config.ts` loads `.env` independently of test tooling.

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev     # development, auto-restart on changes
npm start       # production
```

The app boots from `server.js`, which connects to the database before starting the HTTP server (fails fast if the database is unreachable).

## Authentication and Authorization

JWT-based. Protected routes expect:

```http
Authorization: Bearer <accessToken>
```

- **Roles:** customer, vendor (`vendorStatus: APPROVED` required for store/product actions), admin (`isAdmin: true`)
- **Ownership checks:** stores, products, cart items, orders, and reviews are gated by ownership in addition to role, enforced in the service layer
- **Admin-only routes** are gated by `requireAdmin` middleware (a flat role check, no ownership lookup needed)
- Cart/order/review ownership mismatches return `404`, not `403`, to avoid confirming a resource's existence to a non-owner

## API Overview

All routes are prefixed with `/api/v1`.

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Users
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Vendor
- `POST /api/v1/vendor/apply`

### Categories
- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `POST /api/v1/categories` (admin)
- `PATCH /api/v1/categories/:id` (admin)
- `DELETE /api/v1/categories/:id` (admin)

### Stores
- `POST /api/v1/stores`
- `GET /api/v1/stores`
- `GET /api/v1/stores/:id`
- `PATCH /api/v1/stores/:id` (owner or admin)
- `DELETE /api/v1/stores/:id` (admin)

### Products
- `POST /api/v1/products`
- `GET /api/v1/products` — supports `search`, `category`, `priceMin`, `priceMax`, `sort`, `order`, `page`, `limit`
- `GET /api/v1/products/my-products` (vendor, own products, all statuses)
- `GET /api/v1/products/:id`
- `PATCH /api/v1/products/:id` (owner or admin)
- `DELETE /api/v1/products/:id` (owner or admin)
- `POST /api/v1/products/:id/reviews`
- `GET /api/v1/products/:id/reviews`

### Cart
- `POST /api/v1/cart/items`
- `GET /api/v1/cart`
- `PATCH /api/v1/cart/items/:id`
- `DELETE /api/v1/cart/items/:id`

### Orders
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/cancel`

### Reviews
- `PATCH /api/v1/reviews/:id`
- `DELETE /api/v1/reviews/:id` (owner or admin)

### Admin
- `GET /api/v1/admin/stats/overview`
- `GET /api/v1/admin/stats/revenue`
- `GET /api/v1/admin/stats/best-sellers`
- `GET /api/v1/admin/vendor-applications`
- `PATCH /api/v1/admin/vendor-applications/:userId/approve`
- `PATCH /api/v1/admin/vendor-applications/:userId/reject`
- `PATCH /api/v1/admin/vendor-applications/:userId/suspend`
- `GET /api/v1/admin/carts/:userId` — direct cart access for support/troubleshooting (documented tradeoff: in production this would be gated behind an audit log and/or customer consent)

## Business Rules

**Store:** only approved vendors can create a store; one store per vendor (enforced at DB and service level); updates by owner or admin; deletes admin-only.

**Product:** requires an approved vendor with a store and a valid category; `storeId` always derived server-side, never client-provided; stock/active status re-validated at checkout, not just at cart-add time.

**Cart:** one row per `(cart, product)` pair — adding an already-cart'd product increments quantity rather than erroring; quantity is capped by live stock; inactive products cannot be added.

**Order:** checkout requires a non-empty cart; every item is re-validated for active status and stock immediately before the transaction; shipping address and item prices are snapshotted at checkout (never derived from live, possibly-changed data); cancellation restores stock and is blocked once `SHIPPED` (for customers) or if already `CANCELLED` (for anyone).

**Review:** requires a `DELIVERED` order containing the product; one review per user per product; only the author can edit; author or admin can delete.

## Testing

```bash
npm test                                    # full suite
npx jest tests/product.test.js --runInBand  # single suite
```

Tests run against an isolated test database (`.env.test`), reset before each test. Coverage includes registration/login, refresh token rotation with reuse detection, product search/filter/sort/pagination with discriminating test data, cart upsert and stock-ceiling behavior, transactional checkout with stock decrement and cart clearing, order cancellation with stock restoration, and ownership/role checks across every protected resource.

## Error Handling

Centralized error middleware converts thrown errors (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`) and known Prisma errors (unique constraint violations, missing records) into a consistent `{ "error": "message" }` response shape. Unexpected errors are logged in full server-side and return a generic `500` to the client.

## Logging

Structured JSON logging via `pino`, with human-readable pretty-printing in development. Every request/response is logged via `pino-http`.

## Notes

- Prices are stored as integers in cents throughout, to avoid floating-point rounding errors.
- Admin has direct read access to customer carts — a deliberate, documented tradeoff (see Admin section above).

## License

ISC
