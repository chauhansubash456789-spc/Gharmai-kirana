import { requireUser } from "@/lib/auth";
import { addAddress, setDefaultAddress, deleteAddress } from "@/actions/addresses";
import { listAddressesForUser } from "@/services/address.service";
import { Star, Trash2, Plus } from "lucide-react";

export default async function AccountPage() {
  const user = await requireUser();
  const addresses = await listAddressesForUser(user.id);

  return (
    <div className="space-y-6">
      {/* Profile */}
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
      </section>

      {/* Addresses */}
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
                    <form action={setDefaultAddress.bind(null, a.id)}>
                      <button className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Make default">
                        <Star className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, a.id)}>
                    <button className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
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
          <form action={addAddress} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="label" placeholder="Label (Home / Office)" defaultValue="Home" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="recipientName" placeholder="Recipient name" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="phone" placeholder="98XXXXXXXX" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="addressLine" placeholder="Full address (Tole, Ward)" required className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="landmark" placeholder="Landmark (optional)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="isDefault" className="accent-emerald-600" /> Set as default
            </label>
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 sm:col-span-2">
              Save Address
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}