import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAsync } from "@/hooks/useAsync";
import { api, ApiError } from "@/api/client";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { Category, Product } from "@/types";

interface CategoryOption {
  id: number;
  name: string;
}

type FormState = {
  name: string;
  sku: string;
  categoryId: number;
  brand: string;
  unit: string;
  mrp: number;
  price: number;
  purchasePrice: number;
  stock: number;
  image: string;
  description: string;
  supplier: string;
  batch: string;
  expiryDate: string;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
};

export default function AdminProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get("cat");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categoriesQuery = useAsync<Category[]>(() => api.get("/api/admin/categories"));
  const productQuery = useAsync<Product | null>(
    () => (id ? api.get(`/api/admin/products/${id}`) : Promise.resolve(null)),
    [id],
  );

  const initial: FormState = {
    name: "",
    sku: "",
    categoryId: Number(catParam) || 0,
    brand: "",
    unit: "1 kg",
    mrp: 0,
    price: 0,
    purchasePrice: 0,
    stock: 0,
    image: "",
    description: "",
    supplier: "",
    batch: "",
    expiryDate: "",
    active: true,
    featured: false,
    bestSeller: false,
  };

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    if (!isEdit && categoriesQuery.data && categoriesQuery.data.length > 0 && form.categoryId === 0) {
      const defaultId = Number(catParam) || categoriesQuery.data[0].id;
      setForm((f) => ({ ...f, categoryId: defaultId }));
    }
  }, [isEdit, categoriesQuery.data, form.categoryId, catParam]);

  useEffect(() => {
    if (isEdit && productQuery.data) {
      const p = productQuery.data;
      setForm({
        name: p.name,
        sku: p.sku,
        categoryId: p.categoryId,
        brand: p.brand ?? "",
        unit: p.unit,
        mrp: p.mrp,
        price: p.price,
        purchasePrice: p.purchasePrice,
        stock: p.stock,
        image: p.image ?? "",
        description: p.description ?? "",
        supplier: p.supplier ?? "",
        batch: p.batch ?? "",
        expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : "",
        active: p.active,
        featured: p.featured,
        bestSeller: p.bestSeller,
      });
    }
  }, [isEdit, productQuery.data]);

  if (categoriesQuery.loading || (isEdit && productQuery.loading)) return <Spinner label="Loading..." />;
  if (categoriesQuery.error) return <ErrorBox message={categoriesQuery.error} />;
  if (isEdit && productQuery.error) return <ErrorBox message={productQuery.error} />;

  const categories: CategoryOption[] = (categoriesQuery.data ?? [])
    .filter((c) => c.name && typeof c.name === "string")
    .map((c) => ({ id: c.id, name: c.name }));

  const set = (k: keyof FormState, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      categoryId: form.categoryId,
      brand: form.brand.trim() || null,
      unit: form.unit.trim(),
      mrp: form.mrp,
      price: form.price,
      purchasePrice: form.purchasePrice,
      stock: form.stock,
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      supplier: form.supplier.trim() || null,
      batch: form.batch.trim() || null,
      expiryDate: form.expiryDate.trim() || null,
      active: form.active,
      featured: form.featured,
      bestSeller: form.bestSeller,
    };
    try {
      if (isEdit) {
        await api.put(`/api/admin/products/${id}`, payload);
      } else {
        await api.post("/api/admin/products", payload);
      }
      navigate("/admin/products");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError("Failed to save product.");
      setSaving(false);
    }
  };

  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
  const label = "text-xs font-semibold text-gray-600";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Edit Product" : "Add Product"}</h1>
        <button type="button" onClick={() => navigate("/admin/products")} className="text-sm font-semibold text-emerald-700 hover:underline">
          ← All products
        </button>
      </div>

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
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}