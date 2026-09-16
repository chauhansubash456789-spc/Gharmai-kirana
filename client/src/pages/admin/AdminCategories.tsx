import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { Plus, Trash2, Tags, Package, X } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { Category } from "@/types";

export default function AdminCategories() {
  const { data: categories, error, loading, reload } = useAsync<Category[]>(() => api.get("/api/admin/categories"));
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/api/admin/categories", { name: name.trim() });
      setName("");
      setCreating(false);
      setToast({ kind: "ok", text: "Category created." });
      reload();
    } catch (err) {
      setToast({ kind: "err", text: err instanceof Error ? err.message : "Failed to create category." });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/api/admin/categories/${deleteTarget.id}`);
      setToast({ kind: "ok", text: "Category deleted." });
      reload();
    } catch (err) {
      setToast({ kind: "err", text: err instanceof Error ? err.message : "Could not delete category." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <Spinner label="Loading categories..." />;
  if (error || !categories) return <ErrorBox message={error ?? "Could not load categories."} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          type="button"
          onClick={() => setCreating((c) => !c)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> {creating ? "Cancel" : "Add Category"}
        </button>
      </div>

      {creating && (
        <form onSubmit={submit} className="flex max-w-md gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name, e.g. Daily Essentials"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {busy ? "Adding..." : "Create"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="font-bold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400">/{c.slug}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                <Package className="h-4 w-4 text-emerald-600" />
                {c._count?.products ?? 0} product{c._count?.products === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteTarget(c)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-gray-400">
            <Tags className="mx-auto h-8 w-8 text-gray-300" />
            No categories yet. Add your first category.
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">Delete "{deleteTarget.name}"?</h2>
              <button type="button" onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This can only be done if no products are assigned. Deleting a category cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600">
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.kind === "ok" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}