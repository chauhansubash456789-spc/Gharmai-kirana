import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR } from "@/lib/format";
import { Spinner, ErrorBox } from "@/components/Feedback";
import {
  Truck,
  ShoppingBag,
  Store,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
} from "lucide-react";
import type { StoreSettings } from "@/types";

const PRESET_THRESHOLDS = [499, 799, 999, 1499, 1999];

export default function AdminSettings() {
  const { data: settings, error, loading, reload } = useAsync<StoreSettings>(() =>
    api.get("/api/admin/settings")
  );

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<string>("999");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("199");
  const [storeName, setStoreName] = useState<string>("Gharmai Kirana — Birgunj");
  const [storePhone, setStorePhone] = useState<string>("+977-9800000000");
  const [openHours, setOpenHours] = useState<string>("6:00 AM – 9:00 PM");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setFreeDeliveryThreshold(String(settings.freeDeliveryThreshold ?? 999));
      setMinOrderAmount(String(settings.minOrderAmount ?? 199));
      setStoreName(settings.storeName ?? "Gharmai Kirana — Birgunj");
      setStorePhone(settings.storePhone ?? "+977-9800000000");
      setOpenHours(settings.openHours ?? "6:00 AM – 9:00 PM");
    }
  }, [settings]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    const thresholdNum = Number(freeDeliveryThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      setErrorMessage("Please enter a valid free delivery threshold amount (0 or greater).");
      setSaving(false);
      return;
    }

    try {
      await api.put("/api/admin/settings", {
        freeDeliveryThreshold: thresholdNum,
        minOrderAmount: Number(minOrderAmount) || 0,
        storeName: storeName.trim(),
        storePhone: storePhone.trim(),
        openHours: openHours.trim(),
      });
      setSaveSuccess(true);
      reload();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update store settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) return <Spinner label="Loading store settings..." />;
  if (error && !settings) return <ErrorBox message={error} />;

  const parsedThreshold = Number(freeDeliveryThreshold) || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Store Settings & Policies
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          पसलको नीति, निःशुल्क डेलिभरी सीमा, र आधारभूत जानकारी व्यवस्थित गर्नुहोस्।
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm transition-all animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Settings saved successfully!</span> Free delivery threshold updated to{" "}
            <strong>{formatNPR(parsedThreshold)}</strong> across all Birgunj delivery zones, website headers, and mobile apps.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Free Delivery Threshold Spotlight Card */}
        <div className="overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <Sparkles className="h-3 w-3" /> Core Delivery Rule
                </span>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  निःशुल्क डेलिभरी सीमा (Free Delivery Above Rs.)
                </h2>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-medium text-gray-400">Current live threshold</span>
              <p className="text-xl font-black text-emerald-700">{formatNPR(parsedThreshold)}</p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
            वीरगञ्ज महानगरपालिका भित्र सम्पूर्ण अर्डरमा लागु — When a customer cart reaches or exceeds this amount, delivery fee automatically drops to <strong>रु. 0 (FREE)</strong> during checkout.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="relative">
              <label htmlFor="freeDeliveryInput" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Free Delivery Above (रु. / NPR)
              </label>
              <div className="relative mt-1.5 flex items-center rounded-xl border-2 border-gray-300 bg-white shadow-inner focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
                <span className="pl-4 pr-2 font-bold text-gray-500 select-none">रु.</span>
                <input
                  id="freeDeliveryInput"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  placeholder="999"
                  className="w-full bg-transparent py-3 pr-4 text-xl font-extrabold text-emerald-950 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-medium text-gray-500">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_THRESHOLDS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFreeDeliveryThreshold(String(amt))}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      parsedThreshold === amt
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-800"
                    }`}
                  >
                    रु. {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-100/60 p-3 text-xs text-emerald-900 flex items-center gap-2">
            <span className="font-bold">⚡ Storewide Sync:</span>
            <span>
              Saving this will automatically update all Birgunj ward zones, storefront banner &quot;Free above Rs. {parsedThreshold}&quot;, and mobile app cart milestones.
            </span>
          </div>
        </div>

        {/* Minimum Order Amount */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                न्यूनतम अर्डर रकम (Minimum Order Requirement)
              </h2>
              <p className="text-xs text-gray-500">
                यसभन्दा कम रकमको अर्डर ग्राहकले दिन सक्दैनन् (Minimum basket size to proceed with checkout)
              </p>
            </div>
          </div>

          <div className="max-w-xs">
            <div className="relative flex items-center rounded-xl border border-gray-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20">
              <span className="pl-3 pr-2 font-bold text-gray-500 select-none text-sm">रु.</span>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="199"
                className="w-full bg-transparent py-2.5 pr-3 text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Store Profile Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                पसलको जानकारी (Store Profile & Contact)
              </h2>
              <p className="text-xs text-gray-500">
                Displayed in order receipts, invoice headers, and customer support links
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">Store Name</label>
              <div className="relative mt-1 flex items-center rounded-lg border border-gray-300 px-3 py-2 focus-within:border-emerald-600">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">Support Phone</label>
              <div className="relative mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-emerald-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">Delivery Working Hours</label>
              <div className="relative mt-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-emerald-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  className="w-full text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Settings / सुरक्षित गर्नुहोस्"}
          </button>
        </div>
      </form>
    </div>
  );
}
