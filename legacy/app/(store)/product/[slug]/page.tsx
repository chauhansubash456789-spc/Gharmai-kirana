import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { formatNPR, placeholderImage } from "@/lib/format";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { getProductBySlug, getProductForMetadata } from "@/services/product.service";
import { isProductInWishlist } from "@/services/wishlist.service";
import type { DynamicPageProps } from "@/lib/types";

export async function generateMetadata(props: DynamicPageProps<{ slug: string }>): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductForMetadata(slug);
  return { title: product ? `${product.name} — Gharmai Kirana` : "Product" };
}

export default async function ProductPage(props: DynamicPageProps<{ slug: string }>) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  const user = await getSessionUser();

  if (!product || !product.active) notFound();

  const save = Math.round(product.mrp - product.price);
  const inWishlist = user != null && (await isProductInWishlist(user.id, product.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-700">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <img
            src={product.image || placeholderImage(product.name, product.categoryId)}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          {product.brand && <p className="text-sm font-medium text-gray-500">{product.brand}</p>}
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Unit: {product.unit} · SKU: {product.sku}</p>

          {product.stock > 0 ? (
            <p className="mt-2 inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              In stock · {product.stock} available
            </p>
          ) : (
            <p className="mt-2 inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
              Out of stock
            </p>
          )}

          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-emerald-700">{formatNPR(product.price)}</span>
              <span className="text-lg text-gray-400 line-through">{formatNPR(product.mrp)}</span>
              {save > 0 && (
                <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                  {Math.round((save / product.mrp) * 100)}% OFF
                </span>
              )}
            </div>
            {save > 0 && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                You Save: Rs. {save.toLocaleString("en-IN")} compared to retail price
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AddToCartButton id={product.id} stock={product.stock} />
              {user && <WishlistButton productId={product.id} initial={inWishlist} />}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <Truck className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-1 text-xs font-semibold">Same/Next Day</p>
              <p className="text-[11px] text-gray-500">Delivery in Birgunj</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-1 text-xs font-semibold">Genuine Products</p>
              <p className="text-[11px] text-gray-500">Quality assured</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
              <RotateCcw className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-1 text-xs font-semibold">Easy Return</p>
              <p className="text-[11px] text-gray-500">Damaged items replaced</p>
            </div>
          </div>

          {product.description && (
            <div className="mt-5">
              <h2 className="text-base font-bold text-gray-900">Description</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}