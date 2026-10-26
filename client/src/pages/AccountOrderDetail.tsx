import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusTimeline } from "@/components/OrderStatus";
import { BuyAgainButton } from "@/components/BuyAgainButton";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { formatNPR, placeholderImage, formatDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/constants";
import { submitEsewaForm, type EsewaFormPayload } from "@/lib/payments";
import MerchantQr from "@/components/MerchantQr";
import { useAsync } from "@/hooks/useAsync";
import { api, ApiError } from "@/api/client";
import type { Order } from "@/types";

export default function AccountOrderDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: order, error, loading } = useAsync<Order>(() => api.get(`/api/orders/${id}`), [id]);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const payWithEsewa = async () => {
    if (!order) return;
    setPaying(true);
    setPayError("");
    try {
      const res = await api.post<EsewaFormPayload>("/api/payments/esewa/initiate", { orderId: order.id });
      submitEsewaForm(res);
    } catch (err) {
      setPayError(err instanceof ApiError ? err.message : "Could not start eSewa payment.");
      setPaying(false);
    }
  };

  if (loading) return <Spinner label="Loading order..." />;
  if (error || !order) {
    return (
      <div>
        <ErrorBox message={error ?? "Order not found."} />
      </div>
    );
  }

  const items = order.items ?? [];
  const placed = new URLSearchParams(window.location.search).get("placed") === "1";

  return (
    <div>
      {/* Task 2: Confirmed vs Cancelled banner */}
      {order.status === "cancelled" ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">✕</div>
          <div>
            <p className="font-bold text-red-800">Order Cancelled</p>
            <p className="text-sm text-red-600">This order has been cancelled and will not be delivered.</p>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#C4D6CC] bg-[#EFF5F2] p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-[#2C5E3B]" />
          <div>
            <p className="font-bold text-[#2C5E3B]">Your order is confirmed</p>
            <p className="text-sm text-[#3E704D]">Placed on {formatDate(order.createdAt)}. We will deliver to your doorstep in Birgunj.</p>
          </div>
        </div>
      )}

      {/* Task 4, 5, 6: Delivery Person, Track Order, and Delete Order */}
      {order.status === "delivered" ? (
        <section className="mb-5 rounded-xl border border-[#C4D6CC] bg-[#EFF5F2] p-5 shadow-artisanal">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4D6CC] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#2C5E3B]" />
              <h2 className="font-serif text-base font-bold text-[#2C5E3B]">Delivery Partner Details</h2>
            </div>
            <span className="rounded-md bg-[#2C5E3B] px-2.5 py-0.5 text-xs font-bold text-white">Delivered</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[#222222]">
                {(order as any).deliveryPerson?.name || order.assignedTo || "Ramesh (Gharmai Express)"}
              </p>
              <p className="text-xs text-[#666159]">
                {(order as any).deliveryPerson?.vehicleType || "Delivery Rider"} · Birgunj Hub
              </p>
              <p className="mt-1 text-xs font-semibold text-[#2C5E3B]">
                Phone: {(order as any).deliveryPerson?.phone || "9800000000"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${(order as any).deliveryPerson?.phone || "9800000000"}`}
                className="rounded-lg bg-[#2C5E3B] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#234b2f] transition"
              >
                Call Rider
              </a>
              {/* Task 5: Track Order Button */}
              <button
                type="button"
                onClick={() => alert(`Tracking Order #${order.id}\nStatus: Delivered\nDelivered to: ${order.addressLine}\nRider: ${(order as any).deliveryPerson?.name || order.assignedTo || "Ramesh"}`)}
                className="rounded-lg bg-[#F29C1B] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#D98510] transition"
              >
                Track Order
              </button>
              {/* Task 6: Delete Order Button */}
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete order #${order.id} from your history?`)) {
                    try {
                      await api.del(`/api/orders/${order.id}`);
                      alert("Order deleted successfully.");
                      navigate("/account/orders");
                    } catch (err: any) {
                      alert(err?.message || "Failed to delete order.");
                    }
                  }
                }}
                className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
              >
                Delete Order
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-[#FFFDF9] p-4 text-amber-800">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold">!</div>
          <div>
            <p className="font-bold text-amber-900">Your order is not delivered</p>
            <p className="text-xs text-amber-700">Currently in progress • Status: {order.status}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#222222]">Order {order.orderNumber}</h1>
          <p className="text-sm text-[#8E887E]">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Link to="/account/orders" className="text-sm font-semibold text-[#2C5E3B] hover:text-[#D98510] transition-colors">
          ← All orders
        </Link>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-[#666159]">Order Status</h2>
            <div className="mt-4">
              <StatusTimeline status={order.status} />
            </div>
          </section>

          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#222222]">Items</h2>
              <BuyAgainButton items={items.map((i) => ({ id: i.productId ?? 0, qty: i.qty }))} />
            </div>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 text-sm">
                  <img src={placeholderImage(i.productName, order.id)} alt="" className="h-12 w-12 rounded-xl object-cover border border-[#EAE5D9]" />
                  <div className="flex-1">
                    <p className="font-medium text-[#222222]">{i.productName}</p>
                    <p className="text-xs text-[#8E887E]">{i.unit} · {i.qty} × {formatNPR(i.price)}</p>
                  </div>
                  <span className="font-semibold text-[#222222]">{formatNPR(i.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-[#EAE5D9] pt-4 text-sm">
              <div className="flex justify-between text-[#666159]"><span>Subtotal</span><span>{formatNPR(order.itemsSubtotal)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#D98510]"><span>Discount</span><span>− {formatNPR(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-[#666159]"><span>Delivery</span><span>{formatNPR(order.deliveryFee)}</span></div>
              <div className="flex justify-between text-base font-bold text-[#222222]"><span>Total</span><span className="font-bold text-[#2C5E3B]">{formatNPR(order.total)}</span></div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-[#666159]">Delivery Address</h2>
            <p className="mt-3 font-semibold text-[#222222]">{order.customerName} · {order.customerPhone}</p>
            <p className="mt-1 text-sm text-[#666159]">{order.deliveryLabel} — {order.addressLine}</p>
            {order.landmark && <p className="text-sm text-[#8E887E]">Near: {order.landmark}</p>}
            {order.deliveryZoneName && (
              <p className="mt-2 text-xs font-medium text-[#2C5E3B]">Zone: {order.deliveryZoneName}</p>
            )}
          </section>

          <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
            <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-[#666159]">Payment</h2>
            <p className="mt-3 text-sm font-semibold text-[#222222]">{PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}</p>
            {/* Task 3: Paid vs Not Paid */}
            <span className={`mt-2 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
              order.paymentStatus === "paid"
                ? "bg-[#EFF5F2] text-[#2C5E3B] border-[#C4D6CC]"
                : "bg-[#FDF4E7] text-[#B87A1E] border-[#F3DFBC]"
            }`}>
              {order.paymentStatus === "paid" ? "✓ Your order is paid" : "✕ Your order is not paid"}
            </span>

            {order.deliveryOtp && order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="mt-3 rounded-xl border border-[#C4D6CC] bg-[#EFF5F2] p-3 text-center">
                <p className="text-xs font-medium text-[#2C5E3B]">Share this code with your rider on delivery</p>
                <p className="mt-1 text-2xl font-extrabold tracking-[0.4em] text-[#2C5E3B]">{order.deliveryOtp}</p>
              </div>
            )}
            {order.paymentMethod === "esewa" && order.paymentStatus !== "paid" && order.status !== "cancelled" && (
              <>
                <button
                  type="button"
                  disabled={paying}
                  onClick={payWithEsewa}
                  className="mt-3 w-full rounded-xl bg-[#F29C1B] py-2.5 text-sm font-bold text-black shadow-sm hover:bg-[#D98510] transition-colors disabled:opacity-60"
                >
                  {paying ? "Redirecting to eSewa..." : "Proceed to Pay with eSewa"}
                </button>
                {payError && <p className="mt-2 text-xs font-medium text-red-600">{payError}</p>}
              </>
            )}
            {(order.paymentMethod === "qr" || order.paymentMethod === "khalti") && order.paymentStatus !== "paid" && order.status !== "cancelled" && (
              <div className="mt-3">
                <MerchantQr amount={order.total} />
              </div>
            )}
            {order.assignedTo && <p className="mt-2 text-xs text-[#8E887E]">Delivering via: {order.assignedTo}</p>}
          </section>

          {order.notes && (
            <section className="rounded-xl border border-[#EAE5D9] bg-white p-5 shadow-artisanal">
              <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-[#666159]">Notes</h2>
              <p className="mt-2 text-sm text-[#666159]">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
