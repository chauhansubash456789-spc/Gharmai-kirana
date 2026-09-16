import QRCode from "react-qr-code";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import { formatNPR } from "@/lib/format";

export default function MerchantQr({ amount }: { amount?: number }) {
  const { data, error, loading } = useAsync<{ merchantName: string; qrPayload: string }>(() =>
    api.get("/api/payments/merchant-qr"),
  );

  if (loading) return <p className="text-xs text-gray-400">Loading payment QR...</p>;
  if (error || !data) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
      <div className="mx-auto w-fit bg-white p-2">
        <QRCode value={data.qrPayload} size={160} />
      </div>
      <p className="mt-2 text-sm font-bold text-gray-900">{data.merchantName}</p>
      {amount != null && amount > 0 && (
        <p className="text-sm font-semibold text-emerald-700">Pay exactly {formatNPR(amount)}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">Scan with eSewa, Khalti or any FonePay app, then place your order.</p>
    </div>
  );
}