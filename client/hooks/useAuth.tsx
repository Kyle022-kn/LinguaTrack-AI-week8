import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "learner" | "admin";

export type User = {
  email: string;
  name?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: User | null;
  login: (args: { email: string; password: string; role: UserRole; name?: string }) => void;
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

  const login = useCallback((args: { email: string; password: string; role: UserRole; name?: string }) => {
    const { email, role, name } = args;
    const u: User = { email, role, name: name || email.split("@")[0] };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
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
