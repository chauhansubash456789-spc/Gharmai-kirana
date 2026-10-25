# Gharmai Kirana Platform: Comprehensive Project & Design Audit

## 1. Project Location & Verification

- **Specified Reference Root**: `C:\Users\chauh\Downloads\stitch_gharmai_kirana_grocery_platform\stitch_gharmai_kirana_grocery_platform`
  - **Verification Status**: Verified present on local filesystem. Contains 21 exported Google Stitch screen packages (each containing `code.html` and `screen.png`).
  - **System Access & Sync**: To comply with Antigravity workspace sandbox security policies, the complete Stitch design reference has also been mirrored directly into the workspace at `stitch_reference/` for continuous access, automated verification, and visual fidelity checks.
- **Implementation Workspaces**:
  - **Web Application & Backend Server**: `online groshries/` (`gharmai-kirana`)
    - Express 5.1.0 backend with TypeScript, Prisma ORM, Better-SQLite3, Jose JWT authentication.
    - React 19 SPA (`client/`) powered by Vite 6.3.5, React Router 7.6.3, Lucide icons, Tailwind CSS 4.1.8.
  - **Mobile Application**: `online groshries mobile app/mobile/` (`mobile`)
    - React Native 0.86.3 / Expo 57 with TypeScript, React Navigation 7, Zustand, TanStack Query, Axios.

---

## 2. Design Inventory (Google Stitch Reference: 21 Screens)

| # | Screen / Asset Directory | Intended User Role | Key Elements & Layout Structure | Navigation & Interactive States |
|---|---|---|---|---|
| 1 | `gharmai_kirana_logo` | Brand Asset | Vector wordmark and typography for "Gharmai Kirana" (घरमै किराना). Forest green (#005d42) and golden accents. | Header branding, splash screens, favicon, invoice banners. |
| 2 | `gharmai_kirana_home` | Customer | Sticky top header with Birgunj location picker ("Maisthan, Ward 8"), bilingual toggle, notification badge, quick search bar with tune filter, gradient hero banner, value props (Same Day, Sasto Mulya, COD/QR), Category 3-col grid, Today's Deals, Best Sellers, Combos. | Tap search -> `/search`, tap category -> `/category/:slug`, tap product -> `/product/:slug`, add to cart button with quantity stepper. |
| 3 | `category_foodgrains_chawal_daal` | Customer | Category hero banner, subcategory pills (Mansuli, Basmati, Jeera Masino, Lentils), 2-col product grid with MRP vs Offer price, discount tag, weight unit, stock badge. | Filter chips, sort dropdown, add-to-cart with increment/decrement, bottom cart peek bar. |
| 4 | `product_detail_mansuli_rice` | Customer | High-res product image gallery/carousel, brand, localized Nepali title, MRP strikeout, selling price, savings pill, stock status ("In Stock: 24 bags"), pack size selector (5kg, 10kg, 25kg), description tabs, delivery estimate. | Pack size change updates price, stepper quantity, Add to Cart, Buy Now, Share, Add to Wishlist. |
| 5 | `search_results_mansuli` | Customer | Search input with live clear, sort options (Relevance, Price Low-High, Discount), active filter tags, grid results with highlighted matching tokens, empty search recommendations. | Dynamic typing debounce, filter drawer toggle, instant cart add. |
| 6 | `shopping_cart_3_items` | Customer | Delivery address reminder strip, itemized list with product image, unit, unit price, quantity increment/decrement, delete button, promo coupon input with 'Apply' button, order summary (Subtotal, Delivery Fee, Discount, Total), checkout CTA. | Quantity adjustment, item removal, coupon validation response, proceed to checkout navigation. |
| 7 | `checkout_birgunj_delivery` | Customer | Multi-step progress (Address -> Delivery Slot -> Payment), saved address selection + Add New Address with GPS pin, delivery time slots (Morning 7-10 AM, Afternoon 1-4 PM, Evening 5-8 PM), payment method toggle (Cash on Delivery, eSewa, Khalti, Fonepay QR), order breakdown. | Interactive address radio selection, slot selection, payment gateway selection, place order button with loading state. |
| 8 | `saved_addresses_birgunj_delivery` | Customer | List of saved addresses (Home, Office, Shop), default badge, recipient name, phone, full address, landmark, GPS latitude/longitude status, Edit/Delete actions, 'Add New Address' modal with Leaflet interactive pin. | Set as default toggle, delete confirmation, geolocation autofill button. |
| 9 | `order_tracking_gk_8821` | Customer / Driver | Live order stepper (Order Placed -> Confirmed -> Packing -> Out for Delivery -> Delivered), assigned delivery partner card (photo, name, phone, vehicle type), estimated delivery time, delivery OTP, order item summary. | Call driver button, refresh status, download invoice/receipt. |
| 10 | `order_history_gharmai_kirana` | Customer | Tabbed order listing (All, Active, Completed, Cancelled), order cards with order number (#GK-xxxx), date, total items, total price, status badge, re-order button, view details button. | Filter by status, tap card to navigate to tracking/detail. |
| 11 | `account_ramesh_shrestha` | Customer | User profile card (Name, Phone, Email, Member tier, Loyalty points balance), quick links: My Orders, Saved Addresses, Wishlist, Notification settings, Language preference, Logout button. | Profile edit modal, change password, address shortcuts. |
| 12 | `wishlist_saved_items` | Customer | Grid/list of favorited products, stock status, move-to-cart action, remove action, empty wishlist illustration with 'Start Shopping' CTA. | Move all to cart, single item remove, item card click. |
| 13 | `coupons_promotions_gharmai_kirana` | Customer | Active promo cards with coupon code, discount value (Flat Rs / %), minimum order requirement, expiry date, copy code button, terms & conditions accordion. | Tap to copy code, automatic redirect to cart with applied code. |
| 14 | `fresh_terai_commerce` | Customer | Showcase of fresh Terai produce, seasonal vegetable combos, farmer-direct procurement badges, freshness guarantee info, add combo to cart. | Combo pack selection, custom bundle builder. |
| 15 | `admin_dashboard_gharmai_kirana` | Admin | KPI cards (Today's Sales, Orders Count, Pending Orders, Low Stock Alerts, Active Drivers), revenue graph, recent orders table with quick status changer, quick action buttons. | Date range picker, order row click, driver assignment dropdown. |
| 16 | `admin_products_inventory_gharmai_kirana` | Admin | Product table with thumbnail, SKU, name, category, purchase price, selling price, current stock, low stock warning (<10), active toggle, Edit/Delete buttons, 'Add Product' modal. | Search by name/SKU, category filter, inline stock adjustment, bulk price update. |
| 17 | `admin_orders_dispatch_gharmai_kirana` | Admin | Dispatch board / order management matrix with tabs (New, Packing, Assigned, Out for Delivery, Completed), driver assignment modal, OTP verification override, print packing slip. | Status transition buttons, assign driver modal, bulk dispatch. |
| 18 | `admin_customers_gharmai_kirana` | Admin | Customer directory with name, phone, total orders placed, lifetime spend, registered date, status (active/blocked), view customer orders link. | Search customers, filter by spend tier, customer order history modal. |
| 19 | `admin_delivery_zones_gharmai_kirana` | Admin | List of Birgunj wards and coverage zones (Adarshanagar, Maisthan, Murli, Ghantaghar, etc.), delivery charges per zone, free delivery threshold, active toggle, add zone form. | Add/edit zone modal, update charge, toggle zone availability. |
| 20 | `admin_drivers_fleet_gharmai_kirana` | Admin | Fleet management list with driver name, phone, vehicle type (Bike, Scooter, Van), current status (Online/Offline, On Delivery), assigned order count, active delivery boy registration. | Add driver modal, view driver delivery logs, toggle active status. |
| 21 | `admin_settings_configuration_gharmai_kirana` | Admin | Store configuration panel: store open/close toggle, operating hours, delivery radius, tax/VAT settings, payment gateway API keys (eSewa, Khalti), SMS gateway settings. | Save configuration form, test SMS/payment connection. |

---

## 3. Design-to-Implementation Matrix

| # | Screen | Web Status | Mobile Status | Backend API | Test Coverage |
|---|---|---|---|---|---|
| 1 | Logo / Brand | ✅ Integrated (`client/src/components`) | ⚠️ Partial (text only) | Static asset | ❌ Missing |
| 2 | Home Screen | ⚠️ Partial (needs Stitch tokens & layout) | ⚠️ Basic partial (`HomeScreen.tsx`) | `GET /api/home` | ❌ Missing |
| 3 | Category Detail | ⚠️ Implemented (basic UI) | ⚠️ Basic partial (`CategoryDetailScreen.tsx`) | `GET /api/categories/:slug` | ❌ Missing |
| 4 | Product Detail | ⚠️ Implemented (basic UI) | ❌ Stub (missing screen) | `GET /api/products/:slug` | ❌ Missing |
| 5 | Search Screen | ⚠️ Implemented (basic UI) | ⚠️ Basic partial (`SearchScreen.tsx`) | `GET /api/products` | ❌ Missing |
| 6 | Shopping Cart | ⚠️ Implemented (basic UI) | ❌ Stub (255 bytes) | `useCart`, `POST /api/checkout/validate` | ❌ Missing |
| 7 | Checkout Screen | ⚠️ Implemented (needs design polish) | ❌ Stub (missing screen) | `POST /api/checkout` | ❌ Missing |
| 8 | Saved Addresses | ⚠️ Implemented in Account (`Account.tsx`) | ❌ Stub in Account | `GET/POST /api/addresses` | ❌ Missing |
| 9 | Order Tracking | ⚠️ Implemented in `AccountOrderDetail.tsx` | ❌ Stub (missing screen) | `GET /api/orders/:id` | ❌ Missing |
| 10 | Order History | ⚠️ Implemented (`AccountOrders.tsx`) | ❌ Stub in Account | `GET /api/orders` | ❌ Missing |
| 11 | Account / Profile | ⚠️ Implemented (`Account.tsx`) | ❌ Stub (261 bytes) | `GET /api/auth/me` | ❌ Missing |
| 12 | Wishlist Screen | ⚠️ Implemented (`Wishlist.tsx`) | ❌ Stub (263 bytes) | `GET /api/wishlist` | ❌ Missing |
| 13 | Coupons / Promos | ⚠️ Implemented in Admin | ❌ Missing on mobile | `GET /api/admin/coupons` | ❌ Missing |
| 14 | Fresh Terai Produce | ⚠️ Covered via Category/Combos | ❌ Stub on mobile | `GET /api/home` | ❌ Missing |
| 15 | Admin Dashboard | ⚠️ Implemented (`Dashboard.tsx`) | ❌ Stub (269 bytes) | `GET /api/admin/overview` | ❌ Missing |
| 16 | Admin Products | ⚠️ Implemented (`AdminProducts.tsx`) | ❌ Not in mobile | `GET/POST/PUT /api/admin/products` | ❌ Missing |
| 17 | Admin Orders | ⚠️ Implemented (`AdminOrders.tsx`) | ❌ Not in mobile | `GET/PATCH /api/admin/orders` | ❌ Missing |
| 18 | Admin Customers | ⚠️ Implemented (`AdminCustomers.tsx`) | ❌ Not in mobile | `GET /api/admin/customers` | ❌ Missing |
| 19 | Admin Zones | ⚠️ Implemented (`AdminZones.tsx`) | ❌ Not in mobile | `GET/POST /api/admin/zones` | ❌ Missing |
| 20 | Admin Drivers | ⚠️ Implemented (`AdminDrivers.tsx`) | ❌ Stub (`DriverDashboardScreen`) | `GET/POST /api/admin/drivers` | ❌ Missing |
| 21 | Admin Settings | ⚠️ Partially in `.env` / zones | ❌ Not in mobile | Configuration APIs | ❌ Missing |

---

## 4. Defect Classification & Gap Analysis

### CRITICAL Defect / Gaps
1. **Zero Test Automation**: No unit tests, API tests, or integration tests exist in either `online groshries` or `mobile`. Any regression or security vulnerability would go undetected.
2. **Missing Mobile Application Screens**: `CartScreen.tsx` (255 bytes), `AccountScreen.tsx` (261 bytes), `WishlistScreen.tsx` (263 bytes), `LoginScreen.tsx` (257 bytes), and `RegisterScreen.tsx` (263 bytes) are empty stubs. The mobile app cannot perform checkout, user authentication, or cart persistence.
3. **Inventory Race Condition / Atomic Order Placement**: Order placement and stock deduction must be strictly atomic using Prisma interactive transactions to prevent overselling or race conditions during concurrent orders.

### HIGH Priority Defect / Gaps
1. **Design System Disparity (Web & Mobile)**: The web client is using basic Tailwind styling with Arial font, missing the Stitch Material 3 design tokens:
   - Primary: `#005d42`, Surface: `#faf8ff`, Inter font, Birgunj localized elements, bilingual English/Nepali labels.
2. **Missing Product Detail & Checkout on Mobile**: The mobile app lacks dedicated screens for single product view (`ProductDetailScreen`) and multi-step checkout (`CheckoutScreen`), which are vital for a functional grocery app.
3. **CORS & Environment Setup**: The server currently defaults to `http://localhost:5173`. Expo mobile client connects from `10.0.2.2` (Android emulator) or local network IP, requiring open/configurable CORS headers and base URL configuration.

### MEDIUM Priority Defect / Gaps
1. **Search Experience**: Debounced auto-complete and filter chips on mobile and web need closer alignment with Stitch search UI.
2. **eSewa / Payment Gateway Verification**: Payment callbacks and signature verification must be secured with robust fallback to cash on delivery.

### LOW Priority Defect / Polish
1. Micro-animations on Add to Cart steppers.
2. Icon consistency between Lucide and Material Symbols Outlined.

---

## 5. Technology Stack & Strategy

- **Web Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + React Router v7. Adopt the Stitch design tokens (Inter font, `#005d42` primary palette, Material Symbols/Lucide).
- **Mobile Frontend**: React Native 0.86 + Expo 57 + TypeScript + React Navigation v7 + Zustand + TanStack Query. Implement all customer flows (Auth, Home, Category, Product, Cart, Checkout, Orders, Profile).
- **Backend & API**: Express 5.1 on Node.js / TypeScript (`tsx watch`), RESTful architecture with Zod schema validation, Jose JWT auth, cookie and Bearer token support.
- **Database**: SQLite via Prisma ORM 7.9 with Better-SQLite3 adapter. Complete transactional integrity for inventory and orders.
- **Testing Suite**: Vitest / Node native test runner with supertest / fetch API integration tests covering Auth, Catalog, Cart, Checkout, Stock limits, and Admin RBAC.
