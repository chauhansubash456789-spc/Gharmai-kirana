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
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#222222]">Your Wishlist</h1>
      <p className="mt-1 text-sm text-[#8E887E]">{list.length} saved products</p>

      {list.length === 0 ? (
        <div className="mt-10">
          <EmptyBox emoji="🤍" message="No saved products yet. Tap the heart on any product to save it." />
          <div className="text-center">
            <Link to="/search" className="mt-4 inline-block rounded-xl bg-[#C86D51] px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-[#B55B3F] transition-colors">
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
