import { prisma } from "../lib/prisma";

export interface CartLine {
  id: number;
  qty: number;
}

export interface PreviewLine {
  productId: number;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  qty: number;
  lineTotal: number;
  stock: number;
  available: boolean;
  image: string | null;
  categoryIndex: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
}

export interface DeliveryAddress {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  landmark: string | null;
}

export async function getCheckoutPreview(items: CartLine[]): Promise<PreviewLine[]> {
  const ids = [...new Set(items.map((i) => i.id))];
  if (ids.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PreviewLine[] = [];
  for (const item of items) {
    const p = byId.get(item.id);
    if (!p || p.stock <= 0) {
      lines.push({
        productId: item.id,
        name: p ? p.name : "Product unavailable",
        unit: p ? p.unit : "",
        price: p ? p.price : 0,
        mrp: p ? p.mrp : 0,
        qty: 0,
        lineTotal: 0,
        stock: p ? p.stock : 0,
        available: false,
        image: p ? p.image : null,
        categoryIndex: p ? p.categoryId : 0,
      });
      continue;
    }

    const qty = Math.min(item.qty, p.stock);
    lines.push({
      productId: p.id,
      name: p.name,
      unit: p.unit,
      price: p.price,
      mrp: p.mrp,
      qty,
      lineTotal: p.price * qty,
      stock: p.stock,
      available: true,
      image: p.image,
      categoryIndex: p.categoryId,
    });
  }
  return lines;
}

export async function getOrderTotals(
  lines: PreviewLine[],
  zoneId: number,
  couponCode?: string | null,
): Promise<OrderTotals> {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  let discount = 0;
  let finalCode: string | null = null;

  if (couponCode && couponCode.trim()) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    if (
      coupon &&
      coupon.active &&
      subtotal >= coupon.minOrder &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit)
    ) {
      if (coupon.type === "percent") {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.value;
      }
      discount = Math.min(discount, subtotal);
      finalCode = coupon.code;
    }
  }

  const zone = await prisma.deliveryZone.findUnique({ where: { id: zoneId } });
  let deliveryFee = 0;
  if (zone) {
    deliveryFee = subtotal >= zone.minOrderForFree ? 0 : zone.charge;
  }

  return {
    subtotal,
    discount,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
    couponCode: finalCode,
  };
}