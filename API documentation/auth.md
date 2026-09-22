# Auth API (`/api/v1/auth`)

> Auth uses **httpOnly cookies** (`accessToken`, `refreshToken`) OR `Authorization: Bearer <token>`. All protected routes require a valid token.

## 1. Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Description:** Register a new user as PATIENT or DISPATCHER. Admin registration blocked.
- **Request Body:**
  ```json
  {
    "email": "karim@medrush.com",
    "password": "Patient123",
    "name": "Karim Patient",
    "phone": "+8801700000000",
    "role": "PATIENT"
  }
  ```
- **Success (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "cmr...",
      "email": "karim@medrush.com",
      "name": "Karim Patient",
      "phone": "+8801700000000",
      "role": "PATIENT",
      "status": "ACTIVE"
    }
  }
  ```
- **Errors:**
  - `400` `User already exists`
  - `400` `You cannot register as an admin`
  - `400` `Role must be PATIENT or DISPATCHER`

---

## 2. Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  { "email": "admin@medrush.com", "password": "Admin123" }
  ```
- **Success (200):** Returns user (password omitted) and sets auth cookies.
- **Errors:** `400` `User not found`, `400` `Account not found`, `400` `Wrong password`, `400` `Account is suspended`

---

## 3. Refresh Token
- **Endpoint:** `POST /api/v1/auth/refresh-token`
- **Description:** Rotate tokens using the refresh cookie.
- **Success (200):** Returns new tokens + user.
- **Errors:** `401` `No refresh token provided`, `401` `Invalid refresh token`

---

## 4. Get Me
- **Endpoint:** `GET /api/v1/auth/me` (protected)
- **Description:** Returns the currently authenticated user.
- **Errors:** `401` `No token provided`, `401` `Unauthorized access` (suspended/deleted)
