import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSupabase } from "@/lib/supabase";

export type UserRole = "learner" | "admin";

export type User = {
  email: string;
  name?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: User | null;
  login: (args: { email: string; password: string }) => Promise<boolean>;
  register: (args: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }) => Promise<boolean>;
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,name,email")
    .eq("id", authed.id)
    .single();
  return {
    email: profile?.email || authed.email || "",
    role: (profile?.role as UserRole) || "learner",
    name: profile?.name || undefined,
  };
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
      return () => {
        sub.subscription.unsubscribe();
      };
    }
  }, []);

  const login = useCallback(
    async (args: { email: string; password: string }) => {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: args.email,
          password: args.password,
        });
        if (error) return false;
        const u = await loadProfile();
        if (!u) return false;
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return true;
      }
      const { verify } = await import("@/lib/authStore");
      const found = await verify(args.email, args.password);
      if (!found) return false;
      const u: User = {
        email: found.email,
        role: found.role,
        name: found.name,
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return true;
    },
    [],
  );

  const register = useCallback(
    async (args: {
      email: string;
      password: string;
      role: UserRole;
      name: string;
    }) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: args.email,
          password: args.password,
        });
        if (error || !data.user) return false;
        await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: args.email,
            role: args.role,
            name: args.name,
          })
          .select();
        const u: User = { email: args.email, role: args.role, name: args.name };
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return true;
      }
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
    },
    [],
  );

  const logout = useCallback(() => {
    const supabase = getSupabase();
    if (supabase) supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
