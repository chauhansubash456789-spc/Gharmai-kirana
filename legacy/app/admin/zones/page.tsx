import { deleteZone } from "@/actions/admin";
import { ZoneForm } from "@/components/admin/ZoneForm";
import { listZones } from "@/services/zone.service";
import { Trash2 } from "lucide-react";

export default async function ZonesPage() {
  const zones = await listZones();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
      <p className="text-sm text-gray-500">
        Delivery is free when an order reaches a zone&apos;s &quot;free above&quot; amount.
        Recommended: Central Birgunj Rs. 0–20, nearby Rs. 20–40, outer areas Rs. 40–70.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          {zones.map((z, i) => (
            <div key={z.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <p className="font-bold text-gray-900">{i + 1}. {z.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Delivery Rs. {z.charge} · Free above Rs. {z.minOrderForFree}
                </p>
              </div>
              <div className="flex gap-2">
                <details className="relative">
                  <summary className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600">Edit</summary>
                  <div className="absolute right-0 top-9 z-10 w-72">
                    <ZoneForm zone={z} />
                  </div>
                </details>
                <form action={deleteZone.bind(null, z.id)}>
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
          {zones.length === 0 && <p className="text-sm text-gray-400">No zones yet. Add one to enable checkout.</p>}
        </div>

        <div>
          <ZoneForm />
        </div>
      </div>
    </div>
  );
}