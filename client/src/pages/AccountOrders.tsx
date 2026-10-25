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
        <h1 className="font-serif text-2xl font-bold text-[#222222]">My Orders</h1>
        <div className="mt-6">
          <EmptyBox emoji="📦" message="You haven't placed any orders yet." />
          <div className="text-center">
            <Link to="/search" className="mt-4 inline-block rounded-xl bg-[#C86D51] px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-[#B55B3F] transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#222222]">My Orders</h1>
      <div className="mt-5 space-y-3">
        {list.map((o) => (
          <Link
            key={o.id}
            to={`/account/orders/${o.id}`}
            className={`block rounded-xl border p-5 shadow-artisanal transition hover:shadow-md ${
              o.status === "cancelled"
                ? "border-red-200 bg-red-50/30 hover:border-red-300"
                : "border-[#EAE5D9] bg-white hover:border-[#C4D6CC]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-serif font-bold text-[#222222]">{o.orderNumber}</p>
                  {/* Task 2: Confirmed vs Cancelled */}
                  {o.status === "cancelled" ? (
                    <span className="rounded-md bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-700">
                      Order Cancelled
                    </span>
                  ) : (
                    <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700">
                      Your order is confirmed
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#8E887E]">
                  {formatDate(o.createdAt)} · {PAYMENT_METHODS[o.paymentMethod] ?? o.paymentMethod}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Task 3: Paid vs Not Paid */}
                  {o.paymentStatus === "paid" ? (
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      ✓ Your order is paid
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
                      ✕ Your order is not paid
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={o.status} />
                <p className="mt-1.5 font-bold text-[#2C5E3B]">{formatNPR(o.total)}</p>
                {o.paymentStatus !== "paid" && o.status !== "cancelled" && (
                  <span className="mt-2 inline-block rounded-lg bg-[#C86D51] px-3 py-1 text-xs font-bold text-white shadow-xs">
                    Proceed to Pay →
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
