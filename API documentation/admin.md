# Admin API (`/api/v1/admin`)

> **Auth Required:** All endpoints. **Role:** ADMIN only (returns `403` for others).

## 1. List Users
- **Endpoint:** `GET /api/v1/admin/users?role=PATIENT&status=ACTIVE&search=Karim&page=1&limit=10`
- **Description:** List all users with **pagination, filtering by role/status, and search**.

---

## 2. Change User Status
- **Endpoint:** `PATCH /api/v1/admin/users/:id/status`
- **Request Body:** `{ "status": "SUSPENDED" }` (or `ACTIVE`)
- **Description:** Suspends/activates a user. Suspended users cannot authenticate. Writes an **audit log**.
- **Errors:** `400` `You cannot change your own status`

---

## 3. Change User Role
- **Endpoint:** `PATCH /api/v1/admin/users/:id/role`
- **Request Body:** `{ "role": "DISPATCHER" }` (or `PATIENT`, `ADMIN`)
- **Description:** Changes a user's role. Writes an **audit log**.

---

## 4. Dashboard Stats
- **Endpoint:** `GET /api/v1/admin/dashboard-stats`
- **Description:** Aggregated platform statistics:
  - users (total/patients/dispatchers/admins)
  - fleet (ambulances/available, drivers/available, hospitals)
  - operations (requests, pending, trips, active, completed)
  - total revenue (sum of completed payments)
  - priority breakdown of all requests

---

## 5. Audit Logs
- **Endpoint:** `GET /api/v1/admin/audit-logs?entity=Trip&action=DISPATCH&page=1&limit=10`
- **Description:** View audit logs of critical actions (dispatch, status changes, user role/status changes) with **pagination and filtering**.

---

## 6. All Trips
- **Endpoint:** `GET /api/v1/admin/trips?status=COMPLETED&page=1&limit=10`
- **Description:** View all trips across the platform with request, ambulance, driver, hospital, and payment.
