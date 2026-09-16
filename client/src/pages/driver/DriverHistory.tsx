import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR, formatDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/constants";
import { Spinner } from "@/components/Feedback";
import type { Order } from "@/types";

const RANGES = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
] as const;

export default function DriverHistory() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("today");
  const { data: orders, loading } = useAsync<Order[]>(() => api.get(`/api/driver/history?range=${range}`), [range]);

  const list = orders ?? [];
  const delivered = list.filter((o) => o.status === "delivered");
  const cash = delivered.filter((o) => o.paymentMethod === "cod").reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-gray-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/driver" className="rounded-lg bg-gray-800 p-2 hover:bg-gray-700" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-bold">Order history &amp; earnings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`flex-1 rounded-lg border py-2 text-sm font-bold ${range === r.id ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600"}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs font-bold uppercase text-gray-400">Delivered</p>
            <p className="mt-1 text-xl font-extrabold text-gray-900">{delivered.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs font-bold uppercase text-gray-400">Cash (COD)</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-700">{formatNPR(cash)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs font-bold uppercase text-gray-400">Cancelled</p>
            <p className="mt-1 text-xl font-extrabold text-red-600">{list.length - delivered.length}</p>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading history..." />
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm font-medium text-gray-500">
            No deliveries in this period yet.
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((o) => (
              <div key={o.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-gray-900">{o.orderNumber}</span>
                  <span className={`font-bold ${o.status === "delivered" ? "text-emerald-600" : "text-red-500"}`}>
                    {o.status === "delivered" ? "DELIVERED" : "CANCELLED"}
                  </span>
                </div>
                <p className="mt-0.5 text-gray-500">
                  {o.customerName} · {formatNPR(o.total)} · {PAYMENT_METHODS[o.paymentMethod] ?? o.paymentMethod}
                </p>
                {o.deliveryNotes && <p className="text-xs text-gray-400">Note: {o.deliveryNotes}</p>}
                <p className="text-xs text-gray-400">{formatDate(o.updatedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}