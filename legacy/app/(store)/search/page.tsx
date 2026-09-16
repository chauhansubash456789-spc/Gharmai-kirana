import type { Metadata } from "next";
import { toCardData } from "@/lib/mappers";
import { ProductCard } from "@/components/storefront/ProductCard";
import { searchProducts } from "@/services/catalog.service";
import type { DynamicPageProps } from "@/lib/types";

export const metadata: Metadata = {
  title: "All Products — Gharmai Kirana",
};

export default async function SearchPage(props: DynamicPageProps) {
  const q = (await props.searchParams).q ?? "";
  const search = typeof q === "string" ? q : "";
  const dealsOnly = (await props.searchParams).deals === "1";

  const products = await searchProducts(search, dealsOnly);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {search ? `Results for "${search}"` : dealsOnly ? "Today's Deals" : "All Products"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">{products.length} products found</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No products found{search ? ` for "${search}"` : ""}. Try a different search.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={toCardData(p)} />
          ))}
        </div>
      )}
    </div>
  );
}