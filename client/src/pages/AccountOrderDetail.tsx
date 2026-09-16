import { Link, useParams } from "react-router-dom";
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
      {placed && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold text-emerald-800">Order placed successfully!</p>
            <p className="text-sm text-emerald-700">Your order {order.orderNumber} has been received. We'll call you to confirm.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Link to="/account/orders" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← All orders
        </Link>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Order Status</h2>
            <div className="mt-4">
              <StatusTimeline status={order.status} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Items</h2>
              <BuyAgainButton items={items.map((i) => ({ id: i.productId ?? 0, qty: i.qty }))} />
            </div>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 text-sm">
                  <img src={placeholderImage(i.productName, order.id)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{i.productName}</p>
                    <p className="text-xs text-gray-400">{i.unit} · {i.qty} × {formatNPR(i.price)}</p>
                  </div>
                  <span className="font-semibold text-gray-800">{formatNPR(i.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatNPR(order.itemsSubtotal)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatNPR(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatNPR(order.deliveryFee)}</span></div>
              <div className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span className="text-emerald-700">{formatNPR(order.total)}</span></div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Delivery Address</h2>
            <p className="mt-3 font-semibold text-gray-800">{order.customerName} · {order.customerPhone}</p>
            <p className="mt-1 text-sm text-gray-600">{order.deliveryLabel} — {order.addressLine}</p>
            {order.landmark && <p className="text-sm text-gray-500">Near: {order.landmark}</p>}
            {order.deliveryZoneName && (
              <p className="mt-2 text-xs font-medium text-emerald-700">Zone: {order.deliveryZoneName}</p>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Payment</h2>
            <p className="mt-3 text-sm font-semibold text-gray-800">{PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}</p>
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </span>
            {order.deliveryOtp && order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-xs font-medium text-emerald-700">Share this code with your rider on delivery</p>
                <p className="mt-1 text-2xl font-extrabold tracking-[0.4em] text-emerald-800">{order.deliveryOtp}</p>
              </div>
            )}
            {order.paymentMethod === "esewa" && order.paymentStatus !== "paid" && order.status !== "cancelled" && (
              <>
                <button
                  type="button"
                  disabled={paying}
                  onClick={payWithEsewa}
                  className="mt-3 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {paying ? "Redirecting to eSewa..." : "Pay now with eSewa"}
                </button>
                {payError && <p className="mt-2 text-xs font-medium text-red-600">{payError}</p>}
              </>
            )}
            {order.paymentMethod === "qr" && order.paymentStatus !== "paid" && order.status !== "cancelled" && (
              <div className="mt-3">
                <MerchantQr amount={order.total} />
              </div>
            )}
            {order.assignedTo && <p className="mt-2 text-xs text-gray-500">Delivering via: {order.assignedTo}</p>}
          </section>

          {order.notes && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Notes</h2>
              <p className="mt-2 text-sm text-gray-600">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
