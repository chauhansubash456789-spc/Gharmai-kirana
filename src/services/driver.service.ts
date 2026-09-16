import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/session";

const PROOF_DIR = path.resolve("uploads", "deliveries");

export function generateDeliveryOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function ownOrder(driverId: number, orderId: number) {
  return prisma.order.findFirst({
    where: { id: orderId, deliveryBoyId: driverId },
    include: { items: true },
  });
}

export async function getDriverOrders(driverId: number) {
  return prisma.order.findMany({
    where: { deliveryBoyId: driverId, status: { notIn: ["delivered", "cancelled"] } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
}

function rangeStart(range: string): Date {
  const now = new Date();
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDriverStats(driverId: number) {
  const todayStart = rangeStart("today");
  const [assignedToday, active, completedToday, cashRows] = await Promise.all([
    prisma.order.count({ where: { deliveryBoyId: driverId, createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { deliveryBoyId: driverId, status: { notIn: ["delivered", "cancelled"] } } }),
    prisma.order.count({ where: { deliveryBoyId: driverId, status: "delivered", updatedAt: { gte: todayStart } } }),
    prisma.order.findMany({
      where: {
        deliveryBoyId: driverId,
        status: "delivered",
        paymentMethod: "cod",
        updatedAt: { gte: todayStart },
      },
      select: { total: true },
    }),
  ]);
  return {
    assignedToday,
    active,
    completedToday,
    cashCollectedToday: cashRows.reduce((s, o) => s + o.total, 0),
  };
}

export async function getDriverHistory(driverId: number, range: string) {
  return prisma.order.findMany({
    where: {
      deliveryBoyId: driverId,
      status: { in: ["delivered", "cancelled"] },
      updatedAt: { gte: rangeStart(range) },
    },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function setDriverOnline(driverId: number, online: boolean) {
  await prisma.user.update({ where: { id: driverId }, data: { isOnline: online } });
}

export type DriverActionResult = { ok: true } | { ok: false; error: string };

export async function driverAccept(driverId: number, orderId: number): Promise<DriverActionResult> {
  const order = await ownOrder(driverId, orderId);
  if (!order) return { ok: false, error: "Order not found or not assigned to you." };
  if (order.status === "cancelled") return { ok: false, error: "This order was cancelled." };
  if (order.status !== "pending") return { ok: false, error: "Order is already accepted." };
  await prisma.order.update({ where: { id: order.id }, data: { status: "confirmed" } });
  return { ok: true };
}

export async function driverPickup(driverId: number, orderId: number): Promise<DriverActionResult> {
  const order = await ownOrder(driverId, orderId);
  if (!order) return { ok: false, error: "Order not found or not assigned to you." };
  if (!["confirmed", "packing"].includes(order.status)) {
    return { ok: false, error: "Pick up is only available for accepted orders." };
  }
  await prisma.order.update({ where: { id: order.id }, data: { status: "packing" } });
  return { ok: true };
}

export async function driverOutForDelivery(driverId: number, orderId: number): Promise<DriverActionResult> {
  const order = await ownOrder(driverId, orderId);
  if (!order) return { ok: false, error: "Order not found or not assigned to you." };
  if (!["confirmed", "packing", "out_for_delivery"].includes(order.status)) {
    return { ok: false, error: "Order cannot go out for delivery from its current state." };
  }
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "out_for_delivery", deliveryOtp: order.deliveryOtp ?? generateDeliveryOtp() },
  });
  return { ok: true };
}

function saveProofImage(orderId: number, dataUrl: string): string {
  const match = /^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!match) throw new Error("Proof must be a PNG or JPEG image.");
  const ext = match[1] === "png" ? "png" : "jpg";
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 2 * 1024 * 1024) throw new Error("Proof image must be under 2MB.");
  mkdirSync(PROOF_DIR, { recursive: true });
  const filename = `order-${orderId}-${Date.now()}.${ext}`;
  writeFileSync(path.join(PROOF_DIR, filename), buffer);
  return `uploads/deliveries/${filename}`;
}

export async function driverComplete(
  driverId: number,
  orderId: number,
  otp: string,
  proofImage?: string,
  notes?: string,
): Promise<DriverActionResult> {
  const order = await ownOrder(driverId, orderId);
  if (!order) return { ok: false, error: "Order not found or not assigned to you." };
  if (order.status === "delivered") return { ok: false, error: "Order is already delivered." };
  if (order.status === "cancelled") return { ok: false, error: "This order was cancelled." };
  if (!order.deliveryOtp || otp.trim() !== order.deliveryOtp) {
    return { ok: false, error: "Incorrect delivery OTP. Ask the customer for the 4-digit code." };
  }
  let proofPath: string | null = null;
  if (proofImage) {
    try {
      proofPath = saveProofImage(order.id, proofImage);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Invalid proof image." };
    }
  }
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "delivered",
      paymentStatus: order.paymentMethod === "cod" ? "paid" : order.paymentStatus,
      deliveryOtp: null,
      proofImage: proofPath ?? order.proofImage,
      deliveryNotes: notes?.trim() || order.deliveryNotes,
    },
  });
  return { ok: true };
}

const FAIL_REASONS = ["Customer Unreachable", "Wrong Address", "Customer Refused", "Shop Closed", "Other"];

export function failReasons(): string[] {
  return FAIL_REASONS;
}

export async function driverFail(driverId: number, orderId: number, reason: string): Promise<DriverActionResult> {
  const order = await ownOrder(driverId, orderId);
  if (!order) return { ok: false, error: "Order not found or not assigned to you." };
  if (["delivered", "cancelled"].includes(order.status)) {
    return { ok: false, error: "This order is already closed." };
  }
  if (!FAIL_REASONS.includes(reason)) return { ok: false, error: "Choose a valid failure reason." };
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "cancelled", deliveryNotes: reason },
  });
  return { ok: true };
}

export async function listDrivers() {
  return prisma.user.findMany({
    where: { role: "driver" },
    select: { id: true, name: true, phone: true, email: true, isOnline: true, vehicleType: true },
    orderBy: { name: "asc" },
  });
}

export interface CreateDriverInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
  vehicleType?: string;
}

export async function createDriver(input: CreateDriverInput): Promise<{ error?: string }> {
  const email = input.email?.trim() || null;
  const existingPhone = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existingPhone) return { error: "An account with this mobile number already exists." };
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return { error: "An account with this email already exists." };
  }
  await prisma.user.create({
    data: {
      name: input.name.trim(),
      phone: input.phone,
      email,
      passwordHash: await hashPassword(input.password),
      role: "driver",
      vehicleType: input.vehicleType?.trim() || null,
    },
  });
  return {};
}

export async function deleteDriver(id: number): Promise<{ error?: string }> {
  const driver = await prisma.user.findFirst({ where: { id, role: "driver" } });
  if (!driver) return { error: "Driver not found." };
  const active = await prisma.order.count({
    where: { deliveryBoyId: id, status: { notIn: ["delivered", "cancelled"] } },
  });
  if (active > 0) return { error: `${driver.name} still has ${active} active order(s). Reassign them first.` };
  await prisma.user.delete({ where: { id } });
  return {};
}