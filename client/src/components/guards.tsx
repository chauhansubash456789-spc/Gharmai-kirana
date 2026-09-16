import { Outlet, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartProvider } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "./Feedback";

export function StorefrontLayout() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking session..." />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Checking session..." />;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : user.role === "driver" ? "/driver" : "/"} replace />;
  return <>{children}</>;
}