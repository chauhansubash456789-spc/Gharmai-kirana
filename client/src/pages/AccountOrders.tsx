import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/OrderStatus";
import { Spinner, ErrorBox, EmptyBox } from "@/components/Feedback";
import { formatNPR, formatDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/constants";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import type { Order } from "@/types";

export default function AccountOrders() {
  const { data: orders, error, loading } = useAsync<Order[]>(() => api.get("/api/orders"), []);

  if (loading) return <Spinner label="Loading orders..." />;
  if (error) return <ErrorBox message={error} />;

  const list = orders ?? [];

  if (list.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <div className="mt-6">
          <EmptyBox emoji="📦" message="You haven't placed any orders yet." />
          <div className="text-center">
            <Link to="/search" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      <div className="mt-5 space-y-3">
        {list.map((o) => (
          <Link
            key={o.id}
            to={`/account/orders/${o.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900">{o.orderNumber}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(o.createdAt)} · {PAYMENT_METHODS[o.paymentMethod] ?? o.paymentMethod}
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
    </div>
  );
}
