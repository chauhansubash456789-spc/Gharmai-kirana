import { Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function AddToCartButton({ id, stock }: { id: number; stock: number }) {
  const { add, items, setQty } = useCart();
  const inCart = items.find((i) => i.id === id);
  const current = inCart?.qty ?? 0;

  const outOfStock = stock <= 0;

  if (outOfStock) {
    return (
      <span className="inline-flex items-center rounded-xl bg-[#F7F4EE] border border-[#EAE5D9] px-3 py-2 text-sm font-semibold text-[#8E887E]">
        Out of Stock
      </span>
    );
  }

  if (current > 0) {
    const canAdd = current < stock;
    return (
      <div className="flex items-center rounded-xl border border-[#2C5E3B] bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setQty(id, current - 1)}
          className="p-2 hover:bg-[#EFF5F2] transition-colors"
          aria-label="Decrease"
          type="button"
        >
          <Minus className="h-4 w-4 text-[#2C5E3B]" />
        </button>
        <span className="min-w-8 text-center text-sm font-bold text-[#2C5E3B]">{current}</span>
        <button
          onClick={() => canAdd && add(id)}
          disabled={!canAdd}
          className="p-2 hover:bg-[#EFF5F2] disabled:opacity-40 transition-colors"
          aria-label="Increase"
          type="button"
        >
          <Plus className="h-4 w-4 text-[#2C5E3B]" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => add(id)}
      type="button"
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F29C1B] px-4 py-2 text-sm font-bold text-black shadow-xs hover:bg-[#D98510] transition-all"
    >
      <Plus className="h-4 w-4" /> Add
    </button>
  );
}