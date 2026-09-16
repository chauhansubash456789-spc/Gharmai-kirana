"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/admin";
import { ORDER_STATUSES, STATUS_FLOW } from "@/lib/constants";

export function OrderAdminPanel({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentAssignedTo,
}: {
  orderId: number;
  currentStatus: string;
  currentPaymentStatus: string;
  currentAssignedTo: string | null;
}) {
  const router = useRouter();
  const [assign, setAssign] = useState(currentAssignedTo ?? "");

  const flowButtons = STATUS_FLOW;

  const advance = (s: string) => {
    updateOrderStatus(orderId, s, currentPaymentStatus, assign).then(() => {
      router.refresh();
    });
  };

  const setPayment = (ps: string) => {
    updateOrderStatus(orderId, currentStatus, ps, assign).then(() => router.refresh());
  };

  const onSubmitAssign = (e: FormEvent) => {
    e.preventDefault();
    advance(currentStatus);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">Order Status</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {flowButtons.map((s) => (
            <button
              key={s}
              onClick={() => advance(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${currentStatus === s ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-emerald-500"}`}
            >
              {ORDER_STATUSES[s]}
            </button>
          ))}
          <button
            onClick={() => advance("cancelled")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${currentStatus === "cancelled" ? "border-red-600 bg-red-600 text-white" : "border-red-200 bg-white text-red-500 hover:border-red-400"}`}
          >
            Cancel Order
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900">Payment</h3>
        <div className="mt-2 flex gap-2">
          {["pending", "paid"].map((ps) => (
            <button
              key={ps}
              onClick={() => setPayment(ps)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${currentPaymentStatus === ps ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-600"}`}
            >
              {ps === "paid" ? "Paid" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmitAssign} className="flex gap-2">
        <input
          value={assign}
          onChange={(e) => setAssign(e.target.value)}
          placeholder="Assign delivery person name"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white">Save</button>
      </form>
    </div>
  );
}