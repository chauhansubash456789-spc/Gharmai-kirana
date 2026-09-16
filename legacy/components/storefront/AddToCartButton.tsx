"use client";

import { Plus, Minus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export function AddToCartButton({ id, stock }: { id: number; stock: number }) {
  const { add, items, setQty } = useCart();
  const inCart = items.find((i) => i.id === id);
  const current = inCart?.qty ?? 0;

  const outOfStock = stock <= 0;

  if (outOfStock) {
    return (
      <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-400">
        Out of Stock
      </span>
    );
  }

  if (current > 0) {
    const canAdd = current < stock;
    return (
      <div className="flex items-center rounded-lg border border-emerald-600">
        <button
          onClick={() => setQty(id, current - 1)}
          className="p-2 hover:bg-emerald-50"
          aria-label="Decrease"
        >
          <Minus className="h-4 w-4 text-emerald-700" />
        </button>
        <span className="min-w-8 text-center text-sm font-bold text-emerald-800">{current}</span>
        <button
          onClick={() => canAdd && add(id)}
          disabled={!canAdd}
          className="p-2 hover:bg-emerald-50 disabled:opacity-40"
          aria-label="Increase"
        >
          <Plus className="h-4 w-4 text-emerald-700" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => add(id)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      <Plus className="h-4 w-4" /> Add
    </button>
  );
}