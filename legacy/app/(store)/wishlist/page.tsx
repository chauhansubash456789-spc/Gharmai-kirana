import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { toCardData } from "@/lib/mappers";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getWishlistProducts } from "@/services/wishlist.service";

export const metadata = { title: "Wishlist — Gharmai Kirana" };

export default async function WishlistPage() {
  const user = await requireUser();
  const products = await getWishlistProducts(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
      <p className="mt-1 text-sm text-gray-500">{products.length} saved products</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500">No saved products yet. Tap the heart on any product to save it.</p>
          <Link href="/search" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">
            Browse products
          </Link>
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