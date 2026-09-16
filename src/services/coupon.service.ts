import { prisma } from "../lib/prisma";
import { couponSchema, type CouponInput } from "../validations/coupon";

export async function listCoupons() {
  return prisma.coupon.findMany({ orderBy: { id: "desc" } });
}

export async function createCoupon(input: CouponInput) {
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: `Coupon ${parsed.data.code} already exists.` };

  await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrder: parsed.data.minOrder,
      maxDiscount: parsed.data.maxDiscount ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      usageLimit: parsed.data.usageLimit || null,
    },
  });
}

export async function toggleCoupon(id: number, active: boolean): Promise<void> {
  await prisma.coupon.update({ where: { id }, data: { active } });
}