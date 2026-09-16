import { Link } from "react-router-dom";
import { AddToCartButton } from "./AddToCartButton";
import { PriceTag } from "./PriceTag";
import { placeholderImage } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
      <Link to={`/product/${product.slug}`} className="flex flex-col">
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image || placeholderImage(product.name, product.categoryId)}
            alt={product.name}
            className="aspect-square w-full object-cover"
            width={400}
            height={400}
          />
          {Math.round(product.mrp - product.price) > 0 && (
            <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-gray-800">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400">{product.unit}</p>
        <div className="mt-1.5">
          <PriceTag mrp={product.mrp} price={product.price} size="sm" />
        </div>
      </Link>
      <div className="mt-2">
        <AddToCartButton id={product.id} stock={product.stock} />
      </div>
    </div>
  );
}