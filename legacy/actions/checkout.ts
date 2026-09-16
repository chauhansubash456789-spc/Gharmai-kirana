"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  getCheckoutPreview as getCheckoutPreviewService,
  getOrderTotals as getOrderTotalsService,
  type CartLine,
  type PreviewLine,
  type OrderTotals,
} from "@/services/checkout.service";
import {
  placeOrder as placeOrderService,
  type PlaceOrderInput,
  type PlaceOrderResult,
} from "@/services/order.service";

export type { CartLine, PreviewLine };
export type { PlaceOrderInput, PlaceOrderResult };

export async function getCheckoutPreview(items: CartLine[]): Promise<PreviewLine[]> {
  return getCheckoutPreviewService(items);
}

export async function getOrderTotals(
  lines: PreviewLine[],
  zoneId: number,
  couponCode?: string | null,
): Promise<OrderTotals> {
  return getOrderTotalsService(lines, zoneId, couponCode);
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const user = await requireUser();
  const result = await placeOrderService(user.id, input);
  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
  }
  return result;
}