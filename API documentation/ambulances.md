# Ambulances API (`/api/v1/ambulances`)

> **Auth Required:** All endpoints. **Roles:** DISPATCHER, ADMIN.

## 1. Add Ambulance
- **Endpoint:** `POST /api/v1/ambulances`
- **Request Body:**
  ```json
  {
    "vehicleNumber": "DHAKA-METRO-1003",
    "type": "Basic Life Support",
    "capacity": 4,
    "stationZone": "Mirpur"
  }
  ```
- **Success (201):** Returns created ambulance.
- **Errors:** `400` `Ambulance with this vehicle number already exists`

---

## 2. List Ambulances
- **Endpoint:** `GET /api/v1/ambulances?availability=AVAILABLE&stationZone=Gulshan&sortBy=capacity&sortOrder=desc&page=1&limit=10`
- **Description:** Supports **pagination, filtering by availability/station, sorting by field**.
- **Success (200):** Returns paginated list with trip counts.

---

## 3. Get Ambulance by ID
- **Endpoint:** `GET /api/v1/ambulances/:id`
- **Description:** Returns ambulance with its trip history.
- **Errors:** `404` `Ambulance not found`

---

## 4. Update Ambulance
- **Endpoint:** `PATCH /api/v1/ambulances/:id`
- **Request Body:**
  ```json
  { "type": "Advanced Life Support", "capacity": 6, "stationZone": "Mirpur" }
  ```

---

## 5. Set Availability
- **Endpoint:** `PATCH /api/v1/ambulances/:id/availability`
- **Request Body:** `{ "availability": "AVAILABLE" }`
- **Description:** Set to `AVAILABLE`, `BUSY`, or `OFFLINE`.

---

## 6. Delete Ambulance (Soft Delete)
- **Endpoint:** `DELETE /api/v1/ambulances/:id`
- **Description:** Soft-deletes via `deletedAt` timestamp and sets availability to `OFFLINE`.
