import { useParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import type { Category, Product } from "@/types";

interface CategoryPayload {
  category: Category;
  products: Product[];
}

export default function CategoryDetail() {
  const { slug = "" } = useParams();
  const { data, error, loading } = useAsync<CategoryPayload>(
    () => api.get(`/api/categories/${slug}`),
    [slug],
  );

  if (loading) return <Spinner label="Loading category..." />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorBox message={error ?? "Category not found."} />
      </div>
    );
  }

  const { category, products } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold font-serif text-[#222222] tracking-tight">{category.name}</h1>
      <p className="mt-1 text-sm text-[#666159]">{products.length} products — lower than retail prices</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#EAE5D9] bg-white p-10 text-center text-[#666159] shadow-xs">
          No products in this category yet. Check back soon.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
