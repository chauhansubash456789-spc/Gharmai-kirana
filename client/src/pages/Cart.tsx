import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api } from "@/api/client";
import { formatNPR, placeholderImage } from "@/lib/format";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import type { PreviewLine } from "@/types";

export default function Cart() {
  const { items, setQty, remove } = useCart();
  const { freeDeliveryThreshold } = useStoreConfig();
  const [lines, setLines] = useState<PreviewLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (items.length === 0) {
      setLines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .post<PreviewLine[]>("/api/checkout/preview", { items })
      .then((data) => {
        if (active) setLines(data);
      })
      .catch(() => {
        if (active) setLines([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [items]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-[#8E887E]">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF5F2] border border-[#C4D6CC]">
          <ShoppingCart className="h-8 w-8 text-[#2C5E3B]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold font-serif text-[#222222]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[#666159]">Add groceries and they will show up here.</p>
        <Link
          to="/search"
          className="mt-6 inline-block rounded-xl bg-[#F29C1B] px-6 py-3 font-bold text-black shadow-sm hover:bg-[#D98510] transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const hasUnavailable = lines.some((l) => !l.available);
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / (freeDeliveryThreshold || 1)) * 100));
  const neededForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold font-serif text-[#222222] tracking-tight">Shopping Cart</h1>

      {/* Dynamic Free Delivery Progress Milestone */}
      <div className="mt-4 rounded-xl border border-[#C4D6CC] bg-[#EFF5F2] p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold sm:text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#2C5E3B]" />
            <span className={isFreeDelivery ? "font-bold text-[#2C5E3B]" : "text-[#222222]"}>
              {isFreeDelivery
                ? "🎉 Congratulations! You have unlocked FREE delivery in Birgunj!"
                : `Add ${formatNPR(neededForFree)} more to get FREE delivery in Birgunj`}
            </span>
          </div>
          <span className="font-extrabold text-[#2C5E3B]">
            {formatNPR(subtotal)} / {formatNPR(freeDeliveryThreshold)}
          </span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-md bg-[#D8E6DF]">
          <div
            className="h-full bg-[#2C5E3B] transition-all duration-300 rounded-md"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {hasUnavailable && lines.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#FCE4B8] bg-[#FEF7EC] px-4 py-3 text-sm text-[#D98510] font-medium">
          Some items are no longer available or over their stock limit. Adjust quantities before checkout.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {lines.map((l) => (
            <div
              key={l.productId}
              className={`flex gap-4 rounded-xl border bg-white p-3.5 shadow-artisanal ${l.available ? "border-[#EAE5D9]" : "border-[#FCE4B8]"}`}
            >
              <img
                src={l.image || placeholderImage(l.name, l.categoryIndex)}
                alt={l.name}
                className="h-20 w-20 rounded-lg object-cover bg-[#F7F4EE]"
              />
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-[#222222] font-serif">{l.name}</p>
                <p className="text-xs text-[#666159] mt-0.5">{l.unit}</p>
                {!l.available && <p className="text-xs font-semibold text-[#D98510] mt-1">Currently unavailable</p>}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-xl border border-[#2C5E3B] bg-white overflow-hidden shadow-xs">
                    <button onClick={() => setQty(l.productId, l.qty - 1)} type="button" className="p-1.5 hover:bg-[#EFF5F2] text-[#2C5E3B]" aria-label="Decrease">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold text-[#2C5E3B]">{l.qty}</span>
                    <button
                      onClick={() => setQty(l.productId, l.qty + 1)}
                      disabled={l.qty >= l.stock}
                      type="button"
                      className="p-1.5 hover:bg-[#EFF5F2] disabled:opacity-40 text-[#2C5E3B]"
                      aria-label="Increase"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-base font-bold text-[#2C5E3B]">{formatNPR(l.lineTotal)}</span>
                </div>
              </div>
              <button onClick={() => remove(l.productId)} type="button" className="self-start p-1 text-[#8E887E] hover:text-[#D98510] transition-colors" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-[#EAE5D9] bg-white p-6 shadow-artisanal lg:sticky lg:top-24">
          <h2 className="text-lg font-bold font-serif text-[#222222]">Order Summary</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#666159]">Subtotal</span>
              <span className="font-bold text-[#222222]">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666159]">Delivery</span>
              <span className="font-medium text-[#2C5E3B]">Calculated at checkout</span>
            </div>
          </div>
          <Link
            to="/checkout"
            aria-disabled={hasUnavailable}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F29C1B] py-3 font-bold text-black shadow-xs hover:bg-[#D98510] transition-all ${
              hasUnavailable ? "pointer-events-none bg-[#EAE5D9] text-[#8E887E] shadow-none" : ""
            }`}
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/search" className="mt-3 block text-center text-sm font-semibold text-[#D98510] hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
