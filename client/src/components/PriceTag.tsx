import { formatNPR } from "@/lib/format";

export function PriceTag({ mrp, price, size = "md" }: { mrp: number; price: number; size?: "sm" | "md" }) {
  const save = Math.round(mrp - price);
  return (
    <div>
      {save > 0 && (
        <div className="text-xs font-semibold text-[#D98510]">
          You Save: Rs. {save.toLocaleString("en-IN")}
        </div>
      )}
      <div className="flex items-baseline gap-1.5">
        <span className={`font-bold text-[#2C5E3B] tracking-tight ${size === "sm" ? "text-base" : "text-xl"}`}>
          {formatNPR(price)}
        </span>
        <span className={`text-[#8E887E] line-through ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {formatNPR(mrp)}
        </span>
      </div>
      {save > 0 && (
        <span className="mt-1 inline-block rounded-md bg-[#FDF6E9] border border-[#F3DFB7] px-2 py-0.5 text-[11px] font-bold text-[#B27318]">
          {Math.round((save / mrp) * 100)}% OFF
        </span>
      )}
    </div>
  );
}