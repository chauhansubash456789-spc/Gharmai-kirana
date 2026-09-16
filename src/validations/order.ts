import { z } from "zod";

export const orderSchema = z.object({
  lines: z.array(z.object({ id: z.coerce.number().int().positive(), qty: z.coerce.number().int().positive() })),
  zoneId: z.coerce.number().int().positive(),
  addressId: z.string().optional(),
  recipientName: z.string().optional(),
  phone: z.string().optional(),
  addressLine: z.string().optional(),
  landmark: z.string().optional(),
  paymentMethod: z.enum(["cod", "qr", "esewa"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;