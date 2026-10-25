import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-[#EAE5D9] bg-white p-8 text-center shadow-artisanal">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-3 font-serif text-2xl font-bold text-[#222222]">Payment failed or cancelled</h1>
        <p className="mt-2 text-sm text-[#666159]">
          Your eSewa payment did not go through. No money was deducted from your order — you can try again from your
          order page.
        </p>
        {orderId && (
          <Link
            to={`/account/orders/${orderId}`}
            className="mt-6 block w-full rounded-xl bg-[#C86D51] py-3 font-semibold text-white shadow-sm hover:bg-[#B55B3F] transition-colors"
          >
            Try payment again
          </Link>
        )}
        <Link to="/" className="mt-3 block text-sm font-semibold text-[#2C5E3B] hover:text-[#C86D51] transition-colors">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}