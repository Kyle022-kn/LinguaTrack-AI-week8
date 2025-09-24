import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "learner" | "admin";

export type User = {
  email: string;
  name?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: User | null;
  login: (args: { email: string; password: string }) => Promise<boolean>;
  register: (args: { email: string; password: string; role: UserRole; name: string }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ltai_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = useCallback(async (args: { email: string; password: string }) => {
    const { verify, getUser } = await import("@/lib/authStore");
    const found = await verify(args.email, args.password);
    if (!found) return false;
    const u: User = { email: found.email, role: found.role, name: found.name };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return true;
  }, []);

  const register = useCallback(async (args: { email: string; password: string; role: UserRole; name: string }) => {
    const { addUser } = await import("@/lib/authStore");
    try {
      await addUser(args);
      const u: User = { email: args.email, role: args.role, name: args.name };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
