import { prisma } from "../lib/prisma";
import { slugify } from "../lib/format";
import { productSchema, type ProductInput } from "../validations/product";

export async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base);
  let candidate = slug || `product-${Date.now()}`;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    candidate = `${slug}-${n}`;
    n++;
  }
  return candidate;
}

export async function createProduct(input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;

  const slug = await uniqueSlug(d.name);
  await prisma.product.create({
    data: {
      name: d.name,
      sku: d.sku,
      categoryId: d.categoryId,
      brand: d.brand || null,
      unit: d.unit,
      mrp: d.mrp,
      price: d.price,
      purchasePrice: d.purchasePrice,
      stock: d.stock,
      image: d.image || null,
      description: d.description || null,
      supplier: d.supplier || null,
      batch: d.batch || null,
      expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
      active: d.active ?? true,
      featured: d.featured ?? false,
      bestSeller: d.bestSeller ?? false,
      slug,
    },
  });
}

export async function updateProduct(id: number, input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "Product not found." };

  const slug =
    existing.slug !== slugify(d.name)
      ? await uniqueSlug(d.name)
      : existing.slug;

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      sku: d.sku,
      categoryId: d.categoryId,
      brand: d.brand || null,
      unit: d.unit,
      mrp: d.mrp,
      price: d.price,
      purchasePrice: d.purchasePrice,
      stock: d.stock,
      image: d.image || null,
      description: d.description || null,
      supplier: d.supplier || null,
      batch: d.batch || null,
      expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
      active: d.active ?? true,
      featured: d.featured ?? false,
      bestSeller: d.bestSeller ?? false,
      slug,
    },
  });
}

export async function deleteProduct(id: number): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.product.update({
    where: { id },
    data: { active: false, featured: false, bestSeller: false },
  });
}

export async function addStock(id: number, qty: number): Promise<void> {
  await prisma.product.update({ where: { id }, data: { stock: { increment: qty } } });
}

export async function listProductsForAdmin(search?: string) {
  return prisma.product.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }] }
      : undefined,
    include: { category: true },
    orderBy: { id: "desc" },
    take: 100,
  });
}

export async function getAllProductsForInventory() {
  return prisma.product.findMany({
    orderBy: { expiryDate: "asc" },
    take: 100,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: { category: true } });
}

export async function getProductForMetadata(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export async function getProductForAdmin(id: number) {
  return prisma.product.findUnique({ where: { id } });
}