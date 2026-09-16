import type { ProductModel as Product } from "@/generated/prisma/models";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export function toCardData(p: Product): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    mrp: p.mrp,
    price: p.price,
    unit: p.unit,
    stock: p.stock,
    image: p.image,
    categoryIndex: p.categoryId,
  };
}