import { toggleCoupon } from "@/actions/admin";
import { CouponForm } from "@/components/admin/CouponForm";
import { listCoupons } from "@/services/coupon.service";

export default async function CouponsPage() {
  const coupons = await listCoupons();
  const today = new Date();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt < today;
              return (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                  <div>
                    <p className="font-bold text-gray-900">
                      {c.code}
                      <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                        {c.type === "percent" ? `${c.value}%` : `Rs. ${c.value}`} off
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Min order {c.minOrder > 0 ? `Rs. ${c.minOrder}` : "none"}
                      {c.maxDiscount ? ` · max discount Rs. ${c.maxDiscount}` : ""}
                      {c.usageLimit ? ` · ${c.usedCount}/${c.usageLimit} used` : ` · used ${c.usedCount}x`}
                      {c.expiresAt ? ` · expires ${c.expiresAt.toLocaleDateString("en-GB")}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${expired ? "bg-gray-100 text-gray-400" : c.active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {expired ? "Expired" : c.active ? "Active" : "Disabled"}
                    </span>
                    {!expired && (
                      <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
            {coupons.length === 0 && <p className="text-sm text-gray-400">No coupons yet.</p>}
          </div>
        </div>

        <div>
          <CouponForm />
        </div>
      </div>
    </div>
  );
}