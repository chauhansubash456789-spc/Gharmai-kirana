import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, Heart, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { STORE_NAME } from "@/lib/constants";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { formatNPR } from "@/lib/format";

export function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { freeDeliveryThreshold } = useStoreConfig();
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
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md shadow-xs border-b border-[#EAE5D9]">
      <div className="bg-[#1C1B18] px-4 py-1.5 text-center text-xs font-semibold text-[#F29C1B] flex items-center justify-center gap-2">
        <span>घरमै किराना, पसलभन्दा सस्तो मूल्यमा।</span>
        <span className="hidden sm:inline opacity-70">•</span>
        <span className="hidden sm:inline">
          Same day doorstep delivery in Birgunj • Free above {formatNPR(freeDeliveryThreshold)}
        </span>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button
          className="rounded-lg p-1.5 lg:hidden text-[#222222] hover:bg-[#F7F4EE]"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
          type="button"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F29C1B] text-xl font-black text-black shadow-xs">
            G
          </span>
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#2C5E3B] leading-none font-serif">
              Gharmai
            </span>
            <span className="text-[10px] font-semibold text-[#666159] tracking-wider uppercase">
              घरमै किराना • Birgunj
            </span>
          </div>
        </Link>

        {/* Localized delivery pill */}
        <Link
          to={user ? "/account" : "/login"}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF5F2] text-xs text-[#2C5E3B] hover:bg-[#E2ECE7] transition-colors border border-[#C4D6CC]"
        >
          <span className="material-symbols-outlined text-[16px] text-[#2C5E3B]">location_on</span>
          <span className="truncate max-w-[180px]"><span className="font-bold">Deliver to:</span> Birgunj, Ward 8</span>
        </Link>

        <form
          className="max-w-xl flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
            navigate(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
          }}
        >
          <div className="flex items-center rounded-xl border border-[#EAE5D9] bg-[#FFFFFF] px-3.5 py-2 shadow-xs transition-colors focus-within:border-[#F29C1B]">
            <Search className="h-4 w-4 text-[#8E887E]" />
            <input
              name="q"
              placeholder="Search rice, dal, oil..."
              className="ml-2 w-full bg-transparent text-sm text-[#222222] outline-none placeholder:text-[#8E887E]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className={`relative rounded-xl p-2 text-[#222222] hover:bg-[#F7F4EE] transition-colors ${isActive("/cart") ? "bg-[#F7F4EE]" : ""}`}
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6 text-[#2C5E3B]" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-lg bg-[#F29C1B] px-1 text-xs font-bold text-black shadow-xs">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserOpen((o) => !o)}
                type="button"
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[#F7F4EE] transition-colors"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2C5E3B] text-sm font-bold text-white shadow-xs">
                  {user.name[0]?.toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-[#222222] sm:block">{user.name}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-[#EAE5D9] bg-white py-2 shadow-lg">
                  <Link
                    to={user.role === "admin" ? "/admin" : "/account"}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#222222] hover:bg-[#FDFBF7]"
                  >
                    <User className="h-4 w-4 text-[#2C5E3B]" /> {user.role === "admin" ? "Admin Panel" : "My Account"}
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#222222] hover:bg-[#FDFBF7]"
                  >
                    <Package className="h-4 w-4 text-[#2C5E3B]" /> My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#222222] hover:bg-[#FDFBF7]"
                  >
                    <Heart className="h-4 w-4 text-[#F29C1B]" /> Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void logout().then(() => navigate("/"));
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-[#D98510] hover:bg-[#FEF7EC]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-[#F29C1B] px-4 py-2 text-sm font-bold text-black shadow-xs hover:bg-[#D98510] transition-all"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-[#EAE5D9] bg-[#FDFBF7] px-4 py-2 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${isActive(l.href) ? "text-[#D98510] font-semibold" : "text-[#222222]"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}