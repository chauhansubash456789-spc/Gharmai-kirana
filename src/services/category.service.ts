import { prisma } from "../lib/prisma";
import { categorySchema, type CategoryInput } from "../validations/category";
import { slugify } from "../lib/format";

export async function listCategoriesWithProductCount() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(input: CategoryInput) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const slug = slugify(parsed.data.name) || `cat-${Date.now()}`;
  await prisma.category.create({ data: { name: parsed.data.name, slug } });
}

export async function deleteCategory(id: number): Promise<{ error?: string }> {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) return { error: "Category not found." };
  if (existing._count.products > 0) {
    return {
      error: `Cannot delete "${existing.name}" — ${existing._count.products} product(s) are assigned to it. Move or delete them first.`,
    };
  }
  await prisma.category.delete({ where: { id } });
  return {};
}