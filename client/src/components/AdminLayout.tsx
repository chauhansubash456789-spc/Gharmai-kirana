import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Ticket,
  Truck,
  Tags,
  Users,
  Bike,
  Settings,
  LogOut,
} from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/zones", label: "Delivery Zones", icon: Truck },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/drivers", label: "Delivery Staff", icon: Bike },
  { to: "/admin/settings", label: "Store Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-emerald-950 text-emerald-100 md:flex">
        <Link to="/" className="px-5 py-5 text-lg font-extrabold text-white">
Gharmai Kirana
          <span className="block text-xs font-normal text-emerald-400">Admin Panel</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-emerald-900 ${isActive ? "bg-emerald-900 text-white" : ""}`
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-emerald-800 px-4 py-3 text-xs text-emerald-300 space-y-2">
          {user && (
            <p className="truncate">
              {user.name} <span className="text-emerald-500">· {user.role}</span>
            </p>
          )}
          <div className="flex items-center justify-between">
            <Link to="/" className="hover:text-white">← View store</Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-emerald-400 hover:text-white"
            >
              <LogOut className="h-3 w-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 md:hidden">
          <Link to="/admin" className="font-extrabold text-emerald-800">Gharmai Kirana Admin</Link>
          <button onClick={handleLogout} className="text-xs font-semibold text-red-600">Logout</button>
        </nav>
        <nav className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${isActive ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
