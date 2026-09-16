import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";
import { api } from "@/api/client";
import type { Category } from "@/types";

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<Category[]>("/api/categories")
      .then((c) => setCategories(c.slice(0, 8)))
      .catch(() => undefined);
  }, []);

  return (
    <footer className="mt-12 bg-emerald-950 text-emerald-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-white">{STORE_NAME}</h3>
            <p className="mt-2 text-sm leading-relaxed text-emerald-200">{STORE_TAGLINE}</p>
            <p className="mt-3 text-sm text-emerald-300">
              Online grocery delivery in Birgunj at prices lower than local retail shops.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Categories
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white">All Products</Link></li>
              <li><Link to="/account/orders" className="hover:text-white">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              <li><Link to="/login" className="hover:text-white">Login / Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Delivery
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Same day / next day delivery in Birgunj</li>
              <li>Free delivery above Rs. 5,000</li>
              <li>Cash on Delivery &amp; QR payment</li>
              <li>WhatsApp: +977 9800000000</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-emerald-800 pt-4 text-center text-xs text-emerald-300">
          © {new Date().getFullYear()} {STORE_NAME}, Birgunj, Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}