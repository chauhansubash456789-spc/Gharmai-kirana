import { ORDER_STATUSES, STATUS_FLOW } from "@/lib/constants";
import { Check, X } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-[#FDF4E7] text-[#B87A1E] border-[#F3DFBC]",
    confirmed: "bg-[#F4F1EA] text-[#666159] border-[#D4CFC4]",
    packing: "bg-[#FEF7EC] text-[#D98510] border-[#FCE4B8]",
    out_for_delivery: "bg-[#EFF5F2] text-[#2C5E3B] border-[#C4D6CC]",
    delivered: "bg-[#EFF5F2] text-[#2C5E3B] border-[#C4D6CC]",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? colors.pending}`}>
      {ORDER_STATUSES[status] ?? status}
    </span>
  );
}

export function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200">
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
              <div className={`h-0.5 flex-1 ${i <= currentIndex ? "bg-[#2C5E3B]" : "bg-[#EAE5D9]"}`} />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                  done ? "border-[#2C5E3B] bg-[#2C5E3B] text-white" : "border-[#EAE5D9] bg-white text-[#8E887E]"
                } ${isCurrent ? "ring-4 ring-[#EFF5F2]" : ""}`}
              >
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <span className={`mt-1 whitespace-nowrap text-[11px] font-medium ${done ? "text-[#2C5E3B]" : "text-[#8E887E]"}`}>
                {ORDER_STATUSES[s]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}