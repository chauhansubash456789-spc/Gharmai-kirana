import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Spinner, ErrorBox, EmptyBox } from "@/components/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import type { Product } from "@/types";

export default function Wishlist() {
  const { data: products, error, loading } = useAsync<Product[]>(
    () => api.get("/api/wishlist"),
    [],
  );

  if (loading) return <Spinner label="Loading wishlist..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorBox message={error} />
      </div>
    );
  }

  const list = products ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
      <p className="mt-1 text-sm text-gray-500">{list.length} saved products</p>

      {list.length === 0 ? (
        <div className="mt-10">
          <EmptyBox emoji="🤍" message="No saved products yet. Tap the heart on any product to save it." />
          <div className="text-center">
            <Link to="/search" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">
              Browse products
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
