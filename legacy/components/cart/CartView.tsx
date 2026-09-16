"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { getCheckoutPreview, type PreviewLine } from "@/actions/checkout";
import { formatNPR, placeholderImage } from "@/lib/format";

export function CartView() {
  const { items, setQty, remove } = useCart();
  const [lines, setLines] = useState<PreviewLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCheckoutPreview(items).then((data) => {
      setLines(data);
      setLoading(false);
    });
  }, [items]);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-500">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-14 w-14 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Add groceries and they will show up here.</p>
        <Link
          href="/search"
          className="mt-6 inline-block rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {lines.map((l) => (
            <div key={l.productId} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3">
              <img
                src={l.image || placeholderImage(l.name, l.categoryIndex)}
                alt={l.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="flex flex-1 flex-col">
                <Link href="#" className="text-sm font-semibold text-gray-800">{l.name}</Link>
                <p className="text-xs text-gray-400">{l.unit}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-emerald-600">
                    <button onClick={() => setQty(l.productId, l.qty - 1)} className="p-1.5 hover:bg-emerald-50">
                      <Minus className="h-4 w-4 text-emerald-700" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold">{l.qty}</span>
                    <button
                      onClick={() => setQty(l.productId, l.qty + 1)}
                      disabled={l.qty >= l.stock}
                      className="p-1.5 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4 text-emerald-700" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">{formatNPR(l.lineTotal)}</span>
                </div>
              </div>
              <button onClick={() => remove(l.productId)} className="self-start p-1 text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="text-emerald-600 font-medium">Calculated at checkout</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/search" className="mt-2 block text-center text-sm text-emerald-700 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}