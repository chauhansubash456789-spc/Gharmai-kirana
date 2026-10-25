import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { PriceTag } from "./PriceTag";
import { placeholderImage } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api/client";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    api
      .post<{ added: boolean }>("/api/wishlist/toggle", { productId: product.id })
      .then((res) => setWishlisted(Boolean(res.added)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  return (
    <div className="group flex flex-col rounded-xl border border-[#EAE5D9] bg-white p-3.5 transition-all duration-200 shadow-artisanal hover:border-[#C86D51]/50 hover:shadow-artisanal-hover">
      <Link to={`/product/${product.slug}`} className="flex flex-col">
        <div className="relative overflow-hidden rounded-lg bg-[#F7F4EE]">
          <img
            src={product.image || placeholderImage(product.name, product.categoryId)}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-103"
            width={400}
            height={400}
          />
          {Math.round(product.mrp - product.price) > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-[#EAA844] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
            </span>
          )}
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={loading}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white ${
              wishlisted ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug text-[#222222] font-serif group-hover:text-[#2C5E3B] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-[#666159] mt-0.5">{product.unit}</p>
        <div className="mt-2">
          <PriceTag mrp={product.mrp} price={product.price} size="sm" />
        </div>
      </Link>
      <div className="mt-2.5">
        <AddToCartButton id={product.id} stock={product.stock} />
      </div>
    </div>
  );
}