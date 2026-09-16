import Link from "next/link";
import { formatNPR } from "@/lib/format";
import { StatusBadge } from "@/components/shared/OrderStatus";
import { ORDER_STATUSES } from "@/lib/constants";
import { listOrdersForAdmin } from "@/services/order.service";
import type { DynamicPageProps } from "@/lib/types";

export default async function AdminOrdersPage(props: DynamicPageProps) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q : "";

  const orders = await listOrdersForAdmin({ status, q });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!status ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}>
          All
        </Link>
        {Object.entries(ORDER_STATUSES).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === key ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <form className="max-w-sm">
        <input name="q" defaultValue={q} placeholder="Search order no., customer, phone..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-bold text-emerald-700 hover:underline">{o.orderNumber}</Link>
                  <p className="text-xs text-gray-400">{o.createdAt.toLocaleString("en-GB")}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{o.customerName}</p>
                  <p className="text-xs text-gray-500">{o.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{o.deliveryZoneName ?? "—"}</td>
                <td className="px-4 py-3 font-bold text-gray-900">{formatNPR(o.total)}</td>
                <td className="px-4 py-3 text-gray-500">{o.paymentMethod.toUpperCase()}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}