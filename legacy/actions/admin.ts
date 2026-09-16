"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  addStock as addStockService,
} from "@/services/product.service";
import {
  updateOrderStatus as updateOrderStatusService,
} from "@/services/order.service";
import {
  createCoupon as createCouponService,
  toggleCoupon as toggleCouponService,
} from "@/services/coupon.service";
import {
  createZone as createZoneService,
  updateZone as updateZoneService,
  deleteZone as deleteZoneService,
} from "@/services/zone.service";
import {
  createCategory as createCategoryService,
  deleteCategory as deleteCategoryService,
} from "@/services/category.service";
import type { ProductInput } from "@/validations/product";
import type { CouponInput } from "@/validations/coupon";
import type { ZoneInput } from "@/validations/zone";
import type { CategoryInput } from "@/validations/category";

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  const result = await createProductService(input);
  if (result && "error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

export async function updateProduct(id: number, input: ProductInput) {
  await requireAdmin();
  const result = await updateProductService(id, input);
  if (result && "error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

export async function deleteProduct(id: number): Promise<void> {
  await requireAdmin();
  await deleteProductService(id);
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

export async function addStock(id: number, qty: number): Promise<void> {
  await requireAdmin();
  await addStockService(id, qty);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

export async function updateOrderStatus(
  id: number,
  status: string,
  paymentStatus: string,
  assignedTo?: string,
): Promise<void> {
  await requireAdmin();
  await updateOrderStatusService(id, status, paymentStatus, assignedTo);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/[id]");
  revalidatePath("/account/orders");
}

export async function createCoupon(input: CouponInput) {
  await requireAdmin();
  const result = await createCouponService(input);
  if (result && "error" in result) return result;
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(id: number, active: boolean): Promise<void> {
  await requireAdmin();
  await toggleCouponService(id, active);
  revalidatePath("/admin/coupons");
}

export async function createZone(input: ZoneInput) {
  await requireAdmin();
  const result = await createZoneService(input);
  if (result && "error" in result) return result;
  revalidatePath("/admin/zones");
}

export async function updateZone(id: number, input: ZoneInput) {
  await requireAdmin();
  const result = await updateZoneService(id, input);
  if (result && "error" in result) return result;
  revalidatePath("/admin/zones");
}

export async function deleteZone(id: number): Promise<void> {
  await requireAdmin();
  await deleteZoneService(id);
  revalidatePath("/admin/zones");
}

export async function createCategory(input: CategoryInput) {
  await requireAdmin();
  const result = await createCategoryService(input);
  if (result && "error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: number): Promise<{ error?: string }> {
  await requireAdmin();
  const result = await deleteCategoryService(id);
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return result;
}