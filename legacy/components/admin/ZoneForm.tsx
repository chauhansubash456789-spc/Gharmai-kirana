"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createZone, updateZone } from "@/actions/admin";

export function ZoneForm({ zone }: { zone?: { id: number; name: string; charge: number; minOrderForFree: number } }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: zone?.name ?? "",
    charge: zone?.charge ?? 40,
    minOrderForFree: zone?.minOrderForFree ?? 999,
  });

  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
  const label = "text-xs font-semibold text-gray-600";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const action = zone ? updateZone(zone.id, form) : createZone(form);
    const res = await action;
    if (res && "error" in res && res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
    if (!zone) setForm({ name: "", charge: 40, minOrderForFree: 999 });
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-bold text-gray-900">{zone ? `Edit: ${zone.name}` : "Add Delivery Zone"}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className={label}>Zone name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Central Birgunj" className={input} /></div>
        <div><label className={label}>Delivery charge (Rs.)</label>
          <input type="number" min="0" value={form.charge} onChange={(e) => setForm({ ...form, charge: Number(e.target.value) })} className={input} /></div>
        <div><label className={label}>Free above (Rs.)</label>
          <input type="number" min="0" value={form.minOrderForFree} onChange={(e) => setForm({ ...form, minOrderForFree: Number(e.target.value) })} className={input} /></div>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      <button className="mt-3 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
        {zone ? "Save Changes" : "Add Zone"}
      </button>
    </form>
  );
}