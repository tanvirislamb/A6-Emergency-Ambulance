# Dispatch Requests API (`/api/v1/requests`)

> **Auth Required:** All endpoints require a valid token.

## 1. Create Emergency Request
- **Endpoint:** `POST /api/v1/requests`
- **Roles:** PATIENT, DISPATCHER, ADMIN
- **Request Body:**
  ```json
  {
    "priority": "CRITICAL",
    "patientName": "Karim Patient",
    "contact": "+8801700000000",
    "pickupLocation": "Gulshan 2, Dhaka",
    "note": "Chest pain, needs immediate attention"
  }
  ```
- **Success (201):** Returns the created request with patient info.

---

## 2. Get My Requests
- **Endpoint:** `GET /api/v1/requests/my?page=1&limit=10&status=PENDING&priority=CRITICAL`
- **Roles:** PATIENT, DISPATCHER, ADMIN
- **Description:** List the logged-in user's requests. Supports **pagination** and **filtering** by `status` and `priority`. Note: dispatchers/admins see only requests they created here — use `/search` for all requests.
- **Success (200):**
  ```json
  {
    "success": true,
    "message": "Requests retrieved successfully",
    "data": {
      "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 },
      "data": [ { "id": "cmr...", "priority": "CRITICAL", "status": "PENDING", "...": "" } ]
    }
  }
  ```

---

## 3. Get Request by ID
- **Endpoint:** `GET /api/v1/requests/:id`
- **Description:** View a request. Patients can only view their own; dispatcher/admin any.
- **Errors:** `404` `Request not found`, `404` `You cannot access this request`

---

## 4. Cancel Request
- **Endpoint:** `PATCH /api/v1/requests/:id/cancel`
- **Roles:** PATIENT, DISPATCHER, ADMIN
- **Description:** Cancel only a `PENDING` request. Only the owner of the request can cancel it.
- **Errors:** `400` `Request not found`, `400` `You cannot cancel this request`, `400` `Only pending requests can be cancelled`

---

## 5. Search Requests (Dispatcher/Admin)
- **Endpoint:** `GET /api/v1/requests/search?q=Karim&status=PENDING`
- **Roles:** DISPATCHER, ADMIN
- **Description:** Search by patient name, contact, or pickup location.
