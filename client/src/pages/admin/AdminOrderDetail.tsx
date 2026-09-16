import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR, formatDate } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_METHODS, STATUS_FLOW } from "@/lib/constants";
import { StatusTimeline } from "@/components/OrderStatus";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { Order } from "@/types";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, error, loading, reload } = useAsync<Order>(
    () => api.get(`/api/admin/orders/${id}`),
    [id],
  );

  const [saving, setSaving] = useState(false);
  const [assign, setAssign] = useState("");
  const [driverId, setDriverId] = useState("");
  const [panelError, setPanelError] = useState("");
  const driversQuery = useAsync<{ id: number; name: string; phone: string; isOnline: boolean; vehicleType: string | null }[]>(
    () => api.get("/api/admin/drivers"),
  );

  useEffect(() => {
    if (order) {
      setAssign(order.deliveryBoyId ? "" : (order.assignedTo ?? ""));
      setDriverId(order.deliveryBoyId ? String(order.deliveryBoyId) : "");
    }
  }, [order]);

  if (loading) return <Spinner label="Loading order..." />;
  if (error || !order) return <ErrorBox message={error ?? "Order not found."} />;

  const updateStatus = async (status: string, paymentStatus: string, assignedTo?: string | null, deliveryBoyId?: number | null) => {
    setSaving(true);
    setPanelError("");
    try {
      await api.post(`/api/admin/orders/${order.id}/status`, {
        status,
        paymentStatus,
        assignedTo: assignedTo ?? undefined,
        deliveryBoyId: deliveryBoyId ?? undefined,
      });
      reload();
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : "Failed to update order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <Link to="/admin/orders" className="text-sm font-semibold text-emerald-700 hover:underline">← All orders</Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <StatusTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Items</h2>
            <div className="mt-3 space-y-2 text-sm">
              {(order.items ?? []).map((i) => (
                <div key={i.id} className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-700">{i.productName} <span className="text-gray-400">× {i.qty}</span></span>
                  <span className="font-semibold">{formatNPR(i.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-gray-600"><span>Subtotal</span><span>{formatNPR(order.itemsSubtotal)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatNPR(order.discountAmount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatNPR(order.deliveryFee)}</span></div>
              <div className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span className="text-emerald-700">{formatNPR(order.total)}</span></div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Customer &amp; Delivery</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-gray-400">Name</dt><dd className="font-semibold">{order.customerName}</dd></div>
              <div><dt className="text-xs uppercase text-gray-400">Phone</dt><dd className="font-semibold">{order.customerPhone}</dd></div>
              <div><dt className="text-xs uppercase text-gray-400">Address</dt><dd>{order.addressLine} {order.landmark ? `(near ${order.landmark})` : ""}</dd></div>
              <div><dt className="text-xs uppercase text-gray-400">Zone</dt><dd>{order.deliveryZoneName ?? "—"}</dd></div>
            </dl>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Controls</h2>
            <div className="mt-3 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Order Status</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(s, order.paymentStatus)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${order.status === s ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-emerald-500"}`}
                    >
                      {ORDER_STATUSES[s]}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateStatus("cancelled", order.paymentStatus)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${order.status === "cancelled" ? "border-red-600 bg-red-600 text-white" : "border-red-200 bg-white text-red-500 hover:border-red-400"}`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">Payment</h3>
                <div className="mt-2 flex gap-2">
                  {["pending", "paid"].map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(order.status, ps)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${order.paymentStatus === ps ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600"}`}
                    >
                      {ps === "paid" ? "Paid" : "Pending"}
                    </button>
                  ))}
                </div>
              </div>

              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void updateStatus(
                    order.status,
                    order.paymentStatus,
                    driverId ? undefined : assign,
                    driverId ? Number(driverId) : undefined,
                  );
                }}
              >
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Manual name (no driver account)</option>
                  {(driversQuery.data ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.phone} {d.isOnline ? "(online)" : "(offline)"}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    value={assign}
                    onChange={(e) => setAssign(e.target.value)}
                    placeholder="Assign delivery person name"
                    disabled={Boolean(driverId)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                  />
                  <button disabled={saving} className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                    Save
                  </button>
                </div>
                {driverId && (
                  <p className="text-xs text-gray-500">Assigning a driver generates a 4-digit delivery OTP for the customer.</p>
                )}
              </form>

              {panelError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{panelError}</p>}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Payment Details</h2>
            <p className="mt-2 text-sm text-gray-600">
              Method: <span className="font-semibold">{PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}</span>
            </p>
            <p className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </p>
            {order.notes && <p className="mt-3 text-sm text-gray-600">Notes: {order.notes}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}