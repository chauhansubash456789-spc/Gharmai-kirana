import { prisma } from "../lib/prisma";
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES, type OrderStatus, type PaymentStatus } from "../lib/constants";
import { orderSchema, type OrderInput } from "../validations/order";
import { generateDeliveryOtp } from "./driver.service";
import { esewaFormForOrder } from "./payment.service";
import { getCheckoutPreview, getOrderTotals, type CartLine, type DeliveryAddress } from "./checkout.service";

export interface PlaceOrderInput {
  lines: CartLine[];
  zoneId: number;
  addressId?: string;
  recipientName?: string;
  phone?: string;
  addressLine?: string;
  landmark?: string;
  paymentMethod: "cod" | "qr" | "esewa" | "khalti";
  couponCode?: string;
  notes?: string;
}

export type PlaceOrderResult =
  | { ok: true; orderId: number; esewa?: { formUrl: string; fields: Record<string, string> } }
  | { ok: false; error: string };

export interface AdminOrderFilter {
  status?: string;
  q?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const ymd =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  return `GHK-${ymd}-${Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0")}`;
}

async function uniqueOrderNumber(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = generateOrderNumber();
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate } });
    if (!existing) return candidate;
  }
  return `GHK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function placeOrder(userId: number, input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid order details" };
  const data = parsed.data as OrderInput;

  const lines = await getCheckoutPreview(data.lines);
  if (lines.length === 0) return { ok: false as const, error: "Your cart is empty." };
  if (lines.some((l) => !l.available)) {
    return { ok: false as const, error: "Some items in your cart are no longer available." };
  }

  // Ensure requested quantity does not exceed stock (no silent clamping)
  for (const reqItem of data.lines) {
    const preview = lines.find((l) => l.productId === reqItem.id);
    if (!preview || preview.stock < reqItem.qty) {
      return {
        ok: false as const,
        error: `${preview ? preview.name : "Item"} — only ${preview ? preview.stock : 0} left in stock (you requested ${reqItem.qty}).`,
      };
    }
  }

  const totals = await getOrderTotals(lines, data.zoneId, data.couponCode);

  let address: DeliveryAddress | null = null;
  if (data.addressId) {
    const saved = await prisma.address.findFirst({
      where: { id: Number(data.addressId), userId },
    });
    if (saved) {
      address = {
        label: saved.label,
        recipientName: saved.recipientName,
        phone: saved.phone,
        addressLine: saved.addressLine,
        landmark: saved.landmark,
      };
    }
  }
  if (!address && data.recipientName && data.phone && data.addressLine) {
    address = {
      label: "Home",
      recipientName: data.recipientName,
      phone: data.phone,
      addressLine: data.addressLine,
      landmark: data.landmark ?? null,
    };
  }
  if (!address) return { ok: false as const, error: "Please provide a delivery address." };

  const zone = await prisma.deliveryZone.findUnique({ where: { id: data.zoneId } });
  const usedCoupon = totals.couponCode
    ? await prisma.coupon.findUnique({ where: { code: totals.couponCode } })
    : null;

  const orderNumber = await uniqueOrderNumber();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: lines.map((l) => l.productId) } },
      });
      for (const line of lines) {
        const p = products.find((pr) => pr.id === line.productId);
        if (!p || p.stock < line.qty) {
          throw new Error(`${p ? p.name : "Product"} — only ${p ? p.stock : 0} left in stock.`);
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: address.recipientName,
          customerPhone: address.phone,
          deliveryLabel: address.label,
          addressLine: address.addressLine,
          landmark: address.landmark,
          deliveryZoneName: zone?.name ?? null,
          deliveryFee: totals.deliveryFee,
          itemsSubtotal: totals.subtotal,
          discountAmount: totals.discount,
          total: totals.total,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              productName: l.name,
              unit: l.unit,
              price: l.price,
              qty: l.qty,
              subtotal: l.lineTotal,
            })),
          },
        },
        include: { items: true },
      });

      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.qty } },
        });
      }

      if (usedCoupon) {
        await tx.coupon.update({
          where: { id: usedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });

    return {
      ok: true as const,
      orderId: result.id,
      ...(data.paymentMethod === "esewa" ? { esewa: esewaFormForOrder(result) } : {}),
    };
  } catch (err) {
    return {
      ok: false as const,
      error: (err as Error).message || "Order placement failed.",
    };
  }
}

export async function updateOrderStatus(
  id: number,
  status: string,
  paymentStatus: string,
  assignedTo?: string,
  deliveryBoyId?: number | null,
): Promise<void> {
  let driverName = assignedTo?.trim() || null;
  let driverId: number | null = null;
  let otp: string | undefined;
  if (deliveryBoyId) {
    const driver = await prisma.user.findFirst({ where: { id: deliveryBoyId, role: "driver" } });
    if (!driver) throw new Error("Selected driver not found.");
    driverName = driver.name;
    driverId = driver.id;
    otp = generateDeliveryOtp();
  }
  await prisma.order.update({
    where: { id },
    data: {
      status: (ORDER_STATUS_VALUES as readonly string[]).includes(status) ? (status as OrderStatus) : "pending",
      paymentStatus: (PAYMENT_STATUS_VALUES as readonly string[]).includes(paymentStatus)
        ? (paymentStatus as PaymentStatus)
        : "pending",
      assignedTo: driverName,
      ...(driverId ? { deliveryBoyId: driverId, deliveryOtp: otp } : {}),
    },
  });
}

export async function listOrdersForAdmin(filter: AdminOrderFilter, limit = 100) {
  const { status, q } = filter;
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { customerPhone: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listOrdersForUser(userId: number, limit = 30) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getOrderForUser(userId: number, id: number) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });
  if (!order) return null;

  let deliveryPerson: { name: string; phone: string; vehicleType?: string | null } | null = null;
  if (order.deliveryBoyId) {
    const driver = await prisma.user.findFirst({
      where: { id: order.deliveryBoyId },
      select: { name: true, phone: true, vehicleType: true },
    });
    if (driver) {
      deliveryPerson = driver;
    }
  } else if (order.assignedTo) {
    deliveryPerson = {
      name: order.assignedTo,
      phone: "9800000000",
      vehicleType: "Motorcycle",
    };
  }

  return {
    ...order,
    deliveryPerson,
  };
}

export async function deleteOrderForUser(userId: number, id: number): Promise<{ ok: boolean; error?: string }> {
  const order = await prisma.order.findFirst({ where: { id, userId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "delivered" && order.status !== "cancelled") {
    return { ok: false, error: "Only delivered or cancelled orders can be deleted." };
  }

  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });
  return { ok: true };
}

export async function getOrderForAdmin(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}
