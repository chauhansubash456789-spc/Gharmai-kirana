"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";

export function WishlistButton({
  productId,
  initial,
}: {
  productId: number;
  initial: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const res = await toggleWishlist(productId);
          setActive(res.added);
        })
      }
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-red-500 text-red-500" : ""}`} />
      {active ? "In Wishlist" : "Save"}
    </button>
  );
}