import { formatNPR } from "@/lib/format";

export function PriceTag({ mrp, price, size = "md" }: { mrp: number; price: number; size?: "sm" | "md" }) {
  const save = Math.round(mrp - price);
  return (
    <div>
      {save > 0 && (
        <div className="text-xs text-red-600 font-medium">
          You Save: Rs. {save.toLocaleString("en-IN")}
        </div>
      )}
      <div className="flex items-baseline gap-1.5">
        <span className={`font-semibold text-emerald-700 ${size === "sm" ? "text-sm" : "text-lg"}`}>
          {formatNPR(price)}
        </span>
        <span className={`text-gray-400 line-through ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {formatNPR(mrp)}
        </span>
      </div>
      {save > 0 && (
        <span className="mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-600">
          {Math.round((save / mrp) * 100)}% OFF
        </span>
      )}
    </div>
  );
}