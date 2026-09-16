import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, Heart, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { STORE_NAME } from "@/lib/constants";

export function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "All Products" },
    { href: "/wishlist", label: "Wishlist" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-emerald-700 px-4 py-1.5 text-center text-xs font-medium text-white">
        घरमै किराना, पसलभन्दा सस्तो मूल्यमा। — Free delivery on orders above Rs. 5,000
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button
          className="rounded p-1 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
          type="button"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-lg font-bold text-white">
            G
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-emerald-800 sm:block">
            {STORE_NAME}
          </span>
        </Link>

        <form
          className="max-w-xl flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
            navigate(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
          }}
        >
          <div className="flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              name="q"
              placeholder="Search rice, dal, oil..."
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className={`relative rounded-full p-2 hover:bg-gray-100 ${isActive("/cart") ? "bg-gray-100" : ""}`}
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserOpen((o) => !o)}
                type="button"
                className="flex items-center gap-2 rounded-full p-1.5 hover:bg-gray-100"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {user.name[0]?.toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  <Link
                    to={user.role === "admin" ? "/admin" : "/account"}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" /> {user.role === "admin" ? "Admin Panel" : "My Account"}
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void logout().then(() => navigate("/"));
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-2 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${isActive(l.href) ? "text-emerald-700" : "text-gray-700"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}