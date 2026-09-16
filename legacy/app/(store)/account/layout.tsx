import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { User, Package, Heart } from "lucide-react";
import type { DynamicLayoutProps } from "@/lib/types";

export default async function AccountLayout({ children }: DynamicLayoutProps) {
  await requireUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 lg:sticky lg:top-24">
          <nav className="space-y-1 text-sm font-medium">
            <Link href="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
              <User className="h-4 w-4" /> My Profile
            </Link>
            <Link href="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
              <Package className="h-4 w-4" /> My Orders
            </Link>
            <Link href="/wishlist" className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
              <Heart className="h-4 w-4" /> Wishlist
            </Link>
          </nav>
        </aside>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}