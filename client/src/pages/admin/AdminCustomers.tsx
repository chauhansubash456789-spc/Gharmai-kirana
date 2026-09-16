import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR, formatDate } from "@/lib/format";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { CustomerWithTotals } from "@/types";

export default function AdminCustomers() {
  const { data, error, loading } = useAsync<CustomerWithTotals>(() => api.get("/api/admin/customers"), []);

  if (loading) return <Spinner label="Loading customers..." />;
  if (error || !data) return <ErrorBox message={error ?? "Could not load customers."} />;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <p className="text-sm text-gray-500">{data.customers.length} registered customers</p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Wishlist</th>
              <th className="px-4 py-3">Total spent</th>
              <th className="px-4 py-3">Loyalty pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{c._count.orders}</td>
                <td className="px-4 py-3 text-gray-500">{c._count.wishlistItems}</td>
                <td className="px-4 py-3 font-bold text-emerald-700">{formatNPR(data.totalsByUser[c.id] ?? 0)}</td>
                <td className="px-4 py-3 text-gray-600">{c.loyaltyPoints}</td>
              </tr>
            ))}
            {data.customers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}