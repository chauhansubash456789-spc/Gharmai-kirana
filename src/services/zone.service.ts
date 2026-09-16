import { prisma } from "../lib/prisma";
import { zoneSchema, type ZoneInput } from "../validations/zone";

export async function listZones() {
  return prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createZone(input: ZoneInput) {
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  await prisma.deliveryZone.create({ data: parsed.data });
}

export async function updateZone(id: number, input: ZoneInput) {
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  await prisma.deliveryZone.update({ where: { id }, data: parsed.data });
}

export async function deleteZone(id: number): Promise<void> {
  await prisma.deliveryZone.delete({ where: { id } });
}