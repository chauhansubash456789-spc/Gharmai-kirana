import { Link } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";
import { AlertTriangle, ClipboardList } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { DashboardData } from "@/types";

export default function Dashboard() {
  const { data, error, loading } = useAsync<DashboardData>(() => api.get("/api/admin/dashboard"));

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error || !data) return <ErrorBox message={error ?? "Could not load dashboard."} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {data.cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{c.label}</p>
            <p className="mt-2 text-xl font-extrabold text-gray-900">
              {c.label === "Today's Sales" ? formatNPR(c.value) : String(c.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h2 className="text-base font-bold text-gray-900">Financial Snapshot</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Total revenue (all)</dt><dd className="font-bold">{formatNPR(data.financial.revenue)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Item revenue before discount</dt><dd className="font-bold">{formatNPR(data.financial.grossProfit)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Stock value (cost)</dt><dd className="font-bold">{formatNPR(data.financial.valueAtCost)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Stock value (selling)</dt><dd className="font-bold">{formatNPR(data.financial.valueAtSell)}</dd></div>
          </dl>

          <h2 className="mt-6 text-base font-bold text-gray-900">Top Selling Products</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.topProducts.map((p, i) => (
              <li key={p.productName} className="flex justify-between">
                <span className="text-gray-700"><span className="font-bold text-gray-400">{i + 1}.</span> {p.productName}</span>
                <span className="font-semibold text-gray-900">{p._sum.qty} sold</span>
              </li>
            ))}
            {data.topProducts.length === 0 && <li className="text-gray-400">No sales yet.</li>}
          </ul>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-bold text-amber-800">⚠️ Low Stock ({data.lowStock.length} products)</h2>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="truncate text-gray-700">{p.name}</span>
                  <span className="font-bold text-red-600">{p.stock} left</span>
                </li>
              ))}
              {data.lowStock.length === 0 && <li className="text-sm text-amber-700">All products sufficiently stocked.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-bold text-red-800">⚠️ Expiring within 30 days ({data.expiringSoon.length})</h2>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.expiringSoon.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="truncate text-gray-700">{p.name}</span>
                  <span className="font-bold text-red-600">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-GB") : ""}</span>
                </li>
              ))}
              {data.expiringSoon.length === 0 && <li className="text-sm text-red-600">No products expiring soon.</li>}
            </ul>
            <Link to="/admin/inventory" className="mt-3 inline-block text-sm font-semibold text-red-700 hover:underline">
              Manage inventory →
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <ul className="mt-3 divide-y divide-gray-100 text-sm">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 py-2">
                  <Link to={`/admin/orders/${o.id}`} className="font-semibold text-emerald-700 hover:underline">
                    {o.orderNumber}
                    <span className="ml-2 font-normal text-gray-400">{formatDate(o.createdAt)}</span>
                  </Link>
                  <span className="text-gray-500">{ORDER_STATUSES[o.status] ?? o.status}</span>
                  <span className="font-bold text-gray-900">{formatNPR(o.total)}</span>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/admin/orders" className="font-semibold text-emerald-700 hover:underline">
                  View all orders →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}