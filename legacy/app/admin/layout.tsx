import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Ticket,
  Truck,
  Tags,
  Users,
} from "lucide-react";
import type { DynamicLayoutProps } from "@/lib/types";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/zones", label: "Delivery Zones", icon: Truck },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export default async function AdminLayout({ children }: DynamicLayoutProps) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-emerald-950 text-emerald-100 md:flex">
        <Link href="/" className="px-5 py-5 text-lg font-extrabold text-white">
Gharmai Kirana
          <span className="block text-xs font-normal text-emerald-400">Admin Panel</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-emerald-900"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-emerald-800 p-4 text-xs text-emerald-300">
          <Link href="/" className="hover:text-white">← View store</Link>
        </div>
      </aside>

      <div className="flex-1">
        <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 md:hidden">
          <Link href="/admin" className="font-extrabold text-emerald-800">Gharmai Kirana Admin</Link>
        </nav>
        <nav className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
              {l.label}
            </Link>
          ))}
        </nav>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}