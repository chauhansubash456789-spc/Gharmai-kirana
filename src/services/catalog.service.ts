import { prisma } from "../lib/prisma";

export async function getHomeSections() {
  const [categories, deals, bestSellers, combos] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { id: "asc" } }),
    prisma.product.findMany({
      where: { active: true, stock: { gt: 0 }, mrp: { gt: prisma.product.fields.price } },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany({
      where: { active: true, bestSeller: true, stock: { gt: 0 } },
      take: 10,
    }),
    prisma.product.findMany({
      where: { active: true, featured: true, stock: { gt: 0 } },
      take: 8,
    }),
  ]);

  return { categories, deals, bestSellers, combos };
}

export async function searchProducts(search: string, dealsOnly: boolean, limit = 48) {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(dealsOnly ? { mrp: { gt: prisma.product.fields.price } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { brand: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function getCategoryWithProducts(slug: string) {
  const [category, products] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    prisma.product.findMany({
      where: { category: { slug }, active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { category, products };
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getFooterCategories(limit = 8) {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
    take: limit,
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}