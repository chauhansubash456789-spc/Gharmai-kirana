import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatNPR } from "@/lib/format";
import { StatusBadge } from "@/components/shared/OrderStatus";
import { PAYMENT_METHODS } from "@/lib/constants";
import { listOrdersForUser } from "@/services/order.service";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
          <Link href="/search" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {o.createdAt.toLocaleDateString("en-GB")} · {PAYMENT_METHODS[o.paymentMethod] ?? o.paymentMethod}
                    {o.paymentStatus === "paid" ? " · Paid" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status} />
                  <p className="mt-1 font-bold text-emerald-700">{formatNPR(o.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}