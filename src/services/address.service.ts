import { prisma } from "../lib/prisma";
import { addressSchema } from "../validations/address";

export interface AddressInput {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export async function listAddressesForUser(userId: number) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
}

export async function addAddress(userId: number, input: AddressInput) {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  const data = parsed.data;

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const count = await prisma.address.count({ where: { userId } });
  await prisma.address.create({
    data: {
      userId,
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      addressLine: data.addressLine,
      landmark: data.landmark ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isDefault: data.isDefault || count === 0,
    },
  });
  return {};
}

export async function deleteAddress(userId: number, id: number): Promise<void> {
  await prisma.address.deleteMany({ where: { id, userId } });
}

export async function setDefaultAddress(userId: number, id: number): Promise<void> {
  const owns = await prisma.address.findFirst({ where: { id, userId } });
  if (!owns) return;
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.address.update({ where: { id }, data: { isDefault: true } });
}