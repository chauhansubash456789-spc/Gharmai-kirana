import { Link, useSearchParams } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR, placeholderImage } from "@/lib/format";
import { Plus, Pencil, Trash2, PackageSearch } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { Product } from "@/types";

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const { data: products, error, loading, reload } = useAsync<Product[]>(
    () => api.get(`/api/admin/products?q=${encodeURIComponent(q)}`),
    [q],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <form
        className="max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
          const next = new URLSearchParams(params);
          if (v) next.set("q", v);
          else next.delete("q");
          setParams(next, { replace: true });
        }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or SKU..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </form>

      {loading ? (
        <Spinner label="Loading products..." />
      ) : error ? (
        <ErrorBox message={error} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(products ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || placeholderImage(p.name, p.categoryId)} alt="" className="h-10 w-10 rounded object-cover" />
                      <Link to={`/admin/products/${p.id}`} className="font-semibold text-gray-800 hover:text-emerald-700">
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name ?? ""}</td>
                  <td className="px-4 py-3 text-gray-400">{formatNPR(p.mrp)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{formatNPR(p.price)}</td>
                  <td className={`px-4 py-3 font-semibold ${p.stock <= 10 ? "text-red-600" : "text-gray-800"}`}>{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/products/${p.id}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete "${p.name}"?`)) return;
                          await api.del(`/api/admin/products/${p.id}`);
                          reload();
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(products ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    <PackageSearch className="mx-auto h-8 w-8 text-gray-300" />
                    No products found. Add your first product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}