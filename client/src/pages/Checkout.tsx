import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Ticket } from "lucide-react";
import type { FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import { api, ApiError } from "@/api/client";
import { formatNPR, placeholderImage } from "@/lib/format";
import { submitEsewaForm, type EsewaFormPayload } from "@/lib/payments";
import MerchantQr from "@/components/MerchantQr";
import { LocationPicker } from "@/components/LocationPicker";
import type { DeliveryZone, Address, PreviewLine, OrderTotals } from "@/types";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clear } = useCart();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [lines, setLines] = useState<PreviewLine[]>([]);
  const [loading, setLoading] = useState(true);

  const [zoneId, setZoneId] = useState<number>(0);
  const [addressId, setAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    tole: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const handleAddressChange = (address: {
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
    tole?: string;
    landmark?: string;
    formattedAddress?: string;
  }) => {
    const parts: string[] = [];
    if (address.tole) parts.push(address.tole);
    if (address.ward) parts.push(`Ward ${address.ward}`);
    if (address.municipality) parts.push(address.municipality);
    if (address.district) parts.push(address.district);
    if (address.province) parts.push(address.province);
    const fullAddress = parts.join(", ");

    setNewAddress((prev) => ({
      ...prev,
      addressLine: fullAddress || prev.addressLine,
      landmark: address.landmark || prev.landmark,
      province: address.province || prev.province,
      district: address.district || prev.district,
      municipality: address.municipality || prev.municipality,
      ward: address.ward || prev.ward,
      tole: address.tole || prev.tole,
    }));
  };
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "qr" | "esewa">("cod");
  const [couponInput, setCouponInput] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [couponError, setCouponError] = useState(false);

  const [totals, setTotals] = useState<OrderTotals>({ subtotal: 0, discount: 0, deliveryFee: 0, total: 0, couponCode: null });

  useEffect(() => {
    let active = true;
    Promise.all([api.get<DeliveryZone[]>("/api/zones"), api.get<Address[]>("/api/addresses")])
      .then(([z, a]) => {
        if (!active) return;
        setZones(z);
        setAddresses(a);
        setZoneId((prev) => prev || z[0]?.id || 0);
        const def = a.find((ad) => ad.isDefault) ?? a[0];
        setAddressId(def ? String(def.id) : "");
        setShowNewAddress(a.length === 0);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
        if (!active) return;
        setLines(data);
        void updateTotals(data, zoneId, null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const updateTotals = async (l: PreviewLine[], z: number, c: string | null) => {
    try {
      const t = await api.post<OrderTotals>("/api/checkout/totals", {
        lines: l,
        zoneId: z,
        couponCode: c ?? undefined,
      });
      setTotals(t);
      if (c) setCouponError(false);
    } catch {
      /* keep previous totals */
    }
  };

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return;
    api
      .post<OrderTotals>("/api/checkout/totals", {
        lines,
        zoneId,
        couponCode: code,
      })
      .then((t) => {
        setTotals(t);
        setCouponError(!t.couponCode);
      })
      .catch(() => {
        setCouponError(true);
      });
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-gray-500">Loading checkout...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500">Your cart is empty. Add some groceries first.</p>
          <Link to="/search" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const availableLines = lines.filter((l) => l.available);
  const hasUnavailable = lines.some((l) => !l.available);

  const selectedZone = zones.find((z) => z.id === zoneId);

  const validForNewAddress =
    newAddress.recipientName.trim().length >= 2 &&
    /^9\d{9}$/.test(newAddress.phone.trim()) &&
    newAddress.addressLine.trim().length >= 4;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post<{ ok: boolean; orderId?: number; error?: string; esewa?: EsewaFormPayload }>("/api/checkout", {
        lines: items.map((i) => ({ id: i.id, qty: i.qty })),
        zoneId,
        addressId: showNewAddress || !addressId ? undefined : addressId,
        recipientName: showNewAddress ? newAddress.recipientName : undefined,
        phone: showNewAddress ? newAddress.phone : undefined,
        addressLine: showNewAddress ? newAddress.addressLine : undefined,
        landmark: showNewAddress ? newAddress.landmark : undefined,
        latitude: showNewAddress ? newAddress.latitude : undefined,
        longitude: showNewAddress ? newAddress.longitude : undefined,
        paymentMethod,
        couponCode: totals.couponCode ?? undefined,
        notes: notes.trim() || undefined,
      });
      if (res.ok && res.orderId) {
        if (paymentMethod === "esewa" && res.esewa) {
          submitEsewaForm(res.esewa);
          return;
        }
        clear();
        navigate(`/account/orders/${res.orderId}?placed=1`);
        return;
      }
      setError(res.error || "Could not place order.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold font-serif text-[#222222] tracking-tight">Checkout</h1>

      {hasUnavailable && (
        <div className="mb-5 rounded-xl border border-[#FCE4B8] bg-[#FEF7EC] px-4 py-3 text-sm text-[#D98510] font-medium">
          Some items in your cart are unavailable. Remove or adjust them before placing your order.
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="text-base font-bold font-serif text-[#222222]">1. Delivery Address</h2>
            {addresses.length > 0 && !showNewAddress && (
              <div className="mt-4 space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors ${addressId === String(a.id) ? "border-[#F29C1B] bg-[#FEF7EC]" : "border-[#EAE5D9] hover:bg-[#FDFBF7]"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={a.id}
                      checked={addressId === String(a.id)}
                      onChange={() => setAddressId(String(a.id))}
                      className="mt-1 accent-[#F29C1B]"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-[#222222]">
                        {a.label} — {a.recipientName} ({a.phone})
                      </p>
                      <p className="text-[#666159]">{a.addressLine}{a.landmark ? `, near ${a.landmark}` : ""}</p>
                    </div>
                  </label>
                ))}
                <button type="button" onClick={() => setShowNewAddress(true)} className="text-sm font-semibold text-[#D98510] hover:underline">
                  + Add a new address
                </button>
              </div>
            )}

            {showNewAddress && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-[#666159]">Recipient name</label>
                  <input
                    value={newAddress.recipientName}
                    onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3 py-2 text-sm text-[#222222] focus:border-[#F29C1B] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666159]">Phone</label>
                  <input
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3 py-2 text-sm text-[#222222] focus:border-[#F29C1B] outline-none"
                  />
                </div>
                <LocationPicker
                  latitude={newAddress.latitude}
                  longitude={newAddress.longitude}
                  onLocationChange={(lat, lng) => setNewAddress({ ...newAddress, latitude: lat, longitude: lng })}
                  onAddressChange={handleAddressChange}
                />
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-[#666159]">Full address (Tole, Ward, Landmark)</label>
                  <input
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3 py-2 text-sm text-[#222222] focus:border-[#F29C1B] outline-none"
                  />
                  <input
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    placeholder="Nearby landmark (optional)"
                    className="mt-2 w-full rounded-xl border border-[#EAE5D9] px-3 py-2 text-sm text-[#222222] focus:border-[#F29C1B] outline-none"
                  />
                </div>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddress(false);
                      setAddressId((a) => a || String(addresses[0].id));
                    }}
                    className="text-sm text-[#666159] hover:underline sm:col-span-2"
                  >
                    Cancel — use saved address
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="text-base font-bold font-serif text-[#222222]">2. Delivery Zone</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {zones.map((z) => (
                <label
                  key={z.id}
                  className={`cursor-pointer rounded-xl border p-3.5 text-sm transition-colors ${zoneId === z.id ? "border-[#2C5E3B] bg-[#EFF5F2]" : "border-[#EAE5D9] hover:bg-[#FDFBF7]"}`}
                >
                  <input
                    type="radio"
                    name="zone"
                    value={z.id}
                    checked={zoneId === z.id}
                    onChange={() => {
                      setZoneId(z.id);
                      void updateTotals(lines, z.id, totals.couponCode);
                    }}
                    className="mr-1 accent-[#2C5E3B]"
                  />
                  <span className="font-semibold text-[#222222]">{z.name}</span>
                  <p className="mt-1 text-xs text-[#666159]">
                    {z.charge === 0 ? "Free delivery" : `Delivery Rs. ${z.charge}`}
                    {z.minOrderForFree > 0 && ` — free above ${formatNPR(z.minOrderForFree)}`}
                  </p>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="text-base font-bold font-serif text-[#222222]">3. Payment Method</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { id: "cod" as const, name: "Cash on Delivery", desc: "Pay cash when your order arrives" },
                { id: "esewa" as const, name: "eSewa", desc: "Pay securely online with your eSewa wallet" },
                { id: "qr" as const, name: "QR / Khalti", desc: "Pay online before or on delivery" },
              ].map((p) => (
                <label
                  key={p.id}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${paymentMethod === p.id ? "border-[#F29C1B] bg-[#FEF7EC]" : "border-[#EAE5D9] hover:bg-[#FDFBF7]"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={p.id}
                    checked={paymentMethod === p.id}
                    onChange={() => setPaymentMethod(p.id)}
                    className="mr-1 accent-[#F29C1B]"
                  />
                  <span className="text-sm font-semibold text-[#222222]">{p.name}</span>
                  <p className="mt-0.5 text-xs text-[#666159]">{p.desc}</p>
                </label>
              ))}
            </div>
          </section>

          {paymentMethod === "qr" && (
            <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
              <h2 className="text-base font-bold font-serif text-[#222222]">Scan to pay</h2>
              <div className="mt-3">
                <MerchantQr amount={totals.total} />
              </div>
            </section>
          )}

          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="text-base font-bold font-serif text-[#222222]">4. Coupon &amp; Notes</h2>
            <div className="mt-3 flex gap-2">
              <div className="flex flex-1 items-center rounded-xl border border-[#EAE5D9] px-3 bg-white">
                <Ticket className="h-4 w-4 text-[#8E887E]" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code (e.g. WELCOME100)"
                  className="w-full px-2 py-2.5 text-sm outline-none text-[#222222] placeholder:text-[#8E887E]"
                />
              </div>
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-xl bg-[#2C5E3B] px-5 text-sm font-semibold text-white hover:bg-[#1D4028] shadow-xs transition-colors"
              >
                Apply
              </button>
            </div>
            {totals.couponCode && (
              <p className="mt-2 text-xs font-semibold text-[#2C5E3B]">
                Coupon {totals.couponCode} applied — you saved {formatNPR(totals.discount)}
              </p>
            )}
            {couponError && !totals.couponCode && couponInput && (
              <p className="mt-2 text-xs text-red-500">Coupon not valid for this order.</p>
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Order notes (optional)"
              rows={2}
              className="mt-3 w-full rounded-xl border border-[#EAE5D9] px-3 py-2 text-sm text-[#222222] focus:border-[#F29C1B] outline-none"
            />
          </section>
        </div>

        <div className="h-fit rounded-xl border border-[#EAE5D9] bg-white p-6 shadow-artisanal lg:sticky lg:top-36">
          <h2 className="text-lg font-bold font-serif text-[#222222]">Order Summary</h2>
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {lines.map((l) => (
              <div key={l.productId} className="flex items-center gap-2 text-sm">
                <img src={l.image || placeholderImage(l.name, l.categoryIndex)} alt="" className="h-10 w-10 rounded-lg object-cover bg-[#F7F4EE]" />
                <div className="flex-1">
                  <p className={`line-clamp-1 font-medium ${l.available ? "text-[#222222]" : "text-red-500 line-through"}`}>{l.name}</p>
                  <p className="text-xs text-[#666159]">x{l.qty} · {formatNPR(l.price)}</p>
                </div>
                <span className="font-bold text-[#222222]">{formatNPR(l.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 border-t border-[#EAE5D9] pt-4 text-sm">
            <div className="flex justify-between text-[#666159]">
              <span>Subtotal</span>
              <span className="font-bold text-[#222222]">{formatNPR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#666159]">
              <span>Delivery</span>
              <span className="font-medium text-[#222222]">
                {totals.deliveryFee === 0 ? <span className="text-[#2C5E3B] font-semibold">FREE</span> : formatNPR(totals.deliveryFee)}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-[#2C5E3B]">
                <span>Discount</span>
                <span className="font-bold">− {formatNPR(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#EAE5D9] pt-3 text-base font-bold text-[#222222]">
              <span>Total</span>
              <span className="text-xl text-[#2C5E3B] font-extrabold">{formatNPR(totals.total)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-[#FEF7EC] border border-[#FCE4B8] px-3 py-2 text-sm font-medium text-[#D98510]">{error}</div>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              hasUnavailable ||
              !selectedZone ||
              (!addressId && !showNewAddress && addresses.length > 0) ||
              (showNewAddress && !validForNewAddress)
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F29C1B] py-3.5 font-bold text-black shadow-xs hover:bg-[#D98510] transition-all disabled:bg-[#EAE5D9] disabled:text-[#8E887E] disabled:shadow-none"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order...</> : paymentMethod === "esewa" ? `Pay with eSewa · ${formatNPR(totals.total)}` : `Place Order · ${formatNPR(totals.total)}`}
          </button>
          <p className="mt-2.5 text-center text-xs text-[#8E887E]">
            By placing this order you agree to our delivery terms for Birgunj.
          </p>
        </div>
      </form>
    </div>
  );
}
