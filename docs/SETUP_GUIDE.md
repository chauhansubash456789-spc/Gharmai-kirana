# Gharmai Kirana Platform: Setup & Reproducible Run Guide

This guide provides step-by-step instructions for running the complete Gharmai Kirana grocery platform (Backend, Web SPA, and React Native Expo mobile application) on a development machine.

---

## 1. Prerequisites

- **Node.js**: v20.x, v22.x, or v24.x
- **Package Manager**: `npm` (v10+)
- **OS**: Windows, macOS, or Linux
- **Mobile Testing**: Expo Go app on iOS/Android, or Android Studio Emulator / Xcode Simulator

---

## 2. Project Directory Structure

```
├── docs/                                  # Audit reports, implementation, test & security docs
├── stitch_reference/                      # Original Google Stitch 21-screen UI exports
├── .env.example                           # Root example environment configuration
│
├── online groshries/                      # Backend API & Web Client Monorepo
│   ├── .env.example                       # Backend environment template
│   ├── prisma/                            # Prisma ORM schema and seed script
│   ├── src/                               # Express TypeScript backend source
│   ├── tests/                             # Automated platform integration test suite
│   └── client/                            # React 19 + Vite 6 + Tailwind CSS v4 Web Client
│
└── online groshries mobile app/
    └── mobile/                            # React Native 0.86 + Expo 57 Mobile App
        ├── App.tsx                        # Mobile root component
        ├── src/
        │   ├── api/                       # Axios/fetch client with SecureStore token auth
        │   ├── components/                # Reusable UI components
        │   ├── context/                   # AuthContext and CartContext providers
        │   ├── navigation/                # React Navigation stacks & bottom tabs
        │   └── screens/                   # Customer, Admin & Driver mobile screens
        └── app.json                       # Expo application manifest
```

---

## 3. Backend & Web Client Setup

### Step 3.1: Install Dependencies
Open a terminal in `online groshries`:
```bash
cd "online groshries"
npm install
npm --prefix client install
```

### Step 3.2: Configure Environment Variables
Create `.env` inside `online groshries`:
```bash
cp .env.example .env
```
Default `.env` values for local development:
```env
PORT=4000
NODE_ENV="development"
DATABASE_URL="file:./dev.db"
AUTH_SECRET="dev-secret-key-change-for-production"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://localhost:4000,http://10.0.2.2:4000,http://localhost:8081"
```

### Step 3.3: Initialize SQLite Database & Seed Data
Generate Prisma client, push database schema, and populate seed records:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```
*Seed script creates:*
- Store Admin account: Mobile `9800000000` / Password `admin123`
- Delivery Rider account: Mobile `9811111111` / Password `driver123`
- Birgunj Delivery Zones (Maisthan, Central Birgunj, Nearby Areas)
- Welcome coupons (`WELCOME100`, `SAVE10`, `FREE50`)
- Grocery catalog (Rice, Dal, Mustard Oils, Spices, Dairy)

### Step 3.4: Launch Backend API Server
```bash
npm run dev
```
The API server will listen on `http://localhost:4000`. Test with:
```bash
curl http://localhost:4000/api/health
```

### Step 3.5: Launch Web Frontend Client
In a separate terminal:
```bash
cd "online groshries/client"
npm run dev
```
The web application will open on `http://localhost:5173`.

### Step 3.6: Build Web Client for Production
```bash
cd "online groshries/client"
npm run build
```
Production output will be generated in `online groshries/client/dist`.

---

## 4. Mobile Application Setup (React Native / Expo)

### Step 4.1: Install Dependencies
Open a terminal in `online groshries mobile app/mobile`:
```bash
cd "online groshries mobile app/mobile"
npm install
```

### Step 4.2: Verify Mobile TypeScript Compilation
```bash
npx tsc --noEmit
```

### Step 4.3: Start Expo Development Server
```bash
npx expo start
```
Options to view the app:
- **Android Emulator**: Press `a` in the Expo terminal (connects to backend via `http://10.0.2.2:4000`).
- **iOS Simulator**: Press `i` in the Expo terminal (macOS only).
- **Physical Device**: Scan the QR code displayed in the terminal using the **Expo Go** app on your phone.
- **Web Preview**: Press `w` in the Expo terminal.

---

## 5. Running the Automated Test Suite

To run the automated platform integration test suite covering Authentication, Catalog, Atomic Inventory, Stock Limits, and Role-Based Access Control:

```bash
cd "online groshries"
npm test
```

Expected output:
```
▶ Gharmai Kirana End-to-End Platform Test Suite
  ✔ GET /api/health should return ok true
  ✔ POST /api/auth/register should create a customer account with valid token
  ✔ POST /api/auth/login should authenticate valid credentials and reject invalid
  ✔ GET /api/home & /api/products should return catalog data
  ✔ POST /api/checkout/preview and totals should calculate based on database prices
  ✔ POST & GET /api/addresses should manage customer addresses with Bearer token
  ✔ POST /api/checkout should atomically place order and deduct inventory
  ✔ Should prevent ordering more than available stock
  ✔ Should reject unauthenticated calls to protected routes
  ✔ Should forbid non-admin customer from calling admin endpoints (RBAC)
  ✔ Should forbid non-driver customer from calling driver endpoints (RBAC)
✔ Gharmai Kirana End-to-End Platform Test Suite
ℹ tests 11
ℹ suites 1
ℹ pass 11
ℹ fail 0
```

---

## 6. Seed Credentials for Testing

| Role | Mobile Number | Password | Capabilities |
|---|---|---|---|
| **Admin** | `9800000000` | `admin123` | Full access to Admin Console, inventory adjustments, orders dispatch |
| **Driver / Rider** | `9811111111` | `driver123` | Access to Driver Delivery Portal, customer calling, OTP delivery verification |
| **New Customer** | Self-registered | Password chosen | Full shopping flow, order history, saved addresses, wishlist |

---

## 7. Common Troubleshooting

1. **Android Emulator cannot connect to API (`Network request failed`)**:
   - The backend runs on port `4000`. On Android emulators, `localhost` maps to the emulator itself. The mobile client is pre-configured to use `http://10.0.2.2:4000` on Android. Ensure the backend server is running on port `4000`.
2. **CORS Error in Browser**:
   - Verify `CORS_ORIGIN` in `.env` contains your frontend port (default: `http://localhost:5173`).
3. **Database Reset**:
   - If you need a fresh database, run `npx prisma db push --force-reset` followed by `npm run db:seed`.
