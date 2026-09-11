# Multi-Vendor E-Commerce Backend API
 
A Node.js + Express backend for a multi-vendor marketplace. The API supports user authentication, vendor onboarding, store management, product catalog management, cart flows, order checkout, review handling, and admin dashboards.
 
## Overview
 
This project is built around a modular controller/service/repository structure and uses PostgreSQL via Prisma for data persistence. It exposes a REST API under the `/api/v1` prefix and includes validation with Zod, JWT-based authentication (with refresh token rotation and reuse detection), and role- and ownership-based authorization.
 
## Tech Stack
 
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication (`jsonwebtoken`, `bcrypt`)
- Zod validation
- Jest + Supertest for API tests
- Pino / Pino-HTTP logging
## Core Features
 
- User registration and login
- JWT access tokens (short-lived) and refresh tokens with rotation and reuse detection
- Admin-only dashboard, moderation, and vendor-approval routes
- Vendor application flow requiring admin approval before selling
- Store creation and ownership checks (one store per vendor)
- Product creation, update, filtering, search, sorting, and pagination
- Cart item management with stock validation and quantity upsert
- Checkout with re-validated stock/active status and atomic order creation
- Order cancellation with automatic stock restoration
- Product reviews gated to verified (delivered) purchases
- Category management and product organization
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
 
The application follows a layered design:
 
- **Routes** — define HTTP endpoints and mount them under `/api/v1`
- **Controllers** — extract data from the request and call the matching service; contain no business logic
- **Services** — business rules, ownership/authorization checks, and orchestration of repository calls (including database transactions)
- **Repositories** — the only layer that talks to Prisma; pure data access, no decision-making
- **Validators** — Zod schemas enforcing request shape before a request reaches a controller
- **Middleware** — `authenticate` (JWT verification), `requireAdmin` (flat role gate), `validate` (schema enforcement), plus centralized 404 and error handling
## Environment Configuration
 
Copy the example file and fill in real values:
 
```bash
cp .env.example .env
```
 
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/marketplace_db?schema=public"
JWT_ACCESS_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-a-different-long-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```
 
A separate `.env.test` (same shape, pointing at a separate test database) is used automatically when running the test suite.
 
## Database Setup
 
**Development database:**
 
```bash
npx prisma migrate dev --name init
```
 
**Test database** (kept separate from dev — see [Testing](#testing)):
 
```bash
npm run test:db:push
```
 
This runs `prisma db push` against `.env.test`'s `DATABASE_URL` directly via `cross-env`, rather than through `prisma migrate`, since the test database doesn't need its own migration history.
 
## Installation
 
```bash
npm install
```
 
## Running the App
 
Development mode (auto-restarts on file changes):
 
```bash
npm run dev
```
 
Production mode:
 
```bash
npm start
```
 
The app boots from `server.js`, which validates environment variables, connects to PostgreSQL, and only then starts listening for requests.
 
## Authentication and Authorization
 
Authentication is JWT-based. Protected routes expect a bearer token in the `Authorization` header:
 
```http
Authorization: Bearer <token>
```
 
- **Access tokens** are short-lived and carry `userId`, `roles`, and `isAdmin` — verified on every request with no database lookup.
- **Refresh tokens** are longer-lived, stored server-side as bcrypt hashes (never in plaintext), and rotated on every use. Reusing an already-rotated refresh token revokes every active session for that user, as a compromise-detection measure.
- **Role checks** distinguish customers, vendors, and admins. Vendor-only actions additionally require `vendorStatus: APPROVED`, granted by an admin via the vendor-application flow. Admin-only routes are gated by `requireAdmin` middleware. Ownership checks (e.g., a vendor editing only their own store or product) are enforced in the service layer.
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
- `POST /api/v1/vendor/apply` — submits a vendor application (sets `vendorStatus` to pending admin review)
### Categories
- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `POST /api/v1/categories` (admin only)
- `PATCH /api/v1/categories/:id` (admin only)
- `DELETE /api/v1/categories/:id` (admin only)
### Stores
- `POST /api/v1/stores` (approved vendors only; one store per vendor)
- `GET /api/v1/stores`
- `GET /api/v1/stores/:id`
- `PATCH /api/v1/stores/:id` (owner or admin)
- `DELETE /api/v1/stores/:id` (admin only)
### Products
- `POST /api/v1/products` (approved vendor with a store)
- `GET /api/v1/products` — supports `search`, `category`, `priceMin`, `priceMax`, `sort`, `order`, `page`, `limit`
- `GET /api/v1/products/my-products` (vendor's own listings, all statuses)
- `GET /api/v1/products/:id`
- `PATCH /api/v1/products/:id` (owner or admin)
- `DELETE /api/v1/products/:id` (owner or admin)
- `POST /api/v1/products/:id/reviews` (verified purchase required)
- `GET /api/v1/products/:id/reviews`
### Cart
- `POST /api/v1/cart/items` (adds or increments quantity if already present)
- `GET /api/v1/cart` (includes a computed total)
- `PATCH /api/v1/cart/items/:id` (sets an absolute quantity)
- `DELETE /api/v1/cart/items/:id`
### Orders
- `POST /api/v1/orders` (checkout — converts cart to order atomically)
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/cancel` (customers pre-shipment only; admins any time; restores stock)
### Reviews
- `PATCH /api/v1/reviews/:id` (owner only — no admin override)
- `DELETE /api/v1/reviews/:id` (owner or admin)
### Admin
- `GET /api/v1/admin/stats/overview`
- `GET /api/v1/admin/stats/revenue`
- `GET /api/v1/admin/stats/best-sellers`
- `GET /api/v1/admin/vendor-applications`
- `PATCH /api/v1/admin/vendor-applications/:userId/approve`
- `PATCH /api/v1/admin/vendor-applications/:userId/reject`
- `PATCH /api/v1/admin/vendor-applications/:userId/suspend`
- `GET /api/v1/admin/carts/:userId` — direct cart access for support/troubleshooting. In production this would be gated behind an audit log and/or explicit customer consent; kept here as a documented, deliberate tradeoff rather than an oversight.
## Business Rules
 
### Store Rules
- Only approved vendors can create a store
- A vendor can only own one store
- Store updates are allowed by the owner or admin; deletion is admin-only
### Product Rules
- Only approved vendors with a store can create products
- Products must belong to a valid category
- `storeId` is always derived from the authenticated vendor, never accepted from the request body
- Product updates/deletes require ownership or admin permission
### Cart Rules
- A product can only appear once per cart; adding it again increases the existing quantity rather than creating a duplicate row
- Quantity is capped by available stock at add/update time
- Inactive products cannot be added to a cart
- Totals are always computed live from current product prices, never stored
### Order Rules
- Checkout requires a non-empty cart
- Every cart item's stock and active status is re-validated at checkout, independent of what was true when it was added to the cart
- Orders snapshot shipping details and each item's price at the time of purchase, so later price or address changes never alter historical orders
- Order creation, inventory decrement, and cart clearing happen inside a single database transaction — either all succeed or none do
- Cancelling an order restores stock; an order cannot be cancelled twice
### Review Rules
- A user can review a product only if they have a delivered order containing it
- One review per user per product
- Only the review's author can edit it — admins can delete a review but never edit its content
## Testing
 
The suite uses a database-isolated test environment (`.env.test`), reset before every test via `tests/setup.js`.
 
Run the full suite:
 
```bash
npm test
```
 
Run a single suite:
 
```bash
npx jest tests/product.test.js --runInBand
```
 
Coverage includes: registration/login validation, refresh token rotation and reuse detection, protected-route access, product creation/filtering/sorting/pagination, cart upsert and stock enforcement, the full checkout transaction (including stale-cart re-validation and stock restoration on cancellation), and ownership/role checks across every resource.
 
## Error Handling
 
Centralized error-handling middleware converts thrown errors into consistent JSON responses (`{ "error": "<message>" }`), using typed error classes:
 
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
Known Prisma errors (e.g. unique constraint violations) are translated into the same response shape. Unexpected errors are logged in full server-side and returned to the client as a generic `500`, with no internal detail leaked.
 
## Logging
 
Structured JSON logging via `pino`, with human-readable formatting in development via `pino-pretty`. `pino-http` logs the full request/response lifecycle for every call.
 
## Notes
 
- Product prices are stored in integer cents to avoid floating-point rounding issues.
- Postal codes and phone numbers are stored as strings, never numbers, to preserve leading zeros and non-numeric formatting.
- The API expects JSON payloads for all create/update requests.
  
## License
 
ISC
