# Multi-Vendor E-Commerce Backend API

A Node.js + Express backend for a multi-vendor marketplace. The API supports user authentication, vendor onboarding, store management, product catalog management, cart flows, order checkout, review handling, and admin dashboards.

## Overview

This project is built around a modular service/repository/controller structure and uses PostgreSQL via Prisma for data persistence. It exposes a REST API under the `/api/v1` prefix and includes validation with Zod, JWT-based authentication, and role-based authorization.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication
- Zod validation
- Jest + Supertest for API tests
- Pino HTTP logging

## Core Features

- User registration and login
- JWT access tokens and refresh token support
- Admin-only dashboard and moderation routes
- Vendor application flow and approval workflow
- Store creation and ownership checks
- Product creation, update, filtering, and availability checks
- Cart creation and item management
- Checkout with stock validation at order time
- Order status lifecycle and stock restoration on cancellation
- Product reviews based on delivered purchases
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
│   ├── validators/
│   └── ...
├── tests/
│   ├── auth.test.js
│   ├── product.test.js
│   ├── cart.test.js
│   ├── store.test.js
│   ├── order.test.js
│   ├── review.test.js
│   ├── category.test.js
│   ├── adminStats.test.js
│   └── helpers.js
├── .env
├── .env.test
├── package.json
├── prisma.config.ts
├── server.js
└── README.md
```

## Architecture

The application follows a layered design:

- Routes: define HTTP endpoints and mount them under `/api/v1`
- Controllers: handle HTTP requests and responses
- Services: contain business logic and authorization rules
- Repositories: interface with Prisma for database access
- Validators: enforce request schema validation using Zod
- Middleware: authentication, admin gating, validation, 404 handling, and error handling

## Environment Configuration

Create a `.env` file in the project root with values like:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/marketplace_db
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

For tests, the project uses `.env.test` and the scripts are configured to load the test environment automatically.

## Database Setup

1. Install PostgreSQL and create a database.
2. Update `DATABASE_URL` in `.env`.
3. Run Prisma migrations or db push:

```bash
npx prisma migrate dev
```

Or, if you are using the project’s setup script:

```bash
npm run test:db:push
```

## Installation

```bash
npm install
```

## Running the App

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The app starts from `server.js`, which boots the Express app and connects the database.

## Authentication and Authorization

Authentication is JWT-based. Protected routes expect a bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Role checks include:

- users
- vendors
- admins
- approved vendor gating for store and product actions

Admin routes are protected by `requireAdmin`, while some flows also require vendor approval and ownership checks.

## API Overview

All routes are prefixed with `/api/v1`.

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Users

- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`

### Categories

- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `POST /api/v1/categories` (admin only)
- `PATCH /api/v1/categories/:id` (admin only)
- `DELETE /api/v1/categories/:id` (admin only)

### Stores

- `POST /api/v1/stores`
- `GET /api/v1/stores`
- `GET /api/v1/stores/:id`
- `PATCH /api/v1/stores/:id`
- `DELETE /api/v1/stores/:id`

### Products

- `POST /api/v1/products`
- `GET /api/v1/products`
- `GET /api/v1/products/my-products`
- `GET /api/v1/products/:id`
- `PATCH /api/v1/products/:id`
- `DELETE /api/v1/products/:id`
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
- `DELETE /api/v1/reviews/:id`

### Admin

- `GET /api/v1/admins/stats/overview`
- `GET /api/v1/admins/stats/revenue`
- `GET /api/v1/admins/stats/best-sellers`
- `GET /api/v1/admins/vendor-applications`
- `PATCH /api/v1/admins/vendor-applications/:userId/approve`
- `PATCH /api/v1/admins/vendor-applications/:userId/reject`
- `PATCH /api/v1/admins/vendor-applications/:userId/suspend`

## Business Rules

### Store Rules

- Only approved vendors can create a store
- A vendor can only own one store
- Store updates are allowed by the owner or admin

### Product Rules

- Only approved vendors with a store can create products
- Products must belong to a valid category
- Product updates require ownership or admin permissions
- Product stock and activity are validated at checkout time

### Cart Rules

- Cart items are unique per product per user
- Quantity updates must respect product stock
- Inactive products cannot be added to the cart
- Cart totals are computed from product prices and quantities

### Order Rules

- Checkout requires a non-empty cart
- Product stock and active status must still be valid at checkout
- Orders snapshot shipping info and item prices
- Cancelled orders restore stock back to products

### Review Rules

- A user can review only products they have purchased and received
- Only one review may exist per user per product
- Review ownership is required for update/delete unless the user is admin

## Testing

The repository includes Jest API tests for key flows.

Run the full suite:

```bash
npm test
```

Run a single suite:

```bash
npx jest tests/product.test.js --runInBand
```

The tests validate the end-to-end contract for auth, product, cart, order, category, store, review, and admin dashboard behavior.

## Error Handling

The application uses centralized error handling through a global error middleware. Common errors include:

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`

These errors are returned in a consistent format with a descriptive `error` message field.

## Logging

The app uses `pino-http` with a configured logger for request/response lifecycle events. This makes it easier to debug API traffic in development and production.

## Notes

- Product prices are stored in cents internally.
- Orders snapshot shipping and pricing details at checkout time.
- Admin access is required for category creation, revenue totals, and usage analytics.
- The API expects JSON payloads for create/update flows.

## License

ISC
