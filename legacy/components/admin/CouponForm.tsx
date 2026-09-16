"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoupon } from "@/actions/admin";

export function CouponForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    type: "flat",
    value: 100,
    minOrder: 999,
    maxDiscount: 0,
    expiresAt: "",
    usageLimit: 0,
  });

  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
  const label = "text-xs font-semibold text-gray-600";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await createCoupon({
      code: form.code,
      type: form.type as "flat" | "percent",
      value: form.value,
      minOrder: form.minOrder,
      maxDiscount: form.maxDiscount > 0 ? form.maxDiscount : undefined,
      expiresAt: form.expiresAt || undefined,
      usageLimit: form.usageLimit > 0 ? form.usageLimit : undefined,
    });
    if (res && "error" in res && res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
    setForm({ code: "", type: "flat", value: 100, minOrder: 999, maxDiscount: 0, expiresAt: "", usageLimit: 0 });
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-bold text-gray-900">Create Coupon</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className={label}>Code *</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="WELCOME100" className={input} /></div>
        <div><label className={label}>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input}>
            <option value="flat">Flat (Rs.)</option>
            <option value="percent">Percent (%)</option>
          </select></div>
        <div><label className={label}>Value *</label>
          <input type="number" min="1" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} required className={input} /></div>
        <div><label className={label}>Min order (Rs.)</label>
          <input type="number" min="0" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className={input} /></div>
        <div><label className={label}>Max discount (Rs., 0 = none)</label>
          <input type="number" min="0" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} className={input} /></div>
        <div><label className={label}>Expires on</label>
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={input} /></div>
        <div><label className={label}>Usage limit (0 = unlimited)</label>
          <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className={input} /></div>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      <button className="mt-3 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Create Coupon</button>
    </form>
  );
}