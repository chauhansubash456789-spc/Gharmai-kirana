import { prisma } from "../lib/prisma";

export async function toggleWishlist(userId: number, productId: number): Promise<{ added: boolean }> {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { added: false };
  }
  await prisma.wishlistItem.create({ data: { userId, productId } });
  return { added: true };
}

export async function isProductInWishlist(userId: number, productId: number): Promise<boolean> {
  const found = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return found != null;
}

export async function getWishlistProducts(userId: number) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: "desc" },
  });
  return items.map((i) => i.product).filter((p) => p.active);
}