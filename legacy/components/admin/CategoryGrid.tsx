"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Trash2, X } from "lucide-react";
import { deleteCategory } from "@/actions/admin";
import { placeholderImage } from "@/lib/format";

export interface CategoryGridItem {
  id: number;
  name: string;
  image: string | null;
  productCount: number;
}

type Toast = { type: "success" | "error"; message: string };

export function CategoryGrid({ categories }: { categories: CategoryGridItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const target = items.find((c) => c.id === confirmId) ?? null;

  const showToast = (t: Toast) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const confirmDelete = async () => {
    if (!target || deleting) return;
    setDeleting(true);
    setError("");

    const res = await deleteCategory(target.id);
    if (res && "error" in res && res.error) {
      setError(res.error);
      showToast({ type: "error", message: res.error });
      setDeleting(false);
      return;
    }

    setItems((prev) => prev.filter((c) => c.id !== target.id));
    setConfirmId(null);
    setDeleting(false);
    showToast({ type: "success", message: `"${target.name}" deleted` });
    router.refresh();
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => (
          <div key={c.id} className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <img src={c.image || placeholderImage(c.name, i)} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-bold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.productCount} products</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmId(c.id);
                setError("");
              }}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete category"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100" aria-label="Dismiss notification">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {target && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={`Delete ${target.name}`}>
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete category?</h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{target.name}</span>? This action cannot be undone.
            </p>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}