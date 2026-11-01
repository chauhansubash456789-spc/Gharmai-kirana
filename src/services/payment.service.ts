import { prisma } from "../lib/prisma";
import { frontendBaseUrl } from "../lib/appUrl";
import {
  buildEsewaForm,
  checkEsewaStatus,
  decodeEsewaResponse,
  esewaConfig,
  verifyEsewaSignature,
} from "../lib/esewa";
import { initiateKhalti, lookupKhalti } from "../lib/khalti";

interface EsewaOrderAmounts {
  amount: number;
  deliveryCharge: number;
  total: number;
}

export function esewaAmountsForOrder(order: { itemsSubtotal: number; discountAmount: number; deliveryFee: number }): EsewaOrderAmounts {
  const amount = Math.round(order.itemsSubtotal - order.discountAmount);
  const deliveryCharge = Math.round(order.deliveryFee);
  return { amount, deliveryCharge, total: amount + deliveryCharge };
}

export function esewaFormForOrder(order: { id: number; orderNumber: string; itemsSubtotal: number; discountAmount: number; deliveryFee: number }) {
  const { amount, deliveryCharge } = esewaAmountsForOrder(order);
  const base = frontendBaseUrl();
  return buildEsewaForm({
    amount,
    deliveryCharge,
    transactionUuid: order.orderNumber,
    successUrl: `${base}/payment/success?orderId=${order.id}`,
    failureUrl: `${base}/payment/failed?orderId=${order.id}`,
  });
}

export type EsewaInitResult = { ok: true; formUrl: string; fields: Record<string, string> } | { ok: false; error: string };

export async function initiateEsewaPayment(userId: number, orderId: number): Promise<EsewaInitResult> {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentMethod !== "esewa") return { ok: false, error: "This order is not an eSewa order." };
  if (order.paymentStatus === "paid") return { ok: false, error: "This order is already paid." };
  if (order.status === "cancelled") return { ok: false, error: "This order was cancelled." };
  return { ok: true, ...esewaFormForOrder(order) };
}

export type EsewaVerifyResult =
  | { ok: true; paymentStatus: string; refId: string | null }
  | { ok: false; error: string };

export async function verifyEsewaPayment(userId: number, orderId: number, data: string): Promise<EsewaVerifyResult> {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentMethod !== "esewa") return { ok: false, error: "This order is not an eSewa order." };
  if (order.paymentStatus === "paid") return { ok: true, paymentStatus: "paid", refId: order.paymentRef };

  let payload;
  try {
    payload = decodeEsewaResponse(data);
  } catch {
    return { ok: false, error: "Invalid payment response from eSewa." };
  }

  if (String(payload.status ?? "").toUpperCase() !== "COMPLETE") {
    return { ok: false, error: "eSewa payment was not completed." };
  }
  if (payload.product_code !== esewaConfig.productCode || payload.transaction_uuid !== order.orderNumber) {
    return { ok: false, error: "Payment details do not match this order." };
  }
  const { total } = esewaAmountsForOrder(order);
  if (Number(payload.total_amount) !== total) {
    return { ok: false, error: "Paid amount does not match the order total." };
  }
  if (!verifyEsewaSignature(payload)) {
    return { ok: false, error: "Payment signature verification failed." };
  }

  let status: string;
  let refId: string | null;
  try {
    const checked = await checkEsewaStatus(order.orderNumber, total);
    status = checked.status;
    refId = checked.refId ?? (payload.transaction_code != null ? String(payload.transaction_code) : null);
  } catch {
    return { ok: false, error: "Could not confirm payment with eSewa. Please try again." };
  }
  if (status !== "COMPLETE") {
    return { ok: false, error: `eSewa reports this payment as ${status}.` };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "paid", paymentRef: refId },
  });
  return { ok: true, paymentStatus: "paid", refId };
}

export type KhaltiInitResult =
  | { ok: true; pidx: string; payment_url: string; expires_at: string }
  | { ok: false; error: string };

export async function initiateKhaltiOrderPayment(
  userId: number,
  orderId: number,
  returnUrlOverride?: string
): Promise<KhaltiInitResult> {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentStatus === "paid") return { ok: false, error: "This order is already paid." };
  if (order.status === "cancelled") return { ok: false, error: "This order was cancelled." };

  const base = returnUrlOverride ? new URL(returnUrlOverride).origin : frontendBaseUrl();
  const returnUrl = returnUrlOverride || `${base}/payment/khalti/callback?orderId=${order.id}`;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const amountInPaisa = Math.round(order.total * 100);

  try {
    const initRes = await initiateKhalti({
      returnUrl,
      websiteUrl: base,
      amountInPaisa,
      purchaseOrderId: order.orderNumber,
      purchaseOrderName: `Gharmai Kirana Order ${order.orderNumber}`,
      customerInfo: {
        name: order.customerName || user?.name || "Test Bahadur",
        email: user?.email || "test@khalti.com",
        phone: order.customerPhone || user?.phone || "9800000001",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentRef: initRes.pidx,
        paymentMethod: "khalti",
      },
    });

    return {
      ok: true,
      pidx: initRes.pidx,
      payment_url: initRes.payment_url,
      expires_at: initRes.expires_at,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to initiate Khalti payment." };
  }
}

export type KhaltiVerifyResult =
  | { ok: true; paymentStatus: string; refId: string | null }
  | { ok: false; error: string };

export async function verifyKhaltiOrderPayment(
  userId: number,
  orderId: number,
  pidx: string
): Promise<KhaltiVerifyResult> {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentStatus === "paid") return { ok: true, paymentStatus: "paid", refId: order.paymentRef };

  try {
    const lookup = await lookupKhalti(pidx);
    if (lookup.status !== "Completed") {
      return { ok: false, error: `Khalti payment status is ${lookup.status}.` };
    }

    const expectedPaisa = Math.round(order.total * 100);
    if (lookup.total_amount !== expectedPaisa) {
      return { ok: false, error: "Paid amount does not match order total." };
    }

    const refId = lookup.transaction_id || pidx;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        paymentRef: refId,
        paymentMethod: "khalti",
      },
    });

    return { ok: true, paymentStatus: "paid", refId };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Could not verify Khalti payment." };
  }
}