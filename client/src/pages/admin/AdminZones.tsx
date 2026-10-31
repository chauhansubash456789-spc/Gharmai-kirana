import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@/hooks/useAsync";
import { setCachedStoreConfig } from "@/hooks/useStoreConfig";
import { api } from "@/api/client";
import { formatNPR } from "@/lib/format";
import { Plus, Pencil, Trash2, Truck, CheckCircle2, Sparkles, Save } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { DeliveryZone, StoreSettings } from "@/types";

interface ZoneFormState {
  name: string;
  charge: string;
  minOrderForFree: string;
}

const empty: ZoneFormState = { name: "", charge: "20", minOrderForFree: "5000" };

function ZoneFormFields({ form, setForm }: { form: ZoneFormState; setForm: (f: ZoneFormState) => void }) {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-gray-600">Zone name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Birgunj Central"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Delivery charge (Rs.)</label>
        <input
          type="number"
          min={0}
          value={form.charge}
          onChange={(e) => setForm({ ...form, charge: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Free above (Rs.)</label>
        <input
          type="number"
          min={0}
          value={form.minOrderForFree}
          onChange={(e) => setForm({ ...form, minOrderForFree: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

export default function AdminZones() {
  const { data: zones, error, loading, reload } = useAsync<DeliveryZone[]>(() => api.get("/api/admin/zones"));
  const { data: storeSettings, reload: reloadSettings } = useAsync<StoreSettings>(() => api.get("/api/admin/settings"));

  const [globalThreshold, setGlobalThreshold] = useState<string>("999");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ZoneFormState>(empty);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (storeSettings?.freeDeliveryThreshold !== undefined) {
      setGlobalThreshold(String(storeSettings.freeDeliveryThreshold));
    }
  }, [storeSettings]);

  const handleUpdateGlobalThreshold = async () => {
    const thresholdNum = Number(globalThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      setMsg("Please enter a valid free delivery threshold amount (0 or greater).");
      return;
    }
    setSavingThreshold(true);
    setThresholdSaved(false);
    setMsg("");
    try {
      const res = await api.post<{ ok: boolean; freeDeliveryThreshold: number }>("/api/admin/settings/free-delivery", { threshold: thresholdNum });
      if (res?.freeDeliveryThreshold !== undefined && storeSettings) {
        setCachedStoreConfig({ ...storeSettings, freeDeliveryThreshold: res.freeDeliveryThreshold });
      }
      setThresholdSaved(true);
      reload();
      reloadSettings();
      setTimeout(() => setThresholdSaved(false), 4000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to update free delivery threshold.");
    } finally {
      setSavingThreshold(false);
    }
  };

  const startEdit = (z: DeliveryZone) => {
    setEditingId(z.id);
    setForm({ name: z.name, charge: String(z.charge), minOrderForFree: String(z.minOrderForFree) });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const body = { name: form.name.trim(), charge: Number(form.charge), minOrderForFree: Number(form.minOrderForFree) };
    try {
      if (editingId) await api.put(`/api/admin/zones/${editingId}`, body);
      else await api.post("/api/admin/zones", body);
      setEditingId(null);
      setCreating(false);
      setForm(empty);
      reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to save zone.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading zones..." />;
  if (error || !zones) return <ErrorBox message={error ?? "Could not load zones."} />;

  const parsedThreshold = Number(globalThreshold) || 0;

  return (
    <div className="space-y-6">
      {/* Storewide Free Delivery Configuration Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  <Sparkles className="h-3 w-3" /> Storewide Policy
                </span>
                <span className="text-xs text-gray-400">निःशुल्क डेलिभरी सीमा</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                Free Delivery Above Rs. (Threshold)
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Live Free Shipping:</span>
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-extrabold text-emerald-800">
              {formatNPR(storeSettings?.freeDeliveryThreshold ?? 999)}
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-600">
          वीरगञ्ज महानगरपालिका भित्र सम्पूर्ण अर्डरमा लागु — Enter the order amount above which customers automatically receive free delivery. Saving will sync all delivery zones below, the storefront navbar, and mobile banners.
        </p>

        {thresholdSaved && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100/80 px-3 py-2 text-xs font-semibold text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            Free delivery threshold successfully updated to {formatNPR(parsedThreshold)} across all delivery zones!
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex max-w-xs flex-1 items-center rounded-xl border-2 border-emerald-300 bg-white shadow-inner focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20">
            <span className="pl-3.5 pr-1.5 font-bold text-gray-500 select-none">रु.</span>
            <input
              type="number"
              min={0}
              step={1}
              value={globalThreshold}
              onChange={(e) => setGlobalThreshold(e.target.value)}
              placeholder="999"
              className="w-full bg-transparent py-2.5 pr-3 text-lg font-extrabold text-emerald-950 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[499, 799, 999, 1499, 1999].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setGlobalThreshold(String(amt))}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  parsedThreshold === amt
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-100"
                }`}
              >
                रु. {amt}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUpdateGlobalThreshold}
            disabled={savingThreshold}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingThreshold ? "Updating..." : "Save Free Delivery Limit"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Birgunj Delivery Zones</h1>
          <p className="text-xs text-gray-500">Manage individual ward charges and custom per-zone overrides.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating((c) => !c);
            setEditingId(null);
            setForm(empty);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> {creating ? "Cancel" : "Add Zone"}
        </button>
      </div>

      {creating && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-3">
          <ZoneFormFields form={form} setForm={setForm} />
          <div className="flex items-end">
            <button disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {busy ? "Saving..." : "Create Zone"}
            </button>
          </div>
        </form>
      )}

      {msg && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{msg}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Charge</th>
              <th className="px-4 py-3">Free delivery above</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zones.map((z) =>
              editingId === z.id ? (
                <tr key={z.id} className="bg-emerald-50/50">
                  <td colSpan={4} className="px-4 py-3">
                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_120px_130px_auto]">
                      <ZoneFormFields form={form} setForm={setForm} />
                      <div className="flex items-center gap-2">
                        <button disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                          {busy ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setForm(empty);
                          }}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={z.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{z.name}</td>
                  <td className="px-4 py-3 text-gray-600">{z.charge === 0 ? <span className="font-semibold text-emerald-600">FREE</span> : formatNPR(z.charge)}</td>
                  <td className="px-4 py-3 text-gray-500">{z.minOrderForFree > 0 ? formatNPR(z.minOrderForFree) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(z)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete zone "${z.name}"?`)) return;
                          await api.del(`/api/admin/zones/${z.id}`);
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
              ),
            )}
            {zones.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  <Truck className="mx-auto h-8 w-8 text-gray-300" />
                  No delivery zones yet. Add your first zone.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}