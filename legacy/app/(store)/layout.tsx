import { CartProvider } from "@/components/cart/CartProvider";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { getSessionUser } from "@/lib/auth";
import type { DynamicLayoutProps } from "@/lib/types";

export default async function StoreLayout({ children }: DynamicLayoutProps) {
  const user = await getSessionUser();
  const navUser = user
    ? { id: user.id, name: user.name, phone: user.phone, role: user.role }
    : null;

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar user={navUser} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}