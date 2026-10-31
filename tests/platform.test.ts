import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { prisma } from "../src/lib/prisma";
import { signSessionToken, hashPassword } from "../src/lib/session";
import { authRouter } from "../src/routes/auth.routes";
import { catalogRouter } from "../src/routes/catalog.routes";
import { addressRouter } from "../src/routes/address.routes";
import { wishlistRouter } from "../src/routes/wishlist.routes";
import { checkoutRouter } from "../src/routes/checkout.routes";
import { orderRouter } from "../src/routes/order.routes";
import { paymentRouter } from "../src/routes/payment.routes";
import { driverRouter } from "../src/routes/driver.routes";
import { adminRouter } from "../src/routes/admin.routes";
import { notFoundHandler, errorHandler } from "../src/middleware/error";
import { getCheckoutPreview, getOrderTotals } from "../src/services/checkout.service";
import { placeOrder } from "../src/services/order.service";

let server: http.Server;
let baseUrl: string;

const testApp = express();
testApp.use(cors({ origin: true, credentials: true }));
testApp.use(cookieParser());
testApp.use(express.json());

testApp.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "gharmai-kirana-api" });
});

testApp.use("/api/auth", authRouter);
testApp.use("/api", catalogRouter);
testApp.use("/api/addresses", addressRouter);
testApp.use("/api/wishlist", wishlistRouter);
testApp.use("/api/checkout", checkoutRouter);
testApp.use("/api/orders", orderRouter);
testApp.use("/api/payments", paymentRouter);
testApp.use("/api/driver", driverRouter);
testApp.use("/api/admin", adminRouter);
testApp.use(notFoundHandler);
testApp.use(errorHandler);

async function request(path: string, options: RequestInit = {}) {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(url, { ...options, headers });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-json body
  }
  return { status: res.status, headers: res.headers, body: data };
}

describe("Gharmai Kirana End-to-End Platform Test Suite", () => {
  let customerToken: string;
  let customerUser: any;
  let adminToken: string;
  let testProductId: number;
  let testProductSlug: string;
  let initialStock: number;
  let testZoneId: number;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = testApp.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // Ensure at least one delivery zone exists
    let zone = await prisma.deliveryZone.findFirst();
    if (!zone) {
      zone = await prisma.deliveryZone.create({
        data: { name: "Birgunj Maisthan Ward 8", charge: 50, minOrderForFree: 999, sortOrder: 1 },
      });
    }
    testZoneId = zone.id;

    // Ensure at least one product exists
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: "Foodgrains & Dal", slug: "chawal-daal" },
      });
    }

    let prod = await prisma.product.findFirst({ where: { active: true, stock: { gte: 50 } } });
    if (!prod) {
      prod = await prisma.product.create({
        data: {
          sku: `TEST-RICE-${Date.now()}`,
          name: "Mansuli Rice Steamed 25kg Test",
          slug: `mansuli-rice-test-${Date.now()}`,
          categoryId: category.id,
          unit: "25 kg bag",
          mrp: 2450,
          price: 2150,
          stock: 100,
          active: true,
        },
      });
    } else {
      // Ensure plenty of stock for tests
      prod = await prisma.product.update({
        where: { id: prod.id },
        data: { stock: 100 },
      });
    }
    testProductId = prod.id;
    testProductSlug = prod.slug;
    initialStock = prod.stock;

    // Ensure an admin user exists and get adminToken
    let admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          phone: "9800000001",
          name: "Birgunj Admin",
          role: "admin",
          passwordHash: await hashPassword("adminSecret123"),
        },
      });
    }
    adminToken = await signSessionToken(admin.id, admin.role, admin.tokenVersion);
  });

  after(async () => {
    if (server) server.close();
  });

  // 1. Health Endpoint
  it("GET /api/health should return ok true", async () => {
    const res = await request("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.service, "gharmai-kirana-api");
  });

  // 2. Customer Registration & Duplicate Prevention
  it("POST /api/auth/register should create a customer account with valid token", async () => {
    const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const res = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Customer Birgunj",
        phone: testPhone,
        email: `test_${Date.now()}@example.com`,
        password: "securePassword123",
      }),
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.user);
    assert.equal(res.body.user.phone, testPhone);
    assert.ok(res.body.token, "Token should be returned for mobile client");

    customerToken = res.body.token;
    customerUser = res.body.user;

    // Test Duplicate Phone Rejection (exact and with +977 prefix)
    const dupRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Another Customer",
        phone: testPhone,
        email: `another_${Date.now()}@example.com`,
        password: "securePassword123",
      }),
    });
    assert.equal(dupRes.status, 409, "Should reject duplicate phone number");

    const dupPhonePrefixRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Prefix Duplicate Customer",
        phone: `+977${testPhone}`,
        email: `prefix_${Date.now()}@example.com`,
        password: "securePassword123",
      }),
    });
    assert.equal(dupPhonePrefixRes.status, 409, "Should reject duplicate phone number with +977 prefix");

    // Test Duplicate Email Rejection (case-insensitive)
    const testEmail = `dup_test_${Date.now()}@example.com`;
    const dupEmailRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Email Duplicate Customer",
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: testEmail.toUpperCase(),
        password: "securePassword123",
      }),
    });
    assert.equal(dupEmailRes.status, 201);

    const dupEmailAgainRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Email Duplicate Customer Attempt 2",
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: testEmail.toLowerCase(),
        password: "securePassword123",
      }),
    });
    assert.equal(dupEmailAgainRes.status, 409, "Should reject duplicate email even with different casing");
  });

  // 3. Customer Login & Authentication
  it("POST /api/auth/login should authenticate valid credentials and reject invalid", async () => {
    // Valid login
    const validRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        phone: customerUser.phone,
        password: "securePassword123",
      }),
    });
    assert.equal(validRes.status, 200);
    assert.ok(validRes.body.token);

    // Invalid password
    const invalidRes = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        phone: customerUser.phone,
        password: "wrongPassword",
      }),
    });
    assert.equal(invalidRes.status, 401);
  });

  // 4. Catalog & Product Detail
  it("GET /api/home & /api/products should return catalog data", async () => {
    const homeRes = await request("/api/home");
    assert.equal(homeRes.status, 200);
    assert.ok(Array.isArray(homeRes.body.categories));

    const prodRes = await request(`/api/products/${testProductSlug}`);
    assert.equal(prodRes.status, 200);
    assert.equal(prodRes.body.id, testProductId);
    assert.equal(typeof prodRes.body.price, "number");
    assert.equal(typeof prodRes.body.stock, "number");
  });

  // 5. Checkout Calculations & Security (Server Recalculation)
  it("POST /api/checkout/preview and totals should calculate based on database prices", async () => {
    const previewRes = await request("/api/checkout/preview", {
      method: "POST",
      body: JSON.stringify({
        items: [{ id: testProductId, qty: 2 }],
      }),
    });

    assert.equal(previewRes.status, 200);
    assert.ok(Array.isArray(previewRes.body));
    const line = previewRes.body.find((l: any) => l.productId === testProductId);
    assert.ok(line);
    assert.equal(line.qty, 2);
    assert.equal(line.lineTotal, line.price * 2);
  });

  // 6. Address Management (Protected Endpoint)
  it("POST & GET /api/addresses should manage customer addresses with Bearer token", async () => {
    const createRes = await request("/api/addresses", {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        label: "Home",
        recipientName: "Test Customer",
        phone: customerUser.phone,
        addressLine: "Birgunj Ward 8 Maisthan",
        landmark: "Durga Mandir Chowk",
      }),
    });

    assert.equal(createRes.status, 201);
    assert.ok(Array.isArray(createRes.body) && createRes.body.length > 0);

    const listRes = await request("/api/addresses", {
      method: "GET",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.length > 0);
  });

  // 7. Atomic Order Placement & Inventory Deduction
  it("POST /api/checkout should atomically place order and deduct inventory", async () => {
    // Current stock before order
    const beforeProduct = await prisma.product.findUnique({ where: { id: testProductId } });
    const stockBefore = beforeProduct!.stock;

    const orderRes = await request("/api/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        lines: [{ id: testProductId, qty: 2 }],
        zoneId: testZoneId,
        recipientName: "Test Customer",
        phone: customerUser.phone,
        addressLine: "Maisthan, Ward 8",
        paymentMethod: "cod",
      }),
    });

    assert.equal(orderRes.status, 201);
    assert.equal(orderRes.body.ok, true);
    assert.ok(orderRes.body.orderId);

    // Verify inventory reduced by exactly 2
    const afterProduct = await prisma.product.findUnique({ where: { id: testProductId } });
    assert.equal(afterProduct!.stock, stockBefore - 2);

    // Verify order persisted in database
    const orderRecord = await prisma.order.findUnique({
      where: { id: orderRes.body.orderId },
      include: { items: true },
    });
    assert.ok(orderRecord);
    assert.ok(orderRecord.orderNumber.startsWith("GHK-"));
    assert.equal(orderRecord.items.length, 1);
    assert.equal(orderRecord.items[0].qty, 2);
  });

  // 8. Negative Tests & Security Enforcement
  it("Should prevent ordering more than available stock", async () => {
    const currProduct = await prisma.product.findUnique({ where: { id: testProductId } });
    const excessiveQty = currProduct!.stock + 100;

    const orderRes = await request("/api/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        lines: [{ id: testProductId, qty: excessiveQty }],
        zoneId: testZoneId,
        recipientName: "Test Customer",
        phone: customerUser.phone,
        addressLine: "Maisthan, Ward 8",
        paymentMethod: "cod",
      }),
    });

    assert.equal(orderRes.status, 400);
    assert.equal(orderRes.body.ok, false);
    assert.match(orderRes.body.error, /stock/i);
  });

  it("Should reject unauthenticated calls to protected routes", async () => {
    const res = await request("/api/addresses", { method: "GET" });
    assert.equal(res.status, 401);
  });

  it("Should forbid non-admin customer from calling admin endpoints (RBAC)", async () => {
    const res = await request("/api/admin/overview", {
      method: "GET",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.error, "Admin access only.");
  });

  it("Should forbid non-driver customer from calling driver endpoints (RBAC)", async () => {
    const res = await request("/api/driver/orders", {
      method: "GET",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.error, "Driver access only.");
  });

  it("Should allow admin to update Free Delivery Above Rs. threshold and apply it storewide", async () => {
    // 1. Non-admin forbidden
    const forbiddenRes = await request("/api/admin/settings/free-delivery", {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ threshold: 1500 }),
    });
    assert.equal(forbiddenRes.status, 403);

    // 2. Admin successfully updates free delivery threshold to Rs. 1500
    const updateRes = await request("/api/admin/settings/free-delivery", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ threshold: 1500 }),
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.ok, true);
    assert.equal(updateRes.body.freeDeliveryThreshold, 1500);

    // 3. Public config endpoint reflects the updated threshold
    const configRes = await request("/api/config", { method: "GET" });
    assert.equal(configRes.status, 200);
    assert.equal(configRes.body.freeDeliveryThreshold, 1500);

    // 4. Cart subtotal Rs. 1200 is below 1500 -> charged delivery fee (Rs. 50)
    const totalsBelow = await getOrderTotals(
      [{
        productId: testProductId,
        name: "Test",
        unit: "kg",
        price: 1200,
        mrp: 1400,
        qty: 1,
        lineTotal: 1200,
        stock: 10,
        available: true,
        image: null,
        categoryIndex: 1,
      }],
      testZoneId
    );
    const currentZone = await prisma.deliveryZone.findUniqueOrThrow({ where: { id: testZoneId } });
    assert.equal(totalsBelow.deliveryFee, currentZone.charge);

    // 5. Cart subtotal Rs. 1600 is >= 1500 -> free delivery (Rs. 0)
    const totalsAbove = await getOrderTotals(
      [{
        productId: testProductId,
        name: "Test",
        unit: "kg",
        price: 1600,
        mrp: 1800,
        qty: 1,
        lineTotal: 1600,
        stock: 10,
        available: true,
        image: null,
        categoryIndex: 1,
      }],
      testZoneId
    );
    assert.equal(totalsAbove.deliveryFee, 0);

    // 6. Reset back to Rs. 999 for normal test suite state
    await request("/api/admin/settings/free-delivery", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ threshold: 999 }),
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await prisma.$disconnect();
  });
});

