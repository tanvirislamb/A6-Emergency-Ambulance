# MedRush - Emergency Ambulance Dispatch System (Backend API)

A robust, production-style RESTful API for dispatching emergency ambulances. Patients can request an ambulance, dispatchers manage the fleet (ambulances, drivers, hospitals) and dispatch trips, and admins supervise the whole operation through dashboards and audit logs. Payments are handled through Stripe.

Built as the **B7A6** backend assignment (Search & discovery). No frontend is required; everything is demoed via Postman / Thunder Client.

---

## What The Project Does

- **Patient** creates an emergency dispatch request (with priority, pickup location, contact info).
- **Dispatcher** manages the fleet (ambulances, drivers, hospitals), searches incoming requests, and dispatches a trip — assigning an available ambulance + driver automatically or manually.
- **Trip lifecycle** is state-machine driven: DISPATCHED → EN_ROUTE → AT_PICKUP → TRANSPORTING → ARRIVED → COMPLETED (or CANCELLED). Ambulance/driver availability is toggled automatically via transactions.
- **Patient** tracks their own trips, and pays for a completed trip through **Stripe Checkout** (webhook verifies and marks the payment COMPLETED/FAILED).
- **Admin** manages users (suspend/activate, change roles), views dashboard statistics, audits every important action, and inspects all trips.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript (ESM) |
| Web framework | Express 5 |
| ORM & Database | Prisma 7 + PostgreSQL (Neon) |
| Validation | Zod |
| Auth | JWT (access + refresh tokens) + bcrypt, httpOnly cookies |
| Payments | Stripe (Checkout + webhooks) |
| Security | Helmet, rate limiting, CORS |
| Bundler | tsup |
| Linter/Formatter | Biome |

---

## Architecture

Layered pattern: **Routes → Middleware → Controllers → Services → Prisma/PostgreSQL**

- `src/Models/<Module>/` - route, controller, service, and interface per domain
- `src/Middleware/` - JWT auth (`authMiddleWare`) and role guards (`restrictTo`, `adminMiddleWare`, `dispatcherMiddleWare`, `patientMiddleWare`)
- `src/Utils/` - Zod `validate` helper + unified `response` / `errorResponse` helpers
- `prisma/schema/` - multi-file Prisma schema (models + enums)
- `src/generated/prisma/` - generated Prisma client

### Response format

```json
// success
{ "success": true, "message": "Operation successful", "data": {} }

// error
{ "success": false, "message": "Something went wrong", "errors": [] }
```

---

## Roles & Authorization

| Role | What they can do |
|------|------------------|
| `ADMIN` | Everything. User management, dashboard stats, audit logs, all trips. Bypasses patient/dispatcher guards. |
| `DISPATCHER` | Fleet management (ambulances, drivers, hospitals), search requests, dispatch trips, update trip status, assign hospitals. |
| `PATIENT` | Register/login, create and cancel their own requests, list/track their own trips, pay for completed trips. |

Role middleware chain (exact behavior):

- `authMiddleWare()` - must be authenticated (cookie or `Bearer` token).
- `adminMiddleWare()` → `ADMIN`
- `dispatcherMiddleWare()` → `DISPATCHER`, `ADMIN`
- `patientMiddleWare()` → `PATIENT`, `DISPATCHER`, `ADMIN`

---

## Database Models

| Model | Table | Purpose |
|-------|-------|---------|
| User | `users` | Auth accounts with `Role` (PATIENT/DISPATCHER/ADMIN) and `UserStatus` |
| Driver | `drivers` | Driver profile linked to a User (`userId`) + availability |
| Ambulance | `ambulances` | Fleet vehicles (type, capacity, station zone, availability) |
| Hospital | `hospitals` | Referral hospitals for trips |
| DispatchRequest | `dispatch_requests` | Patient emergency requests with `Priority` (LOW..CRITICAL) and `RequestStatus` |
| Trip | `trips` | A dispatched ride linking request + ambulance + driver + hospital + payment |
| payment | `payments` | Stripe transactions with `PaymentStatus` |
| AuditLog | `audit_logs` | Immutable action trail (who did what, when) |

---

## API Reference

Base URL: `http://localhost:3000/api/v1` (or your deployed URL)

Auth is passed as `httpOnly` cookies (`accessToken`, `refreshToken`) or `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register as PATIENT or DISPATCHER (ADMIN not allowed). Returns tokens + user. |
| POST | `/auth/login` | Public | Login with email/password. Sets access + refresh cookies. |
| POST | `/auth/refresh-token` | Public (refresh cookie) | Exchange refresh token for a fresh token pair. |
| GET | `/auth/me` | Authenticated | Get the currently logged-in user profile. |

### Dispatch Requests

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/requests` | Patient+ | Create a dispatch request (priority, patientName, contact, pickupLocation, note). |
| GET | `/requests/my` | Patient+ | List my requests, filterable by `status`/`priority`, paginated (`page`, `limit`). |
| GET | `/requests/search` | Dispatcher+ | Search all requests by `q`, `status` (paginated). |
| GET | `/requests/:id` | Patient+ | View a request with patient + trip details (patients only see their own). |
| PATCH | `/requests/:id/cancel` | Patient+ | Cancel a request, but only while it is still `PENDING`. |

### Ambulances (Dispatcher+)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/ambulances` | Dispatcher+ | Register a new ambulance (vehicleNumber, type, capacity, stationZone). |
| GET | `/ambulances` | Dispatcher+ | List ambulances, filter by `availability`/`stationZone`, sort via `sortBy`/`sortOrder`, paginated. |
| GET | `/ambulances/:id` | Dispatcher+ | Get an ambulance with its trip history. |
| PATCH | `/ambulances/:id` | Dispatcher+ | Update type, capacity, or station zone. |
| PATCH | `/ambulances/:id/availability` | Dispatcher+ | Set AVAILABLE / BUSY / OFFLINE. |
| DELETE | `/ambulances/:id` | Dispatcher+ | Soft delete (sets `deletedAt`, availability → OFFLINE). |

### Drivers (Dispatcher+)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/drivers` | Dispatcher+ | Attach a driver profile to an existing user (`userId`, name, phone, licenseNo). |
| GET | `/drivers` | Dispatcher+ | List drivers, filter by `availability`, search by `q`, paginated. |
| PATCH | `/drivers/:id` | Dispatcher+ | Update driver name, phone, or license number. |
| PATCH | `/drivers/:id/availability` | Dispatcher+ | Set AVAILABLE / BUSY / OFFLINE. |

### Hospitals (Dispatcher+)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/hospitals` | Dispatcher+ | Add a hospital (name, address, contact, services). |
| GET | `/hospitals` | Dispatcher+ | List hospitals, search by `q`, paginated, with trip count. |
| PATCH | `/hospitals/:id` | Dispatcher+ | Update hospital details. |
| DELETE | `/hospitals/:id` | Dispatcher+ | Soft delete. |

### Trips

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/trips/:requestId/dispatch` | Dispatcher+ | Dispatch a trip for a `PENDING` request. Auto-assigns an available ambulance + driver, or use explicit `ambulanceId`/`driverId`. Uses a transaction; sets both BUSY, request → DISPATCHED, writes an audit log. |
| GET | `/trips/my` | Patient+ | List trips (patients see only their own), filter by `status`, paginated. |
| GET | `/trips/:id` | Patient+ | Full trip detail (request, ambulance, driver, hospital, payment). |
| PATCH | `/trips/:id/status` | Dispatcher+ | Advance trip only along valid transitions (EN_ROUTE, AT_PICKUP, TRANSPORTING, ARRIVED, COMPLETED, CANCELLED). Freeing ambulance/driver on completion/cancel. |
| PATCH | `/trips/:id/hospital` | Dispatcher+ | Assign a hospital to a trip while it is EN_ROUTE/AT_PICKUP/TRANSPORTING. |

### Payments (Stripe)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/payments` | Patient+ | List my payments with trip details. |
| GET | `/payments/:id` | Patient+ | Payment details (patients see only their own; ADMIN sees all). |
| POST | `/payments/initiate` | Patient+ | Create a Stripe Checkout session for a COMPLETED trip you own. Returns `sessionUrl` + `sessionId`. (bKash is accepted in the schema but currently returns `"Only Stripe payment is supported currently"`.) |
| POST | `/payments/webhook` | Stripe (signed) | Raw-body Stripe webhook; verifies signature. Sets payment COMPLETED on `checkout.session.completed`, FAILED on `session.expired`. Mounted at `/api/v1/payments/webhook`. |

### Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/users` | Admin | List all users, filter by `role`/`status`, search by `q`, paginated. |
| PATCH | `/admin/users/:id/status` | Admin | Suspend or activate a user (not yourself). |
| PATCH | `/admin/users/:id/role` | Admin | Change a user's role (PATIENT/DISPATCHER/ADMIN). |
| GET | `/admin/dashboard-stats` | Admin | Aggregated stats: users, fleet availability, requests, trips, revenue, priority breakdown. |
| GET | `/admin/audit-logs` | Admin | Audit trail, filter by `entity`/`action`, paginated. |
| GET | `/admin/trips` | Admin | All trips, filter by `status`, paginated. |

---

## Stripe Payment Flow

1. A trip must reach `COMPLETED` (trip fare is used; defaults to 100 if unset).
2. `POST /payments/initiate` with `{ tripId }` creates a Stripe Checkout session and a `PENDING` payment record.
3. The patient is redirected to `sessionUrl`.
4. Stripe calls `POST /payments/webhook` (raw JSON body, signature from `stripe-signature` header).
5. The webhook verifies the signature, then marks the payment `COMPLETED` (with the payment intent) or `FAILED`.

---

## Getting Started

### 1. Environment variables (`.env`)

```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
ACCESS_SECRET=<long-random-string>
REFRESH_SECRET=<long-random-string>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

### 2. Install & set up the database

```bash
npm install          # runs `prisma generate` automatically
npx prisma migrate dev   # recommended - create + apply migrations
# or
npx prisma db push       # quick schema sync (no migration files)
```

### 3. Seed demo data

```bash
npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@medrush.com` | `Admin123` |
| Dispatcher | `dispatcher@medrush.com` | `Dispatch123` |
| Patient | `patient@medrush.com` | `Patient123` |
| Driver (user) | `driver@medrush.com` | `Dispatch123` |

### 4. Run

```bash
npm run dev    # local dev server (tsx watch)
npm run build  # production bundle (tsup)
npm run start  # run production build
npm run lint   # biome check
npm run seed   # re-seed
```

---

## Security & Notes

- Requests are rate-limited (300 per 15 min) and protected by Helmet.
- Passwords are hashed with bcrypt; user passwords are omitted from all responses.
- `deletedAt` soft deletes are used for ambulances, drivers, hospitals.
- Trip status changes, dispatches, hospital assignments, and admin user changes are written to `audit_logs`.
- Role middleware enforces `403 Forbidden` when a role tries to access another role's endpoints.