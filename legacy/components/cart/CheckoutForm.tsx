"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Ticket } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import {
  getCheckoutPreview,
  getOrderTotals,
  placeOrder,
  type PreviewLine,
} from "@/actions/checkout";
import { formatNPR, placeholderImage } from "@/lib/format";

interface ZoneOption {
  id: number;
  name: string;
  charge: number;
  minOrderForFree: number;
}

interface AddressOption {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  landmark: string | null;
  isDefault: boolean;
}

export function CheckoutForm({
  zones,
  addresses,
}: {
  zones: ZoneOption[];
  addresses: AddressOption[];
}) {
  const router = useRouter();
  const { items, clear } = useCart();

  const [lines, setLines] = useState<PreviewLine[]>([]);
  const [loading, setLoading] = useState(true);

  const [zoneId, setZoneId] = useState<number>(zones[0]?.id ?? 0);
  const [addressId, setAddressId] = useState<string>(addresses.find((a) => a.isDefault)?.id?.toString() ?? addresses[0]?.id?.toString() ?? "");
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({ recipientName: "", phone: "", addressLine: "", landmark: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr">("cod");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, deliveryFee: 0, total: 0 });

  const updateTotals = async (
    l: PreviewLine[],
    z: number,
    c: string | null,
  ) => {
    const t = await getOrderTotals(l, z, c ?? undefined);
    setTotals(t);
    setAppliedCoupon(t.couponCode);
  };

  useEffect(() => {
    getCheckoutPreview(items).then(async (data) => {
      setLines(data);
      setLoading(false);
      await updateTotals(data, zoneId, appliedCoupon);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    await updateTotals(lines, zoneId, couponInput);
  };

  const selectedZone = zones.find((z) => z.id === zoneId);

  const validForNewAddress =
    newAddress.recipientName.trim().length >= 2 &&
    /^9\d{9}$/.test(newAddress.phone.trim()) &&
    newAddress.addressLine.trim().length >= 4;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await placeOrder({
        lines: items.map((i) => ({ id: i.id, qty: i.qty })),
        zoneId,
        addressId,
        recipientName: showNewAddress ? newAddress.recipientName : undefined,
        phone: showNewAddress ? newAddress.phone : undefined,
        addressLine: showNewAddress ? newAddress.addressLine : undefined,
        landmark: showNewAddress ? newAddress.landmark : undefined,
        paymentMethod,
        couponCode: (appliedCoupon ?? "") || undefined,
        notes: notes.trim() || undefined,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      if ("orderId" in res && res.orderId) {
        clear();
        router.push(`/account/orders/${res.orderId}?placed=1`);
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Loading checkout...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-gray-500">Your cart is empty. Add some groceries first.</p>
        <Link href="/search" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  const subtotalOnly = totals.subtotal;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Address */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">1. Delivery Address</h2>
          {addresses.length > 0 && !showNewAddress && (
            <div className="mt-4 space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${addressId === String(a.id) ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={a.id}
                    checked={addressId === String(a.id)}
                    onChange={() => setAddressId(String(a.id))}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">
                      {a.label} — {a.recipientName} ({a.phone})
                    </p>
                    <p className="text-gray-500">{a.addressLine}{a.landmark ? `, near ${a.landmark}` : ""}</p>
                  </div>
                </label>
              ))}
              <button type="button" onClick={() => setShowNewAddress(true)} className="text-sm font-semibold text-emerald-700 hover:underline">
                + Add a new address
              </button>
            </div>
          )}

          {showNewAddress && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600">Recipient name</label>
                <input
                  value={newAddress.recipientName}
                  onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Phone</label>
                <input
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Full address (Tole, Ward, Landmark)</label>
                <input
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  value={newAddress.landmark}
                  onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  placeholder="Nearby landmark (optional)"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              {addresses.length > 0 && (
                <button type="button" onClick={() => { setShowNewAddress(false); setAddressId(addresses[0].id.toString()); }} className="text-sm text-gray-500 hover:underline sm:col-span-2">
                  Cancel — use saved address
                </button>
              )}
            </div>
          )}
        </section>

        {/* Zone */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">2. Delivery Zone</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {zones.map((z) => (
              <label
                key={z.id}
                className={`cursor-pointer rounded-lg border p-3 text-sm ${zoneId === z.id ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="zone"
                  value={z.id}
                  checked={zoneId === z.id}
                  onChange={() => { setZoneId(z.id); updateTotals(lines, z.id, appliedCoupon); }}
                  className="mr-1"
                />
                <span className="font-semibold text-gray-800">{z.name}</span>
                <p className="mt-1 text-xs text-gray-500">
                  {z.charge === 0 ? "Free delivery" : `Delivery Rs. ${z.charge}`}
                  {z.minOrderForFree > 0 && ` — free above ${formatNPR(z.minOrderForFree)}`}
                </p>
              </label>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">3. Payment Method</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { id: "cod" as const, name: "Cash on Delivery", desc: "Pay cash when your order arrives" },
              { id: "qr" as const, name: "QR / eSewa / Khalti", desc: "Pay online before or on delivery" },
            ].map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-lg border p-3 ${paymentMethod === p.id ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={p.id}
                  checked={paymentMethod === p.id}
                  onChange={() => setPaymentMethod(p.id)}
                  className="mr-1"
                />
                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                <p className="mt-0.5 text-xs text-gray-500">{p.desc}</p>
              </label>
            ))}
          </div>
        </section>

        {/* Coupon + notes */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">4. Coupon &amp; Notes</h2>
          <div className="mt-3 flex gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-gray-300 px-3">
              <Ticket className="h-4 w-4 text-gray-400" />
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Coupon code (e.g. WELCOME100)"
                className="w-full px-2 py-2.5 text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={applyCoupon}
              className="rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
          {appliedCoupon && (
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              Coupon {appliedCoupon} applied — you saved {formatNPR(totals.discount)}
            </p>
          )}
          {appliedCoupon === null && couponInput && totals.discount === 0 && (
            <p className="mt-2 text-xs text-red-500">Coupon not valid for this order.</p>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)"
            rows={2}
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </section>
      </div>

      {/* Summary */}
      <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-36">
        <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {lines.map((l) => (
            <div key={l.productId} className="flex items-center gap-2 text-sm">
              <img src={l.image || placeholderImage(l.name, l.categoryIndex)} alt="" className="h-10 w-10 rounded object-cover" />
              <div className="flex-1">
                <p className="line-clamp-1 text-gray-700">{l.name}</p>
                <p className="text-xs text-gray-400">x{l.qty} · {formatNPR(l.price)}</p>
              </div>
              <span className="font-semibold">{formatNPR(l.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">{formatNPR(subtotalOnly)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span className="font-medium text-gray-900">
              {totals.deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatNPR(totals.deliveryFee)}
            </span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-medium">− {formatNPR(totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="text-emerald-700">{formatNPR(totals.total)}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            !selectedZone ||
            (!addressId && !validForNewAddress)
          }
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-300"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order...</> : `Place Order · ${formatNPR(totals.total)}`}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          By placing this order you agree to our delivery terms for Birgunj.
        </p>
      </div>
    </form>
  );
}