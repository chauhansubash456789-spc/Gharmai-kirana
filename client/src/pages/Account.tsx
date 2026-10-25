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
    province: "",
    district: "",
    municipality: "",
    ward: "",
    tole: "",
    latitude: null as number | null,
    longitude: null as number | null,
    isDefault: false,
  });

  const handleAddressChange = (address: {
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
    tole?: string;
    landmark?: string;
    formattedAddress?: string;
  }) => {
    const parts: string[] = [];
    if (address.tole) parts.push(address.tole);
    if (address.ward) parts.push(`Ward ${address.ward}`);
    if (address.municipality) parts.push(address.municipality);
    if (address.district) parts.push(address.district);
    if (address.province) parts.push(address.province);
    const fullAddress = parts.join(", ");

    setForm((prev) => ({
      ...prev,
      addressLine: fullAddress || prev.addressLine,
      landmark: address.landmark || prev.landmark,
      province: address.province || prev.province,
      district: address.district || prev.district,
      municipality: address.municipality || prev.municipality,
      ward: address.ward || prev.ward,
      tole: address.tole || prev.tole,
    }));
  };

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
    setForm({
      label: "Home",
      recipientName: "",
      phone: "",
      addressLine: "",
      landmark: "",
      province: "",
      district: "",
      municipality: "",
      ward: "",
      tole: "",
      latitude: null,
      longitude: null,
      isDefault: false,
    });
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

      <section className="rounded-xl border border-[#EAE5D9] bg-white p-6 shadow-artisanal">
        <h1 className="text-2xl font-bold font-serif text-[#222222] tracking-tight">My Profile</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8E887E]">Name</p>
            <p className="mt-1 font-semibold text-[#222222]">{user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8E887E]">Mobile</p>
            <p className="mt-1 font-semibold text-[#222222]">{user.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8E887E]">Loyalty points</p>
            <p className="mt-1 font-bold text-[#2C5E3B]">{user.loyaltyPoints} pts</p>
          </div>
        </div>
        <div className="mt-5 border-t border-[#EAE5D9] pt-4">
          <Link to="/account/orders" className="inline-block rounded-xl bg-[#EFF5F2] border border-[#C4D6CC] px-4 py-2 text-sm font-semibold text-[#2C5E3B] hover:bg-[#E2ECE7] transition-colors">
            View my orders →
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-[#EAE5D9] bg-white p-6 shadow-artisanal">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#222222]">Saved Addresses</h2>
          <Plus className="h-5 w-5 text-[#8E887E]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 transition-all ${a.isDefault ? "border-[#2C5E3B] bg-[#EFF5F2]" : "border-[#EAE5D9] bg-white"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#222222]">
                  {a.label}
                  {a.isDefault && <span className="ml-2 rounded-md bg-[#2C5E3B] px-2 py-0.5 text-[10px] font-bold text-white tracking-wider">DEFAULT</span>}
                </p>
                <div className="flex gap-1">
                  {!a.isDefault && (
                    <button onClick={() => void setDefault(a.id)} type="button" className="rounded-lg p-1.5 text-[#2C5E3B] hover:bg-[#E2ECE7] transition-colors" title="Make default">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => void remove(a.id)} type="button" className="rounded-lg p-1.5 text-[#8E887E] hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-[#666159]">{a.recipientName} · {a.phone}</p>
              <p className="text-xs text-[#8E887E]">{a.addressLine}{a.landmark ? ` (${a.landmark})` : ""}</p>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-sm text-[#8E887E]">No saved addresses yet. Add one below.</p>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-[#D4CFC4] bg-[#FDFBF7] p-5">
          <h3 className="font-serif text-sm font-bold text-[#222222]">Add new address</h3>
          <form onSubmit={addAddress} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              name="label"
              placeholder="Label (Home / Office)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="rounded-xl border border-[#EAE5D9] bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-[#8E887E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51]"
            />
            <input
              name="recipientName"
              placeholder="Recipient name"
              required
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              className="rounded-xl border border-[#EAE5D9] bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-[#8E887E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51]"
            />
            <input
              name="phone"
              placeholder="98XXXXXXXX"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-[#EAE5D9] bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-[#8E887E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51]"
            />
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
              onAddressChange={handleAddressChange}
            />
            <input
              name="addressLine"
              placeholder="Full address (Tole, Ward)"
              required
              value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
              className="rounded-xl border border-[#EAE5D9] bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-[#8E887E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51] sm:col-span-2"
            />
            <input
              name="landmark"
              placeholder="Landmark (optional)"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className="rounded-xl border border-[#EAE5D9] bg-white px-3 py-2 text-sm text-[#222222] placeholder:text-[#8E887E] focus:outline-none focus:border-[#C86D51] focus:ring-1 focus:ring-[#C86D51] sm:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-[#666159] sm:col-span-2">
              <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded accent-[#C86D51]" /> Set as default
            </label>
            <button type="submit" className="rounded-xl bg-[#C86D51] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#B55B3F] transition-colors sm:col-span-2">
              Save Address
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
