# 📡 MedRush API - Endpoint Index

> **Base URL:** `/api/v1`
> **Response Format:**
> - Success: `{ "success": true, "message": "...", "data": {} }`
> - Error: `{ "success": false, "message": "...", "errors": [] }`

Total meaningful endpoints: **40**

## Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register patient/dispatcher | Public |
| POST | `/auth/login` | Login, set JWT cookies | Public |
| POST | `/auth/refresh-token` | Rotate refresh token | Public |
| POST | `/auth/social` | Google/GCP social login | Public |
| POST | `/auth/logout` | Clear cookies | Public |
| GET | `/auth/me` | Current user | ✓ |

## Dispatch Requests (`/api/v1/requests`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/requests` | Create emergency request | ✓ |
| GET | `/requests/my` | My requests (paginated/filtered) | ✓ |
| GET | `/requests/:id` | Request detail | ✓ |
| PATCH | `/requests/:id/cancel` | Cancel pending request | ✓ |
| GET | `/requests/search` | Search requests (dispatcher) | ✓ |

## Ambulances (`/api/v1/ambulances`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ambulances` | Add ambulance | ✓ Dispatcher |
| GET | `/ambulances` | List (paginated/filtered/sorted) | ✓ Dispatcher |
| GET | `/ambulances/:id` | Detail + history | ✓ Dispatcher |
| PATCH | `/ambulances/:id` | Update ambulance | ✓ Dispatcher |
| PATCH | `/ambulances/:id/availability` | Set availability | ✓ Dispatcher |
| DELETE | `/ambulances/:id` | Soft delete | ✓ Dispatcher |

## Drivers (`/api/v1/drivers`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/drivers` | Add driver | ✓ Dispatcher |
| GET | `/drivers` | List (paginated/filtered/search) | ✓ Dispatcher |
| PATCH | `/drivers/:id` | Update driver | ✓ Dispatcher |
| PATCH | `/drivers/:id/availability` | Set availability | ✓ Dispatcher |

## Hospitals (`/api/v1/hospitals`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/hospitals` | Add hospital | ✓ Dispatcher |
| GET | `/hospitals` | List (paginated/search) | ✓ Dispatcher |
| PATCH | `/hospitals/:id` | Update hospital | ✓ Dispatcher |
| DELETE | `/hospitals/:id` | Soft delete | ✓ Dispatcher |

## Trips (`/api/v1/trips`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/trips/:requestId/dispatch` | Dispatch ambulance (transaction) | ✓ Dispatcher |
| GET | `/trips/:id` | Trip detail | ✓ |
| PATCH | `/trips/:id/status` | Advance status (state machine) | ✓ Dispatcher |
| PATCH | `/trips/:id/hospital` | Assign destination hospital | ✓ Dispatcher |
| GET | `/trips/my` | My trips (paginated/filtered) | ✓ |

## Payments (`/api/v1/payments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/initiate` | Create Stripe session | ✓ |
| POST | `/payments/webhook` | Stripe webhook (raw) | Public (signed) |
| GET | `/payments` | My payment history | ✓ |
| GET | `/payments/:id` | Payment detail | ✓ |

## Admin (`/api/v1/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users` | List users | ✓ Admin |
| PATCH | `/admin/users/:id/status` | Suspend/activate | ✓ Admin |
| PATCH | `/admin/users/:id/role` | Change role | ✓ Admin |
| GET | `/admin/dashboard-stats` | Platform stats | ✓ Admin |
| GET | `/admin/audit-logs` | Audit logs | ✓ Admin |
| GET | `/admin/trips` | All trips | ✓ Admin |

## Security & Performance
- **helmet** security headers
- **CORS** configured
- **express-rate-limit** rate limiting
- **Zod** validation on all applicable endpoints
- **Prisma transactions** for dispatch & status changes (prevents double-booking/race conditions)
- **Database indexing** on foreign keys, status, priority, created timestamps
- **Soft deletes** (`deletedAt`) on users, ambulances, drivers, hospitals
- **Audit logs** for critical operations
- Structured success/error responses throughout
