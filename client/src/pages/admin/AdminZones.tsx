import { useState } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR } from "@/lib/format";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";
import type { DeliveryZone } from "@/types";

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ZoneFormState>(empty);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
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