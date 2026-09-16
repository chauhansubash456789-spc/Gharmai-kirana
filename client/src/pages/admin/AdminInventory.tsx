import { Link } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR } from "@/lib/format";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { Product } from "@/types";

export default function AdminInventory() {
  const { data: products, error, loading, reload } = useAsync<Product[]>(() => api.get("/api/admin/inventory"));

  if (loading) return <Spinner label="Loading inventory..." />;
  if (error || !products) return <ErrorBox message={error ?? "Could not load inventory."} />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiringWindow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoon = products.filter((p) => p.expiryDate && new Date(p.expiryDate) <= expiringWindow);
  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-bold uppercase text-red-500">Out of stock</p>
          <p className="mt-1 text-2xl font-extrabold text-red-700">{outOfStock.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase text-amber-600">Low stock (≤10)</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-700">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-bold uppercase text-orange-600">⚠️ Expiring within 30 days</p>
          <p className="mt-1 text-2xl font-extrabold text-orange-700">{expiringSoon.length}</p>
          {expiringSoon.length > 0 && (
            <p className="mt-1 text-sm text-orange-600">
              Next: {expiringSoon[0].name} ({expiringSoon[0].expiryDate ? new Date(expiringSoon[0].expiryDate).toLocaleDateString("en-GB") : ""})
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Buy (Rs.)</th>
              <th className="px-4 py-3">Sell (Rs.)</th>
              <th className="px-4 py-3">Stock value</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Add stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => {
              const exp = p.expiryDate ? new Date(p.expiryDate) : null;
              const expiring = exp && exp <= expiringWindow && exp > today;
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${p.id}`} className="font-semibold text-gray-800 hover:text-emerald-700">{p.name}</Link>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </td>
                  <td className={`px-4 py-3 font-bold ${p.stock === 0 ? "text-red-600" : p.stock <= 10 ? "text-amber-600" : "text-gray-800"}`}>
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatNPR(p.purchasePrice)}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{formatNPR(p.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatNPR(p.stock * p.purchasePrice)}</td>
                  <td className="px-4 py-3">
                    {exp ? (
                      <span className={expiring ? "font-bold text-red-600" : "text-gray-500"}>
                        {exp.toLocaleDateString("en-GB")}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[1, 5, 10].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={async () => {
                            await api.post(`/api/admin/products/${p.id}/restock`, { qty: n });
                            reload();
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 hover:border-emerald-500 hover:bg-emerald-50"
                        >
                          +{n}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}