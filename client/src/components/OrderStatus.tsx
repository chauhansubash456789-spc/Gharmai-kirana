import { ORDER_STATUSES, STATUS_FLOW } from "@/lib/constants";
import { Check, X } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-sky-50 text-sky-700 border-sky-200",
    packing: "bg-violet-50 text-violet-700 border-violet-200",
    out_for_delivery: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? colors.pending}`}>
      {ORDER_STATUSES[status] ?? status}
    </span>
  );
}

export function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        <X className="h-5 w-5" /> This order was cancelled.
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);
  return (
    <div className="flex items-center">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={s} className={`flex items-center ${i > 0 ? "flex-1" : ""}`}>
            {i > 0 && (
              <div className={`h-0.5 flex-1 ${i <= currentIndex ? "bg-emerald-600" : "bg-gray-200"}`} />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                  done ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-300"
                } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
              >
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <span className={`mt-1 whitespace-nowrap text-[11px] font-medium ${done ? "text-emerald-700" : "text-gray-400"}`}>
                {ORDER_STATUSES[s]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}