# Drivers & Hospitals API

## Drivers (`/api/v1/drivers`)
> **Auth Required:** All endpoints. **Roles:** DISPATCHER, ADMIN.

### 1. Add Driver
- **Endpoint:** `POST /api/v1/drivers`
- **Description:** Creates a driver profile linked to an existing user account.
- **Request Body:**
  ```json
  {
    "userId": "cmr...",
    "name": "Salam Driver",
    "phone": "+8801700000002",
    "licenseNo": "DL-2024-001"
  }
  ```
- **Errors:** `400` `This user already has a driver profile`

### 2. List Drivers
- **Endpoint:** `GET /api/v1/drivers?availability=AVAILABLE&search=Salam&page=1&limit=10`
- **Description:** Supports **pagination, filtering by availability, search**.

### 3. Update Driver
- **Endpoint:** `PATCH /api/v1/drivers/:id`

### 4. Set Driver Availability
- **Endpoint:** `PATCH /api/v1/drivers/:id/availability`
- **Request Body:** `{ "availability": "BUSY" }`

---

## Hospitals (`/api/v1/hospitals`)
> **Auth Required:** All endpoints. **Roles:** DISPATCHER, ADMIN.

### 1. Add Hospital
- **Endpoint:** `POST /api/v1/hospitals`
- **Request Body:**
  ```json
  {
    "name": "Apollo Hospital Dhaka",
    "address": "Bashundhara, Dhaka",
    "contact": "+880200000002",
    "services": "Cardiac, ICU"
  }
  ```

### 2. List Hospitals
- **Endpoint:** `GET /api/v1/hospitals?search=Apollo&page=1&limit=10`
- **Description:** Supports **pagination and search**.

### 3. Update Hospital
- **Endpoint:** `PATCH /api/v1/hospitals/:id`

### 4. Delete Hospital (Soft Delete)
- **Endpoint:** `DELETE /api/v1/hospitals/:id`
