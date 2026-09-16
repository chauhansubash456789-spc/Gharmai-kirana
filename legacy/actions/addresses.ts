"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  addAddress as addAddressService,
  deleteAddress as deleteAddressService,
  setDefaultAddress as setDefaultAddressService,
} from "@/services/address.service";

export async function addAddress(formData: FormData): Promise<void> {
  const user = await requireUser();
  await addAddressService(user.id, formData);
  revalidatePath("/account");
}

export async function deleteAddress(id: number): Promise<void> {
  const user = await requireUser();
  await deleteAddressService(user.id, id);
  revalidatePath("/account");
}

export async function setDefaultAddress(id: number): Promise<void> {
  const user = await requireUser();
  await setDefaultAddressService(user.id, id);
  revalidatePath("/account");
}