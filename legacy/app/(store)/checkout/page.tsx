import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { listAddressesForUser } from "@/services/address.service";
import { listZones } from "@/services/zone.service";

export const metadata: Metadata = { title: "Checkout — Gharmai Kirana" };

export default async function CheckoutPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const [zones, addresses] = await Promise.all([
    listZones(),
    listAddressesForUser(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>
      <CheckoutForm
        zones={zones.map((z) => ({ id: z.id, name: z.name, charge: z.charge, minOrderForFree: z.minOrderForFree }))}
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          recipientName: a.recipientName,
          phone: a.phone,
          addressLine: a.addressLine,
          landmark: a.landmark,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}