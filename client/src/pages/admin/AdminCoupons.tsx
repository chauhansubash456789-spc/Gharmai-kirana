import { useState } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR, formatDate } from "@/lib/format";
import { Plus, Ticket } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { Coupon } from "@/types";

const emptyForm = {
  code: "",
  type: "flat" as "flat" | "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "",
  expiresAt: "",
  usageLimit: "",
};

export default function AdminCoupons() {
  const { data: coupons, error, loading, reload } = useAsync<Coupon[]>(() => api.get("/api/admin/coupons"));
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.post("/api/admin/coupons", {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        maxDiscount: form.maxDiscount === "" ? undefined : Number(form.maxDiscount),
        expiresAt: form.expiresAt || undefined,
        usageLimit: form.usageLimit === "" ? undefined : Number(form.usageLimit),
      });
      setForm(emptyForm);
      setCreating(false);
      setMsg({ kind: "ok", text: "Coupon created." });
      reload();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to create coupon." });
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: Coupon) => {
    setTogglingId(c.id);
    setMsg(null);
    try {
      await api.post(`/api/admin/coupons/${c.id}/toggle`, { active: !c.active });
      reload();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to update coupon." });
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <Spinner label="Loading coupons..." />;
  if (error || !coupons) return <ErrorBox message={error ?? "Could not load coupons."} />;

  const now = Date.now();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          type="button"
          onClick={() => setCreating((c) => !c)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> {creating ? "Cancel" : "New Coupon"}
        </button>
      </div>

      {creating && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME100"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold tracking-wide"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Type</label>
            <div className="mt-1 flex gap-2">
              {(["flat", "percent"] as const).map((t) => (
                <label
                  key={t}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-semibold ${
                    form.type === t ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600"
                  }`}
                >
                  <input type="radio" name="coupon-type" value={t} checked={form.type === t} onChange={() => setForm({ ...form, type: t })} className="sr-only" />
                  {t === "flat" ? `Rs. off` : "% off"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">{form.type === "flat" ? "Amount (Rs.)" : "Percent (%)"}</label>
            <input
              type="number"
              min={0}
              step={form.type === "flat" ? 1 : 0.5}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Min order (Rs.)</label>
            <input
              type="number"
              min={0}
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Max discount (Rs.)</label>
            <input
              type="number"
              min={0}
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              placeholder="Optional"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Expires</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Usage limit</label>
            <input
              type="number"
              min={0}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Unlimited"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button disabled={busy || !form.code || !form.value} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {busy ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      )}

      {msg && (
        <div className={`rounded-lg px-3 py-2 text-sm font-medium ${msg.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => {
              const expired = c.expiresAt && new Date(c.expiresAt).getTime() < now;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 font-mono font-bold text-gray-800">
                      <Ticket className="h-3.5 w-3.5 text-emerald-600" /> {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    {c.type === "flat" ? formatNPR(c.value) : `${c.value}%`}
                    {c.maxDiscount ? <span className="text-xs font-normal text-gray-400"> max {formatNPR(c.maxDiscount)}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatNPR(c.minOrder)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.usedCount}
                    {c.usageLimit ? <span className="text-xs text-gray-400"> / {c.usageLimit}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${expired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                      {expired ? "Expired" : "Valid"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={togglingId === c.id}
                        onClick={() => toggle(c)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${c.active && !expired ? "bg-emerald-600" : "bg-gray-300"}`}
                        title={c.active ? "Deactivate" : "Activate"}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.active && !expired ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  <Ticket className="mx-auto h-8 w-8 text-gray-300" />
                  No coupons yet. Create one to offer discounts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}