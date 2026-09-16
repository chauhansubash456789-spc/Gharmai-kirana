import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Payment failed or cancelled</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your eSewa payment did not go through. No money was deducted from your order — you can try again from your
          order page.
        </p>
        {orderId && (
          <Link
            to={`/account/orders/${orderId}`}
            className="mt-6 block w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Try payment again
          </Link>
        )}
        <Link to="/" className="mt-3 block text-sm font-semibold text-emerald-700 hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}