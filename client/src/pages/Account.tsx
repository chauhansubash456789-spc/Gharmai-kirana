import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { LocationPicker } from "@/components/LocationPicker";
import type { Address } from "@/types";

export default function Account() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    latitude: null as number | null,
    longitude: null as number | null,
    isDefault: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<Address[]>("/api/addresses");
      setAddresses(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAddress = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api.post<Address[]>("/api/addresses", {
      label: form.label,
      recipientName: form.recipientName,
      phone: form.phone,
      addressLine: form.addressLine,
      landmark: form.landmark || undefined,
      latitude: form.latitude,
      longitude: form.longitude,
      isDefault: form.isDefault,
    });
    setForm({ label: "Home", recipientName: "", phone: "", addressLine: "", landmark: "", latitude: null, longitude: null, isDefault: false });
    await load();
  };

  const setDefault = async (id: number) => {
    await api.post<Address[]>(`/api/addresses/${id}/default`);
    await load();
  };

  const remove = async (id: number) => {
    await api.del<Address[]>(`/api/addresses/${id}`);
    await load();
  };

  if (!user) return <Spinner label="Loading profile..." />;

  if (loading) {
    return (
      <div className="space-y-6">
        <Spinner label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorBox message={error} />}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
            <p className="mt-1 font-semibold text-gray-800">{user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Mobile</p>
            <p className="mt-1 font-semibold text-gray-800">{user.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Loyalty points</p>
            <p className="mt-1 font-semibold text-emerald-700">{user.loyaltyPoints} pts</p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <Link to="/account/orders" className="inline-block rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
            View my orders →
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
          <Plus className="h-5 w-5 text-gray-400" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={`rounded-lg border p-3 ${a.isDefault ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">
                  {a.label}
                  {a.isDefault && <span className="ml-2 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">DEFAULT</span>}
                </p>
                <div className="flex gap-1">
                  {!a.isDefault && (
                    <button onClick={() => void setDefault(a.id)} type="button" className="rounded p-1 text-emerald-600 hover:bg-emerald-50" title="Make default">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => void remove(a.id)} type="button" className="rounded p-1 text-gray-400 hover:text-red-500" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-600">{a.recipientName} · {a.phone}</p>
              <p className="text-xs text-gray-500">{a.addressLine}{a.landmark ? ` (${a.landmark})` : ""}</p>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-sm text-gray-500">No saved addresses yet. Add one below.</p>
          )}
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-4">
          <h3 className="text-sm font-bold text-gray-800">Add new address</h3>
          <form onSubmit={addAddress} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              name="label"
              placeholder="Label (Home / Office)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="recipientName"
              placeholder="Recipient name"
              required
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              placeholder="98XXXXXXXX"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
              height={280}
            />
            <input
              name="addressLine"
              placeholder="Full address (Tole, Ward)"
              required
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="landmark"
              placeholder="Landmark (optional)"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
              <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-emerald-600" /> Set as default
            </label>
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 sm:col-span-2">
              Save Address
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
