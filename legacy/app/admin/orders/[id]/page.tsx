import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNPR } from "@/lib/format";
import { StatusTimeline } from "@/components/shared/OrderStatus";
import { OrderAdminPanel } from "@/components/admin/OrderAdminPanel";
import { PAYMENT_METHODS } from "@/lib/constants";
import { getOrderForAdmin } from "@/services/order.service";
import type { DynamicPageProps } from "@/lib/types";

export default async function AdminOrderDetailPage(props: DynamicPageProps<{ id: string }>) {
  const { id } = await props.params;
  const order = await getOrderForAdmin(Number(id));
  if (!order) notFound();

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{order.createdAt.toLocaleString("en-GB")}</p>
        </div>
        <Link href="/admin/orders" className="text-sm font-semibold text-emerald-700 hover:underline">← All orders</Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <StatusTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Items</h2>
            <div className="mt-3 space-y-2 text-sm">
              {order.items.map((i) => (
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
            <div className="mt-3">
              <OrderAdminPanel
                orderId={order.id}
                currentStatus={order.status}
                currentPaymentStatus={order.paymentStatus}
                currentAssignedTo={order.assignedTo}
              />
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