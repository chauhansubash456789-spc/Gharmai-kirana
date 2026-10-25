import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";
import { api } from "@/api/client";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { formatNPR } from "@/lib/format";
import type { Category } from "@/types";

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { freeDeliveryThreshold } = useStoreConfig();

  useEffect(() => {
    api
      .get<Category[]>("/api/categories")
      .then((c) => setCategories(c.slice(0, 8)))
      .catch(() => undefined);
  }, []);

  return (
    <footer className="mt-16 bg-[#1D4028] text-[#EAE5D9] border-t border-[#2C5E3B]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-white font-serif tracking-tight">{STORE_NAME}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#D2CBBF]">{STORE_TAGLINE}</p>
            <p className="mt-3 text-sm text-[#8FA89B]">
              Online grocery delivery in Birgunj at prices lower than local retail shops.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAA844]">
              Categories
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAA844]">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAA844]">
              Delivery
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#D2CBBF]">
              <li>Same day / next day delivery in Birgunj</li>
              <li>Free delivery above {formatNPR(freeDeliveryThreshold)}</li>
              <li>Cash on Delivery &amp; QR payment</li>
              <li>WhatsApp: +977 9800000000</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-[#2C5E3B] pt-6 text-center text-xs text-[#8FA89B]">
          © {new Date().getFullYear()} {STORE_NAME}, Birgunj, Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}