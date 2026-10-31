import { z } from "zod";

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v === null || v === undefined || typeof v !== "string" || v.trim() === "" ? null : v.trim()));

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  categoryId: z.coerce.number().int().positive("Category is required"),
  brand: nullableString.optional(),
  unit: z.string().trim().min(1, "Unit is required"),
  mrp: z.coerce.number().positive("MRP must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  purchasePrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  image: nullableString.optional(),
  description: nullableString.optional(),
  supplier: nullableString.optional(),
  batch: nullableString.optional(),
  expiryDate: nullableString.optional(),
  active: z.coerce.boolean().optional().default(true),
  featured: z.coerce.boolean().optional().default(false),
  bestSeller: z.coerce.boolean().optional().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
