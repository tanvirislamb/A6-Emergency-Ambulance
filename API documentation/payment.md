# Payment API (`/api/v1/payments`)

> **Method:** Stripe (real checkout). Payment only possible after a trip is `COMPLETED`. Simulated payments are not used.

## 1. Initiate Payment
- **Endpoint:** `POST /api/v1/payments/initiate`
- **Roles:** PATIENT, DISPATCHER, ADMIN
- **Request Body:**
  ```json
  { "tripId": "cmr...", "method": "STRIPE" }
  ```
- **Description:** Validates that the trip belongs to the caller (the trip's owner, i.e. the patient) and is `COMPLETED`, then creates a Stripe Checkout Session. Only `STRIPE` is supported — `BKASH` is rejected. If the trip has no `fare`, it defaults to `100`.
- **Success (200):**
  ```json
  {
    "success": true,
    "message": "Payment initiated successfully",
    "data": {
      "payment": { "id": "cmr...", "tripId": "cmr...", "amount": 100, "status": "PENDING" },
      "sessionId": "cs_test_...",
      "sessionUrl": "https://checkout.stripe.com/c/pay/..."
    }
  }
  ```
- **Errors:**
  - `400` `Trip not found`
  - `400` `You are not authorized to pay for this trip`
  - `400` `Trip must be completed before payment`
  - `400` `Only Stripe payment is supported currently`
  - `400` `Payment already completed for this trip`

---

## 2. Stripe Webhook
- **Endpoint:** `POST /api/v1/payments/webhook`
- **Description:** Accepts the raw Stripe event (signature verified via `stripe-signature` header), then updates the payment:
  - `checkout.session.completed` → payment `COMPLETED` + `paidAt`
  - `checkout.session.expired` → payment `FAILED`
- **Note:** This route is registered **before** `express.json()` using `express.raw()` so the signature can be verified on the exact bytes.

---

## 3. Get My Payments
- **Endpoint:** `GET /api/v1/payments`
- **Roles:** PATIENT, DISPATCHER, ADMIN
- **Description:** Returns the logged-in user's payment history with trip details.

---

## 4. Get Payment by ID
- **Endpoint:** `GET /api/v1/payments/:id`
- **Description:** Returns a single payment. Patients can only view their own; admin any.
- **Errors:** `404` `Payment not found`, `404` `You are not authorized to view this payment`
