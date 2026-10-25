import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { StorefrontLayout, RequireAuth, GuestOnly } from "@/components/guards";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/Feedback";

import Home from "@/pages/Home";
import Search from "@/pages/Search";
import CategoryDetail from "@/pages/CategoryDetail";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Wishlist from "@/pages/Wishlist";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailed from "@/pages/PaymentFailed";
import AccountOrders from "@/pages/AccountOrders";
import AccountOrderDetail from "@/pages/AccountOrderDetail";

import AdminLayout from "@/components/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminProductEditor from "@/pages/admin/AdminProductEditor";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminZones from "@/pages/admin/AdminZones";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminDrivers from "@/pages/admin/AdminDrivers";
import AdminSettings from "@/pages/admin/AdminSettings";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverHistory from "@/pages/driver/DriverHistory";

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireDriver({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "driver" && user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:slug" element={<CategoryDetail />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuth>
              <Wishlist />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestOnly>
              <ForgotPassword />
            </GuestOnly>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <GuestOnly>
              <ResetPassword />
            </GuestOnly>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders"
          element={
            <RequireAuth>
              <AccountOrders />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders/:id"
          element={
            <RequireAuth>
              <AccountOrderDetail />
            </RequireAuth>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductEditor />} />
        <Route path="products/:id" element={<AdminProductEditor />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="zones" element={<AdminZones />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="drivers" element={<AdminDrivers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route
        path="/driver"
        element={
          <RequireDriver>
            <DriverDashboard />
          </RequireDriver>
        }
      />
      <Route
        path="/driver/history"
        element={
          <RequireDriver>
            <DriverHistory />
          </RequireDriver>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}