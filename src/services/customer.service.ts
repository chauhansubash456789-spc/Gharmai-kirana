import { prisma } from "../lib/prisma";

export async function getCustomersWithTotals() {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    include: { _count: { select: { orders: true, wishlistItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  const orderTotals = await prisma.order.groupBy({
    by: ["userId"],
    _sum: { total: true },
    where: { userId: { not: null }, status: { not: "cancelled" } },
  });
  const totalsByUser = new Map(orderTotals.map((o) => [o.userId, o._sum.total ?? 0]));

  return { customers, totalsByUser };
}