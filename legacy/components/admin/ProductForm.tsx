"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/admin";

interface CategoryOption {
  id: number;
  name: string;
}

interface ProductInput {
  id?: number;
  name: string;
  sku: string;
  categoryId: number;
  brand?: string | null;
  unit: string;
  mrp: number;
  price: number;
  purchasePrice: number;
  stock: number;
  image?: string | null;
  description?: string | null;
  supplier?: string | null;
  batch?: string | null;
  expiryDate?: string | null;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
}

export function ProductForm({ categories, product }: { categories: CategoryOption[]; product?: ProductInput }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? 0,
    brand: product?.brand ?? "",
    unit: product?.unit ?? "1 kg",
    mrp: product?.mrp ?? 0,
    price: product?.price ?? 0,
    purchasePrice: product?.purchasePrice ?? 0,
    stock: product?.stock ?? 0,
    image: product?.image ?? "",
    description: product?.description ?? "",
    supplier: product?.supplier ?? "",
    batch: product?.batch ?? "",
    expiryDate: product?.expiryDate ? product.expiryDate.slice(0, 10) : "",
    active: product ? product.active : true,
    featured: product?.featured ?? false,
    bestSeller: product?.bestSeller ?? false,
  });

  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      sku: form.sku,
      categoryId: form.categoryId,
      brand: form.brand || undefined,
      unit: form.unit,
      mrp: form.mrp,
      price: form.price,
      purchasePrice: form.purchasePrice,
      stock: form.stock,
      image: form.image || undefined,
      description: form.description || undefined,
      supplier: form.supplier || undefined,
      batch: form.batch || undefined,
      expiryDate: form.expiryDate || undefined,
      active: form.active,
      featured: form.featured,
      bestSeller: form.bestSeller,
    };
    const res = product
      ? await updateProduct(product.id!, payload)
      : await createProduct(payload);
    if (res && "error" in res && res.error) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
  const label = "text-xs font-semibold text-gray-600";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-bold text-gray-900">Basic Info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Product name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required className={input} />
          </div>
          <div>
            <label className={label}>SKU *</label>
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)} required className={input} />
          </div>
          <div>
            <label className={label}>Category *</label>
            <select value={form.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))} className={input}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Brand</label>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Unit (e.g. 1 kg, 5 L) *</label>
            <input value={form.unit} onChange={(e) => set("unit", e.target.value)} required className={input} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-bold text-gray-900">Pricing &amp; Stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>MRP (Rs.) *</label>
            <input type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => set("mrp", Number(e.target.value))} required className={input} />
          </div>
          <div>
            <label className={label}>Our Price (Rs.) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", Number(e.target.value))} required className={input} />
          </div>
          <div>
            <label className={label}>Purchase Price (Rs.)</label>
            <input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => set("purchasePrice", Number(e.target.value))} className={input} />
          </div>
          <div>
            <label className={label}>Stock *</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} required className={input} />
          </div>
          <div>
            <label className={label}>Supplier</label>
            <input value={form.supplier} onChange={(e) => set("supplier", e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Batch</label>
            <input value={form.batch} onChange={(e) => set("batch", e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className={input} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-bold text-gray-900">Display</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={label}>Image URL (optional — leave blank to use generated placeholder)</label>
            <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." className={input} />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={input} />
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="accent-emerald-600" /> Active
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-emerald-600" /> Featured (Combo offers)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.bestSeller} onChange={(e) => set("bestSeller", e.target.checked)} className="accent-emerald-600" /> Best Seller
            </label>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</div>}

      <div className="flex gap-3">
        <button disabled={saving} className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}