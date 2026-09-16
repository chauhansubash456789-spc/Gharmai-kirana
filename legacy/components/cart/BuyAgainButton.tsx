"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export function BuyAgainButton({ items }: { items: { id: number; qty: number }[] }) {
  const { add, clear } = useCart();
  const router = useRouter();

  const valid = items.filter((i) => i.id > 0);
  if (valid.length === 0) return null;

  return (
    <button
      onClick={() => {
        clear();
        valid.forEach((i) => add(i.id, i.qty));
        router.push("/cart");
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
    >
      <RefreshCw className="h-3.5 w-3.5" /> Buy All Again
    </button>
  );
}