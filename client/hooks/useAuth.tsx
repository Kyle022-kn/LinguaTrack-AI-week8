import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type UserRole = "learner" | "admin";

export type User = {
  email: string;
  name?: string;
  role: UserRole;
};

type AuthResult = { success: true } | { success: false; error: string };

type AuthContextValue = {
  user: User | null;
  login: (args: { email: string; password: string }) => Promise<AuthResult>;
  register: (args: { email: string; password: string; role: UserRole; name: string }) => Promise<AuthResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ltai_user";

async function loadProfile(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
  const { data: userRes } = await supabase.auth.getUser();
  const authed = userRes?.user;
  if (!authed) return null;
  const { data: profile } = await supabase.from("profiles").select("role,name,email").eq("id", authed.id).single();
  return { email: profile?.email || authed.email || "", role: (profile?.role as UserRole) || "learner", name: profile?.name || undefined };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadProfile().then((u) => u && setUser(u));
    const supabase = getSupabase();
    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange(async () => {
        const u = await loadProfile();
        setUser(u);
        if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        else localStorage.removeItem(STORAGE_KEY);
      });
      return () => { sub.subscription.unsubscribe(); };
    }
  }, []);

  const login = useCallback(async (args: { email: string; password: string }): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: args.email, password: args.password });
      if (error) return { success: false as const, error: error.message };
      const u = await loadProfile();
      if (!u) return { success: false as const, error: "Failed to load profile" };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { success: true as const };
    }
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: args.email, password: args.password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false as const, error: error.error || "Login failed" };
      }
      
      const data = await response.json();
      if (data.sessionToken) {
        localStorage.setItem("ltai_session", data.sessionToken);
      }
      
      const u: User = { 
        email: data.user.email, 
        role: data.user.role as UserRole, 
        name: data.user.name 
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { success: true as const };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false as const, error: "Network error. Please try again" };
    }
  }, []);

  const register = useCallback(async (args: { email: string; password: string; role: UserRole; name: string }): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email: args.email, password: args.password });
      if (error || !data.user) return { success: false as const, error: error?.message || "Registration failed" };
      await supabase.from("profiles").upsert({ id: data.user.id, email: args.email, role: args.role, name: args.name }).select();
      const u: User = { email: args.email, role: args.role, name: args.name };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { success: true as const };
    }
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: args.email, 
          password: args.password,
          name: args.name,
          role: args.role 
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false as const, error: error.error || "Registration failed" };
      }
      
      const data = await response.json();
      if (data.sessionToken) {
        localStorage.setItem("ltai_session", data.sessionToken);
      }
      
      const u: User = { 
        email: data.user.email, 
        role: data.user.role as UserRole, 
        name: data.user.name 
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return { success: true as const };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false as const, error: "Network error. Please try again" };
    }
  }, []);

  const logout = useCallback(() => {
    const supabase = getSupabase();
    if (supabase) supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("ltai_session");
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
