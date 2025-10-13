import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON as string | undefined;
  if (!url || !anon) return null;
  if (!supabase) supabase = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
  return supabase;
}
