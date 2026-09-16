import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  phone: z.string().regex(/^9\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine: z.string().min(4, "Enter full address (town, ward, tole)"),
  landmark: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  isDefault: z.coerce.boolean().optional(),
});