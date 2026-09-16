import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(2).transform((v) => v.toUpperCase()),
  type: z.enum(["flat", "percent"]),
  value: z.coerce.number().positive(),
  minOrder: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional(),
  expiresAt: z.string().optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
});

export type CouponInput = z.infer<typeof couponSchema>;