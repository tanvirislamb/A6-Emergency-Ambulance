# MedRush 🚑
**"Emergency Ambulance Dispatch System"**

---

## Project Overview

MedRush is a backend API for an **Emergency Ambulance Dispatch System**. Callers/patients can raise emergency requests with their location and a priority level. Dispatchers manage the ambulance fleet, drivers, and hospitals, and assign the most suitable available ambulance based on priority and proximity. Admins oversee the entire platform, manage users, generate analytics, and review audit logs.

---

## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Patient** | Callers who request emergency or scheduled ambulance service | Create dispatch requests, track request & trip status, pay for trips, view own history |
| **Dispatcher** | Staff who manage operations | Manage ambulances, drivers & hospitals, set availability, dispatch ambulances, update trip status |
| **Admin** | Platform overseers | Manage all users, override statuses, view platform analytics, access audit logs |

> 💡 **Note**: Users select their role during registration. Only Dispatchers and Admins manage the fleet.

---

## Tech Stack

🛠️ Same stack as the previous assignment (Node.js + TypeScript + Express + Prisma/PostgreSQL + Zod + Stripe). Security via helmet + CORS + rate limiting.

---

## Features

### Patient Features
- Register/login as patient
- Create an emergency dispatch request (with location + priority)
- Cancel a request/trip before dispatch completes
- Track request and trip status
- **Pay for the trip via Stripe** and view payment history
- View personal dispatch/trip history
- Manage profile

### Dispatcher Features
- Register/login as dispatcher
- Manage ambulance fleet (add/edit/soft-delete)
- Manage drivers and their assignment status
- Manage hospitals
- View incoming dispatch requests and **dispatch an available ambulance** (priority-aware, transaction-safe)
- Update trip lifecycle (en-route → pickup → hospital arrival → completed)
- View operational stats

### Admin Features
- View & manage all users (suspend/activate, change role)
- View all requests, ambulances, trips across the system
- Platform dashboard statistics (totals, active trips, priority breakdown)
- View audit logs of critical actions

---

## API Endpoints

> ⚠️ **Note**: Versioned under `/api/v1`. At least 20 meaningful endpoints.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user (patient/dispatcher) |
| POST | `/api/v1/auth/login` | Login, return JWT+cookie |
| POST | `/api/v1/auth/refresh-token` | Rotate/refresh tokens |
| POST | `/api/v1/auth/social` | GCP social login (Google token) |
| GET | `/api/v1/auth/me` | Get current user |

### Dispatch Requests (Patient)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/requests` | Create emergency dispatch request |
| GET | `/api/v1/requests/my` | Get my requests (pagination) |
| GET | `/api/v1/requests/:id` | Get request detail |
| PATCH | `/api/v1/requests/:id/cancel` | Cancel pending request |
| GET | `/api/v1/requests/search?q=` | Search requests (admin/dispatcher) |

### Ambulances (Dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ambulances` | Add ambulance |
| GET | `/api/v1/ambulances` | List ambulances (filter by availability) |
| GET | `/api/v1/ambulances/:id` | Ambulance detail |
| PATCH | `/api/v1/ambulances/:id` | Update ambulance |
| PATCH | `/api/v1/ambulances/:id/availability` | Set availability |
| DELETE | `/api/v1/ambulances/:id` | Soft-delete ambulance |

### Drivers (Dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/drivers` | Add driver |
| GET | `/api/v1/drivers` | List drivers (filter by availability) |
| PATCH | `/api/v1/drivers/:id` | Update driver |
| PATCH | `/api/v1/drivers/:id/availability` | Set availability |

### Hospitals (Dispatcher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/hospitals` | Add hospital |
| GET | `/api/v1/hospitals` | List hospitals |
| PATCH | `/api/v1/hospitals/:id` | Update hospital |

### Dispatch / Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/trips/:requestId/dispatch` | Assign ambulance + driver (transaction) |
| GET | `/api/v1/trips/:id` | Get trip detail |
| PATCH | `/api/v1/trips/:id/status` | Advance trip status (en-route → ...) |
| GET | `/api/v1/trips/my` | Get my trips (patient/dispatcher) |

### Payments (Stripe)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/initiate` | Create Stripe checkout for a trip |
| POST | `/api/v1/payments/webhook` | Stripe webhook (RAW body) |
| GET | `/api/v1/payments` | My payment history |
| GET | `/api/v1/payments/:id` | Payment detail |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List users |
| PATCH | `/api/v1/admin/users/:id/status` | Suspend/activate user |
| PATCH | `/api/v1/admin/users/:id/role` | Change role |
| GET | `/api/v1/admin/dashboard-stats` | Platform statistics |
| GET | `/api/v1/admin/audit-logs` | Audit logs (pagination) |
| GET | `/api/v1/admin/trips` | All trips |

---

## Database Tables

- **User** - id, email, password, name, role (PATIENT/DISPATCHER/ADMIN), status, deletedAt
- **Ambulance** - id, vehicleNumber, type, capacity, available, station/zone, deletedAt
- **Driver** - id, userId?, name, phone, licenseNo, available, deletedAt
- **Hospital** - id, name, address, contact, services
- **DispatchRequest** - id, patientId, priority (LOW/MEDIUM/HIGH/CRITICAL), patientName, contact, pickupLocation, note, status
- **Trip** - id, requestId, ambulanceId, driverId, hospitalId?, status (DISPATCHED/EN_ROUTE/AT_PICKUP/TRANSPORTING/ARRIVED/COMPLETED/CANCELLED), distanceKm, fare, startedAt, completedAt
- **Payment** - id, customerId, tripId, transactionId, amount, method, status, paidAt
- **AuditLog** - id, actorId, action, entity, entityId, meta
- **Notification** (optional) - id, userId, message, readAt

---

## Flow Diagrams

### 🚨 Emergency Request → Dispatch Flow

```
Emergency Request
      │
      ▼
 Determine Priority
      │
      ▼
 Find Available Ambulance
      │
      ▼
   Dispatch
      │
      ▼
Ambulance En Route
      │
      ▼
 Patient Pickup
      │
      ▼
Hospital Selection
      │
      ▼
Hospital Arrival
      │
      ▼
Trip Completed
```

### 🗺️ Trip Status Machine

```
                     ┌──────────────┐
                     │  DISPATCHED  │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   EN_ROUTE   │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  AT_PICKUP   │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ TRANSPORTING │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   ARRIVED    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  COMPLETED   │
                     └──────────────┘
```

- **CANCELLED** allowed from DISPATCHED/EN_ROUTE.
- Only after **COMPLETED** can payment be initiated.

---

## Backend Challenges Solved
- **Transaction-safe dispatching**: assigning an ambulance/driver uses a Prisma `$transaction` to atomically update availability and prevent double-booking.
- **Priority-aware availability**: dispatcher selects the best available ambulance; duplicate-assignment prevention with conditional updates.
- **State machine enforcement**: strict trip status transitions; cancelled/completed terminal states.
- **Stripe webhook**: RAW body parsing + signature verification, idempotent status updates via unique transactionId.
- **Soft deletes + audit logs** for critical actions.

---

## Submission

📋 See [README.md](./README.md) for submission guidelines, timeline, and marks.
