import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api, ApiError } from "@/api/client";
import { Spinner } from "@/components/Feedback";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<"verifying" | "paid" | "failed">("verifying");
  const [message, setMessage] = useState("");

  const orderId = params.get("orderId") ?? "";
  const data = params.get("data") ?? "";

  useEffect(() => {
    if (!orderId || !data) {
      setState("failed");
      setMessage("Payment details are missing. If money was deducted, contact us with your order number.");
      return;
    }
    let active = true;
    api
      .post<{ ok: boolean; paymentStatus: string }>("/api/payments/esewa/verify", {
        orderId: Number(orderId),
        data,
      })
      .then(() => {
        if (!active) return;
        clear();
        setState("paid");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setState("failed");
        setMessage(err instanceof ApiError ? err.message : "Could not verify your payment.");
      });
    return () => {
      active = false;
    };
  }, [orderId, data, clear]);

  if (state === "verifying") return <Spinner label="Verifying your eSewa payment..." />;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        {state === "paid" ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Payment successful</h1>
            <p className="mt-2 text-sm text-gray-500">
              Your eSewa payment is confirmed. We'll start packing your order right away.
            </p>
            <Link
              to={orderId ? `/account/orders/${orderId}?placed=1` : "/account/orders"}
              className="mt-6 block w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              View my order
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Payment not confirmed</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            {orderId && (
              <Link
                to={`/account/orders/${orderId}`}
                className="mt-6 block w-full rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800"
              >
                Check order status
              </Link>
            )}
            <Link to="/" className="mt-3 block text-sm font-semibold text-emerald-700 hover:underline">
              Continue shopping
            </Link>
          </>
        )}
      </div>
    </div>
  );
}