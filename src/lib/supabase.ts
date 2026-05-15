import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const url = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "").trim().replace(/\/+$/, "");
const key = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  ""
).trim();

export const isSupabaseConfigured = Boolean(url && key && /^https:\/\/[^\s.]+\.supabase\.co$/.test(url));

export const supabase = createClient<Database>(
  isSupabaseConfigured ? url : "https://placeholder.supabase.co",
  isSupabaseConfigured ? key : "placeholder-anon-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
