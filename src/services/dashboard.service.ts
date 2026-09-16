import { prisma } from "../lib/prisma";

export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const older = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    todayOrders,
    pendingOrders,
    deliveredOrders,
    totalOrders,
    totalCustomers,
    products,
    orderRows,
    salesToday,
    lowStock,
    expiringSoon,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, stock: true, name: true, purchasePrice: true, price: true },
    }),
    prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { total: true, itemsSubtotal: true, discountAmount: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, status: { not: "cancelled" } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 }, active: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.product.findMany({
      where: { expiryDate: { lte: older, gt: today } },
      orderBy: { expiryDate: "asc" },
      take: 10,
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { qty: true, subtotal: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const revenue = orderRows.reduce((s, o) => s + o.total, 0);
  const grossProfit = orderRows.reduce((s, o) => s + o.itemsSubtotal - o.discountAmount, 0);
  const valueAtCost = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const valueAtSell = products.reduce((s, p) => s + p.stock * p.price, 0);

  return {
    cards: [
      { label: "Today's Sales", value: salesToday._sum.total ?? 0, color: "bg-emerald-600" },
      { label: "Today's Orders", value: todayOrders, color: "bg-sky-600" },
      { label: "Pending Orders", value: pendingOrders, color: "bg-amber-500" },
      { label: "Delivered Orders", value: deliveredOrders, color: "bg-violet-600" },
      { label: "Total Customers", value: totalCustomers, color: "bg-teal-600" },
      { label: "Total Orders", value: totalOrders, color: "bg-gray-700" },
    ],
    financial: {
      revenue,
      grossProfit,
      valueAtCost,
      valueAtSell,
    },
    topProducts,
    lowStock,
    expiringSoon,
    recentOrders,
  };
}