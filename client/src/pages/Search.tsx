import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import type { Product } from "@/types";

export default function Search() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const dealsOnly = searchParams.get("deals") === "1";

  const { data: products, error, loading } = useAsync<Product[]>(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (dealsOnly) params.set("deals", "1");
    const qs = params.toString();
    return api.get(`/api/products${qs ? `?${qs}` : ""}`);
  }, [search, dealsOnly]);

  let title = "All Products";
  if (search) title = `Results for "${search}"`;
  else if (dealsOnly) title = "Today's Deals";

  if (loading) return <Spinner label="Searching..." />;
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
      <h1 className="text-3xl font-bold font-serif text-[#222222] tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-[#666159]">{list.length} products found</p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#EAE5D9] bg-white p-10 text-center text-[#666159] shadow-xs">
          No products found{search ? ` for "${search}"` : ""}. Try a different search.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
