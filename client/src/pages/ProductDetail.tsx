import { Link, useParams } from "react-router-dom";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { formatNPR, placeholderImage } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import type { Product } from "@/types";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { data: product, error, loading } = useAsync<Product>(
    () => api.get(`/api/products/${slug}`),
    [slug],
  );

  if (loading) return <Spinner label="Loading product..." />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorBox message={error ?? "Product not found."} />
      </div>
    );
  }

  const save = Math.round(product.mrp - product.price);
  const categoryId = product.category?.id ?? product.categoryId;
  const categorySlug = product.category?.slug;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <span className="mx-2">/</span>
        {categorySlug ? (
          <Link to={`/category/${categorySlug}`} className="hover:text-emerald-700">
            {product.category?.name}
          </Link>
        ) : (
          <span>Category</span>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <img
            src={product.image || placeholderImage(product.name, categoryId)}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          {product.brand && <p className="text-sm font-semibold text-[#8FA89B] uppercase tracking-wider">{product.brand}</p>}
          <h1 className="mt-1 text-2xl font-bold font-serif text-[#222222] sm:text-3xl tracking-tight">{product.name}</h1>
          <p className="mt-1 text-sm text-[#666159]">
            Unit: {product.unit}
            {product.sku ? ` · SKU: ${product.sku}` : ""}
          </p>

          {product.stock > 0 ? (
            <p className="mt-2.5 inline-block rounded-lg bg-[#EFF5F2] border border-[#C4D6CC] px-2.5 py-0.5 text-xs font-semibold text-[#2C5E3B]">
              In stock · {product.stock} available
            </p>
          ) : (
            <p className="mt-2.5 inline-block rounded-lg bg-[#F9ECE8] border border-[#F2D0C7] px-2.5 py-0.5 text-xs font-semibold text-[#C86D51]">
              Out of stock
            </p>
          )}

          <div className="mt-5 rounded-xl border border-[#EAE5D9] bg-white p-6 shadow-artisanal">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#2C5E3B] tracking-tight">{formatNPR(product.price)}</span>
              <span className="text-lg text-[#8E887E] line-through">{formatNPR(product.mrp)}</span>
              {save > 0 && (
                <span className="rounded-md bg-[#FDF6E9] border border-[#F3DFB7] px-2.5 py-0.5 text-xs font-bold text-[#B27318]">
                  {Math.round((save / product.mrp) * 100)}% OFF
                </span>
              )}
            </div>
            {save > 0 && (
              <p className="mt-2 text-sm font-semibold text-[#C86D51]">
                You Save: Rs. {save.toLocaleString("en-IN")} compared to retail price
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AddToCartButton id={product.id} stock={product.stock} />
              <WishlistButton productId={product.id} initial={false} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#EAE5D9] bg-white p-3.5 text-center shadow-artisanal">
              <Truck className="mx-auto h-6 w-6 text-[#2C5E3B]" />
              <p className="mt-1 text-xs font-semibold text-[#222222]">Same/Next Day</p>
              <p className="text-[11px] text-[#666159]">Delivery in Birgunj</p>
            </div>
            <div className="rounded-xl border border-[#EAE5D9] bg-white p-3.5 text-center shadow-artisanal">
              <ShieldCheck className="mx-auto h-6 w-6 text-[#2C5E3B]" />
              <p className="mt-1 text-xs font-semibold text-[#222222]">Genuine Products</p>
              <p className="text-[11px] text-[#666159]">Quality assured</p>
            </div>
            <div className="rounded-xl border border-[#EAE5D9] bg-white p-3.5 text-center shadow-artisanal">
              <RotateCcw className="mx-auto h-6 w-6 text-[#2C5E3B]" />
              <p className="mt-1 text-xs font-semibold text-[#222222]">Easy Return</p>
              <p className="text-[11px] text-[#666159]">Damaged items replaced</p>
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
