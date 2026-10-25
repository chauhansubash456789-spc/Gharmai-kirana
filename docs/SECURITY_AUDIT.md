# Gharmai Kirana Platform: Security Audit & Negative Testing

## 1. Executive Summary

This security audit assesses the security controls, authentication mechanisms, data integrity constraints, and role-based access policies of the Gharmai Kirana Grocery Platform.

All critical vulnerabilities identified during initial inspection—specifically concerning inventory race conditions, client-side price tampering, silent quantity clamping, and mobile auth token handling—have been resolved and verified with automated test suites.

---

## 2. Threat Modeling & Vulnerability Findings

### Finding 1: Inventory Race Conditions & Concurrent Checkout (CRITICAL)
- **Vulnerability**: If multiple customers attempt to purchase the remaining inventory of an item simultaneously, naive reads followed by writes can result in negative stock (overselling).
- **Resolution**:
  - Encapsulated order creation and stock decrements inside a single `prisma.$transaction(async (tx) => { ... })`.
  - Added strict stock availability assertions inside the transaction boundary.
  - Wrapped transaction in a structured `try...catch` block to cleanly handle rollback and return HTTP 400 with itemized stock warnings.
- **Verification**: Verified via test case `POST /api/checkout should atomically place order and deduct inventory` and `Should prevent ordering more than available stock`.

### Finding 2: Client-Side Price & Discount Tampering (HIGH)
- **Vulnerability**: Malicious clients could manipulate `price`, `lineTotal`, or `total` in request payloads to purchase groceries below their selling price.
- **Resolution**:
  - The server explicitly recalculates all prices, line totals, coupon discounts, and delivery fees directly from authoritative database records in `getCheckoutPreview()` and `getOrderTotals()`.
  - Client-submitted totals are ignored; only product IDs, quantities, and coupon codes are accepted as inputs.
- **Verification**: Verified via test case `POST /api/checkout/preview and totals should calculate based on database prices`.

### Finding 3: Silent Quantity Clamping during Stock Deficits (HIGH)
- **Vulnerability**: If a customer requested 100 units of a product having only 10 in stock, `getCheckoutPreview` previously clamped the quantity to 10 without failing, allowing the order to proceed with reduced quantities without explicit customer consent.
- **Resolution**:
  - Added strict pre-order validation comparing `reqItem.qty` with `preview.stock`. If requested quantity exceeds current inventory, checkout is rejected with an informative error stating available stock vs requested quantity.
- **Verification**: Verified via test case `Should prevent ordering more than available stock`.

### Finding 4: Role-Based Access Control (RBAC) Enforcement (HIGH)
- **Vulnerability**: Ordinary customers could attempt to access administrative metrics (`/api/admin/*`) or driver delivery routes (`/api/driver/*`).
- **Resolution**:
  - Enforced `requireAdmin` and `requireDriver` middleware on all administrative and courier endpoints.
  - Middleware verifies JWT signature, database user existence, and token version against the user's role.
- **Verification**: Verified via negative test cases `Should forbid non-admin customer from calling admin endpoints` and `Should forbid non-driver customer from calling driver endpoints`. Both return HTTP 403 Forbidden.

### Finding 5: Credential Security & Password Reset (MEDIUM)
- **Vulnerability**: Exposure of plain-text passwords or reusable reset tokens.
- **Resolution**:
  - Passwords hashed using `bcryptjs` with salt rounds.
  - Password reset tokens are generated using cryptographically secure random bytes, hashed via SHA-256 before database storage, and given an expiration window.
  - Upon password reset, `tokenVersion` is incremented, automatically invalidating all previously issued JWT tokens for that user.
- **Rate Limiting**: Rate limiting middleware is active on `/api/auth/forgot-password` (5 requests per 15-minute window).

### Finding 6: Cross-Origin Resource Sharing (CORS) & Token Exposure (MEDIUM)
- **Vulnerability**: Restrictive CORS headers could block legitimate mobile clients or emulators, while overly permissive wildcards could expose sensitive cookies.
- **Resolution**:
  - Server dynamically validates incoming origins against configured origins, Metro bundler ports, local subnet IPs, and allows non-browser clients (which lack Origin headers).
  - Auth token support allows mobile apps to use `Authorization: Bearer` stored in `expo-secure-store`, avoiding cookie transmission quirks on native platforms.

---

## 3. Negative Testing Results Table

| Test Scenario | Attack / Negative Vector | Expected Server Response | Actual Server Response | Security Status |
|---|---|---|---|---|
| Stock Depletion | Order 999 units when 20 in stock | HTTP 400 Bad Request with stock limit warning | 400 Bad Request | **DEFENDED** |
| Price Tampering | Submit custom price in checkout payload | Price ignored; server calculates price from DB | Authoritative DB price applied | **DEFENDED** |
| Admin Bypass | Normal customer calls `GET /api/admin/overview` | HTTP 403 Forbidden | 403 Forbidden (`Admin access only`) | **DEFENDED** |
| Driver Bypass | Normal customer calls `GET /api/driver/orders` | HTTP 403 Forbidden | 403 Forbidden (`Driver access only`) | **DEFENDED** |
| Unauthenticated Access | Call `POST /api/addresses` without credentials | HTTP 401 Unauthorized | 401 Unauthorized (`Please login`) | **DEFENDED** |
| Duplicate Account | Register with existing mobile number | HTTP 409 Conflict | 409 Conflict | **DEFENDED** |
| Brute Force Login | Submit incorrect password | HTTP 401 Unauthorized | 401 Unauthorized | **DEFENDED** |
