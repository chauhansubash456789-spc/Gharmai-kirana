import { prisma } from "../lib/prisma";

export const DEFAULT_FREE_DELIVERY_THRESHOLD = 999;
export const DEFAULT_MIN_ORDER_AMOUNT = 199;

export async function getStoreSetting(key: string, defaultValue = ""): Promise<string> {
  const row = await prisma.storeSetting.findUnique({ where: { key } });
  return row ? row.value : defaultValue;
}

export async function setStoreSetting(key: string, value: string): Promise<void> {
  await prisma.storeSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getFreeDeliveryThreshold(): Promise<number> {
  const raw = await getStoreSetting("free_delivery_threshold", "");
  if (raw && !isNaN(Number(raw))) {
    return Number(raw);
  }
  // Fallback to deliveryZone minimum or default 999
  const firstZone = await prisma.deliveryZone.findFirst({
    where: { minOrderForFree: { gt: 0 } },
    orderBy: { minOrderForFree: "asc" },
  });
  return firstZone?.minOrderForFree ?? DEFAULT_FREE_DELIVERY_THRESHOLD;
}

export async function updateFreeDeliveryThreshold(threshold: number): Promise<number> {
  const validated = Math.max(0, Math.round(threshold));
  await setStoreSetting("free_delivery_threshold", String(validated));

  // Also synchronize all delivery zones so per-zone rules match the global threshold
  await prisma.deliveryZone.updateMany({
    data: { minOrderForFree: validated },
  });

  return validated;
}

export async function getAllStoreSettings() {
  const [threshold, minOrder, storeName, phone, openHours] = await Promise.all([
    getFreeDeliveryThreshold(),
    getStoreSetting("min_order_amount", String(DEFAULT_MIN_ORDER_AMOUNT)),
    getStoreSetting("store_name", "Gharmai Kirana — Birgunj"),
    getStoreSetting("store_phone", "+977-9800000000"),
    getStoreSetting("open_hours", "6:00 AM – 9:00 PM"),
  ]);

  return {
    freeDeliveryThreshold: threshold,
    minOrderAmount: Number(minOrder) || DEFAULT_MIN_ORDER_AMOUNT,
    storeName,
    storePhone: phone,
    openHours,
  };
}
