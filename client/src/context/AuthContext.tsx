import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setStoredToken } from "@/api/client";

export interface User {
  id: number;
  name: string;
  phone: string;
  role: "customer" | "admin" | "driver";
  loyaltyPoints: number;
}

interface AuthResponse {
  user: User;
  token?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (name: string, phone: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await api.get<{ user: User }>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (phone: string, password: string) => {
    const res = await api.post<AuthResponse>("/api/auth/login", { phone, password });
    if (res.token) {
      setStoredToken(res.token);
    }
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name: string, phone: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>("/api/auth/register", { name, phone, email, password });
    if (res.token) {
      setStoredToken(res.token);
    }
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}