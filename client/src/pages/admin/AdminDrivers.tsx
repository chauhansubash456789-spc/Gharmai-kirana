import { useState } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@/hooks/useAsync";
import { api, ApiError } from "@/api/client";
import { Plus, Trash2, Bike } from "lucide-react";
import { Spinner, ErrorBox } from "@/components/Feedback";

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  isOnline: boolean;
  vehicleType: string | null;
}

const empty = { name: "", phone: "", email: "", password: "", vehicleType: "Bike" };

export default function AdminDrivers() {
  const { data: drivers, error, loading, reload } = useAsync<Driver[]>(() => api.get("/api/admin/drivers"));
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.post("/api/admin/drivers", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        vehicleType: form.vehicleType.trim() || undefined,
      });
      setForm(empty);
      setCreating(false);
      setMsg({ kind: "ok", text: "Driver account created. They can login with their mobile number." });
      reload();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof ApiError ? err.message : "Failed to create driver." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading drivers..." />;
  if (error || !drivers) return <ErrorBox message={error ?? "Could not load drivers."} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Staff</h1>
          <p className="text-sm text-gray-500">{drivers.length} rider{drivers.length === 1 ? "" : "s"} · they login at /login and land on the driver dashboard</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((c) => !c)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> {creating ? "Cancel" : "Add Rider"}
        </button>
      </div>

      {creating && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ram Bahadur" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Mobile number</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98XXXXXXXX" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Email (optional)</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="rider@example.com" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Login password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Vehicle</label>
            <input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} placeholder="Bike" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {busy ? "Creating..." : "Create Rider"}
            </button>
          </div>
        </form>
      )}

      {msg && (
        <div className={`rounded-lg px-3 py-2 text-sm font-medium ${msg.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((d) => (
          <div key={d.id} className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="flex items-center gap-2 font-bold text-gray-900">
                <Bike className="h-4 w-4 text-emerald-600" /> {d.name}
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.isOnline ? "Online" : "Offline"}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-500">{d.phone}</p>
              <p className="text-xs text-gray-400">{d.vehicleType ?? "No vehicle set"}{d.email ? ` · ${d.email}` : ""}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Remove rider "${d.name}"?`)) return;
                try {
                  await api.del(`/api/admin/drivers/${d.id}`);
                  reload();
                } catch (err) {
                  setMsg({ kind: "err", text: err instanceof ApiError ? err.message : "Could not remove rider." });
                }
              }}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {drivers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-gray-400">
            <Bike className="mx-auto h-8 w-8 text-gray-300" />
            No riders yet. Add your first delivery rider.
          </div>
        )}
      </div>
    </div>
  );
}