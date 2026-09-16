import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toCardData } from "@/lib/mappers";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getCategoryBySlug, getCategoryWithProducts } from "@/services/catalog.service";
import type { DynamicPageProps } from "@/lib/types";

export async function generateMetadata(props: DynamicPageProps<{ slug: string }>): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `${category.name} — Gharmai Kirana` : "Category" };
}

export default async function CategoryPage(props: DynamicPageProps<{ slug: string }>) {
  const { slug } = await props.params;
  const { category, products } = await getCategoryWithProducts(slug);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
      <p className="mt-1 text-sm text-gray-500">{products.length} products — lower than retail prices</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No products in this category yet. Check back soon.
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