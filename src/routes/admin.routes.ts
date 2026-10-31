import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/auth";
import { validateBody, validatedOf } from "../middleware/validate";
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "../lib/constants";
import { productSchema, zoneSchema, categorySchema, couponSchema, driverSchema, type DriverInput } from "../validations";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addStock,
  listProductsForAdmin,
  getAllProductsForInventory,
  getProductForAdmin,
} from "../services/product.service";
import {
  listOrdersForAdmin,
  getOrderForAdmin,
  updateOrderStatus,
} from "../services/order.service";
import { getDashboardData } from "../services/dashboard.service";
import { getCustomersWithTotals } from "../services/customer.service";
import { listDrivers, createDriver, deleteDriver } from "../services/driver.service";
import {
  listZones,
  createZone,
  updateZone,
  deleteZone,
} from "../services/zone.service";
import { listCategoriesWithProductCount, createCategory, deleteCategory } from "../services/category.service";
import { listCoupons, createCoupon, toggleCoupon } from "../services/coupon.service";
import {
  getAllStoreSettings,
  updateFreeDeliveryThreshold,
  setStoreSetting,
} from "../services/setting.service";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

const statusSchema = z.object({
  status: z.string().refine((v) => (ORDER_STATUS_VALUES as readonly string[]).includes(v)),
  paymentStatus: z.string().refine((v) => (PAYMENT_STATUS_VALUES as readonly string[]).includes(v)),
  assignedTo: z.string().optional().nullable(),
  deliveryBoyId: z.coerce.number().int().positive().optional().nullable(),
});

const restockSchema = z.object({ qty: z.coerce.number().int().positive() });

/* ---------- Dashboard ---------- */
adminRouter.get("/dashboard", async (_req, res) => {
  res.json(await getDashboardData());
});

adminRouter.get("/overview", async (_req, res) => {
  const data = await getDashboardData();
  const salesToday = typeof data.cards[0]?.value === "number" ? data.cards[0].value : 0;
  const ordersToday = typeof data.cards[1]?.value === "number" ? data.cards[1].value : 0;
  const pendingOrders = typeof data.cards[2]?.value === "number" ? data.cards[2].value : 0;
  const activeDrivers = await prisma.user.count({ where: { role: "driver", isOnline: true } });

  res.json({
    salesToday,
    ordersToday,
    pendingOrders,
    lowStockCount: data.lowStock.length,
    activeDrivers,
    recentOrders: data.recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  });
});

/* ---------- Orders ---------- */
adminRouter.get("/orders", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  res.json(await listOrdersForAdmin({ status, q }));
});

adminRouter.get("/orders/:id", async (req, res) => {
  const order = await getOrderForAdmin(Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }
  res.json(order);
});

adminRouter.post("/orders/:id/status", validateBody(statusSchema), async (req, res) => {
  const { status, paymentStatus, assignedTo, deliveryBoyId } = validatedOf<{
    status: string;
    paymentStatus: string;
    assignedTo?: string | null;
    deliveryBoyId?: number | null;
  }>(res);
  try {
    await updateOrderStatus(Number(req.params.id), status, paymentStatus, assignedTo ?? undefined, deliveryBoyId ?? undefined);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Could not update order." });
    return;
  }
  res.json({ ok: true });
});

adminRouter.get("/drivers", async (_req, res) => {
  res.json(await listDrivers());
});

adminRouter.post("/drivers", validateBody(driverSchema), async (req, res) => {
  const input = validatedOf<DriverInput>(res);
  const result = await createDriver(input as never);
  if (result.error) {
    res.status(409).json(result);
    return;
  }
  res.status(201).json({ ok: true });
});

adminRouter.delete("/drivers/:id", async (req, res) => {
  const result = await deleteDriver(Number(req.params.id));
  if (result.error) {
    res.status(422).json(result);
    return;
  }
  res.json({ ok: true });
});

/* ---------- Products ---------- */
adminRouter.get("/products", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  res.json(await listProductsForAdmin(q));
});

adminRouter.get("/products/:id", async (req, res) => {
  const product = await getProductForAdmin(Number(req.params.id));
  if (!product) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  res.json(product);
});

adminRouter.post("/products", validateBody(productSchema), async (req, res) => {
  const input = validatedOf<z.infer<typeof productSchema>>(res);
  const result = await createProduct(input as never);
  if (result && "error" in result) {
    res.status(422).json(result);
    return;
  }
  res.status(201).json({ ok: true });
});

adminRouter.put("/products/:id", validateBody(productSchema), async (req, res) => {
  const input = validatedOf<z.infer<typeof productSchema>>(res);
  const result = await updateProduct(Number(req.params.id), input as never);
  if (result && "error" in result) {
    res.status(422).json(result);
    return;
  }
  res.json({ ok: true });
});

adminRouter.delete("/products/:id", async (req, res) => {
  await deleteProduct(Number(req.params.id));
  res.json({ ok: true });
});

adminRouter.post("/products/:id/restock", validateBody(restockSchema), async (req, res) => {
  const { qty } = validatedOf<{ qty: number }>(res);
  await addStock(Number(req.params.id), qty);
  res.json({ ok: true });
});

/* ---------- Inventory ---------- */
adminRouter.get("/inventory", async (_req, res) => {
  res.json(await getAllProductsForInventory());
});

/* ---------- Customers ---------- */
adminRouter.get("/customers", async (_req, res) => {
  const { customers, totalsByUser } = await getCustomersWithTotals();
  res.json({ customers, totalsByUser: Object.fromEntries(totalsByUser) });
});

/* ---------- Zones ---------- */
adminRouter.get("/zones", async (_req, res) => {
  res.json(await listZones());
});

adminRouter.post("/zones", validateBody(zoneSchema), async (req, res) => {
  const input = validatedOf<z.infer<typeof zoneSchema>>(res);
  const result = await createZone(input as never);
  if (result && "error" in result) {
    res.status(422).json(result);
    return;
  }
  res.status(201).json({ ok: true });
});

adminRouter.put("/zones/:id", validateBody(zoneSchema), async (req, res) => {
  const input = validatedOf<z.infer<typeof zoneSchema>>(res);
  const result = await updateZone(Number(req.params.id), input as never);
  if (result && "error" in result) {
    res.status(422).json(result);
    return;
  }
  res.json({ ok: true });
});

adminRouter.delete("/zones/:id", async (req, res) => {
  await deleteZone(Number(req.params.id));
  res.json({ ok: true });
});

/* ---------- Categories ---------- */
adminRouter.get("/categories", async (_req, res) => {
  res.json(await listCategoriesWithProductCount());
});

adminRouter.post("/categories", validateBody(categorySchema), async (req, res) => {
  const input = validatedOf<z.infer<typeof categorySchema>>(res);
  const result = await createCategory(input as never);
  if (result && "error" in result) {
    res.status(422).json(result);
    return;
  }
  res.status(201).json({ ok: true });
});

adminRouter.delete("/categories/:id", async (req, res) => {
  const result = await deleteCategory(Number(req.params.id));
  if (result.error) {
    res.status(422).json(result);
    return;
  }
  res.json({ ok: true });
});

/* ---------- Coupons ---------- */
adminRouter.get("/coupons", async (_req, res) => {
  res.json(await listCoupons());
});

adminRouter.post("/coupons", validateBody(couponSchema), async (req, res) => {
  const input = validatedOf<z.infer<typeof couponSchema>>(res);
  const result = await createCoupon(input as never);
  if (result && "error" in result) {
    res.status(409).json(result);
    return;
  }
  res.status(201).json({ ok: true });
});

adminRouter.post("/coupons/:id/toggle", async (req, res) => {
  const active = Boolean(req.body?.active);
  await toggleCoupon(Number(req.params.id), active);
  res.json({ ok: true });
});

/* ---------- Store Settings & Free Delivery Threshold ---------- */
const settingsSchema = z.object({
  freeDeliveryThreshold: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  storeName: z.string().trim().min(1).optional(),
  storePhone: z.string().trim().optional(),
  openHours: z.string().trim().optional(),
});

const freeDeliverySchema = z.object({
  threshold: z.coerce.number().min(0, "Threshold must be greater than or equal to 0"),
});

adminRouter.get("/settings", async (_req, res) => {
  res.json(await getAllStoreSettings());
});

adminRouter.put("/settings", validateBody(settingsSchema), async (_req, res) => {
  const data = validatedOf<z.infer<typeof settingsSchema>>(res);

  if (data.freeDeliveryThreshold !== undefined) {
    await updateFreeDeliveryThreshold(data.freeDeliveryThreshold);
  }
  if (data.minOrderAmount !== undefined) {
    await setStoreSetting("min_order_amount", String(data.minOrderAmount));
  }
  if (data.storeName !== undefined) {
    await setStoreSetting("store_name", data.storeName);
  }
  if (data.storePhone !== undefined) {
    await setStoreSetting("store_phone", data.storePhone);
  }
  if (data.openHours !== undefined) {
    await setStoreSetting("open_hours", data.openHours);
  }

  res.json({ ok: true, settings: await getAllStoreSettings() });
});

adminRouter.post("/settings/free-delivery", validateBody(freeDeliverySchema), async (_req, res) => {
  const { threshold } = validatedOf<z.infer<typeof freeDeliverySchema>>(res);
  const updated = await updateFreeDeliveryThreshold(threshold);
  res.json({ ok: true, freeDeliveryThreshold: updated });
});