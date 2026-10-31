import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";
import { api } from "@/api/client";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { formatNPR } from "@/lib/format";
import type { Category } from "@/types";

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { freeDeliveryThreshold, storeName, storePhone } = useStoreConfig();

  useEffect(() => {
    api
      .get<Category[]>("/api/categories")
      .then((c) => setCategories(c.slice(0, 8)))
      .catch(() => undefined);
  }, []);

  return (
    <footer className="mt-16 bg-[#F29C1B] text-black border-t border-[#D98510]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-black font-serif tracking-tight">{storeName || STORE_NAME}</h3>
            <p className="mt-2 text-sm leading-relaxed text-black/85 font-medium">{STORE_TAGLINE}</p>
            <p className="mt-3 text-sm text-black/75">
              Online grocery delivery in Birgunj at prices lower than local retail shops.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              Categories
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-black/80 font-medium">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className="hover:text-black hover:underline transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-black/80 font-medium">
              <li><Link to="/search" className="hover:text-black hover:underline transition-colors">All Products</Link></li>
              <li><Link to="/account/orders" className="hover:text-black hover:underline transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-black hover:underline transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-black hover:underline transition-colors">Cart</Link></li>
              <li><Link to="/login" className="hover:text-black hover:underline transition-colors">Login / Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              Delivery
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-black/80 font-medium">
              <li>Same day / next day delivery in Birgunj</li>
              <li>Free delivery above {formatNPR(freeDeliveryThreshold)}</li>
              <li>Cash on Delivery &amp; QR payment</li>
              <li>Phone / WhatsApp: {storePhone || "+977 9800000000"}</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-black/15 pt-6 text-center text-xs text-black/75 font-medium">
          © {new Date().getFullYear()} {storeName || STORE_NAME}, Birgunj, Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}