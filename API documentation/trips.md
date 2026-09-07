# Trips & Dispatch API (`/api/v1/trips`)

> **Auth Required:** All endpoints.

## 1. Dispatch an Ambulance (Dispatcher/Admin)
- **Endpoint:** `POST /api/v1/trips/:requestId/dispatch`
- **Roles:** DISPATCHER, ADMIN
- **Description:** Atomically assigns an available ambulance + driver, marks them `BUSY`, updates request to `DISPATCHED`, and writes an **audit log**. Uses a **Prisma transaction** to prevent double-booking.
- **Request Body:**
  ```json
  {
    "ambulanceId": "cmr...",
    "driverId": "cmr...",
    "distanceKm": 5.2,
    "fare": 120.5
  }
  ```
  *(Leave `ambulanceId`/`driverId` empty to auto-pick the first available ambulance + driver.)*
- **Success (201):** Returns the created trip.
- **Errors:**
  - `400` `Only pending requests can be dispatched`
  - `400` `Selected ambulance is not available`
  - `400` `No available ambulance or driver right now`

---

## 2. Get Trip by ID
- **Endpoint:** `GET /api/v1/trips/:id`
- **Roles:** PATIENT (own), DISPATCHER, ADMIN
- **Description:** Returns trip with request, ambulance, driver, hospital, and payment.
- **Errors:** `404` `Trip not found`, `400` `You cannot access this trip`

---

## 3. Update Trip Status
- **Endpoint:** `PATCH /api/v1/trips/:id/status`
- **Roles:** DISPATCHER, ADMIN
- **Description:** Advances the trip through its **state machine**. Enforces valid transitions.
- **Request Body:** `{ "status": "EN_ROUTE" }`
- **Valid Transitions:**
  ```
  DISPATCHED → EN_ROUTE
  EN_ROUTE   → AT_PICKUP | CANCELLED
  AT_PICKUP  → TRANSPORTING
  TRANSPORTING → ARRIVED
  ARRIVED    → COMPLETED
  COMPLETED/CANCELLED → (terminal)
  ```
- **Errors:** `400` `Cannot transition from EN_ROUTE to COMPLETED`
- **Note:** On `COMPLETED` or `CANCELLED`, the ambulance and driver are freed back to `AVAILABLE`.

---

## 4. Assign Hospital
- **Endpoint:** `PATCH /api/v1/trips/:id/hospital`
- **Roles:** DISPATCHER, ADMIN
- **Request Body:** `{ "hospitalId": "cmr..." }`
- **Description:** Assign a destination hospital during transport.
- **Errors:** `400` `Hospital can only be assigned during transport`

---

## 5. Get My Trips
- **Endpoint:** `GET /api/v1/trips/my?status=COMPLETED&page=1&limit=10`
- **Roles:** PATIENT, DISPATCHER, ADMIN
- **Description:** Patients see their own trips; dispatcher/admin see all. Supports **pagination and filtering**.
