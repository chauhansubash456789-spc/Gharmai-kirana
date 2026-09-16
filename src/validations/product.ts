import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.coerce.number().int().positive(),
  brand: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  mrp: z.coerce.number().positive("MRP must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  purchasePrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  image: z.string().optional(),
  description: z.string().optional(),
  supplier: z.string().optional(),
  batch: z.string().optional(),
  expiryDate: z.string().optional(),
  active: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  bestSeller: z.coerce.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;