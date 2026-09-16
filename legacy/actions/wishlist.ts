"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { toggleWishlist as toggleWishlistService } from "@/services/wishlist.service";

export async function toggleWishlist(productId: number): Promise<{ added: boolean }> {
  const user = await requireUser();
  const result = await toggleWishlistService(user.id, productId);
  revalidatePath("/wishlist");
  return result;
}