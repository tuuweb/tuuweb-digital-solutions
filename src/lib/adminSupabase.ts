import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const ADMIN_PASSWORD_KEY = "tuuweb_admin_password";

const url = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "").trim().replace(/\/+$/, "");
const key = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  ""
).trim();

export const getStoredAdminPassword = () =>
  typeof window === "undefined" ? "" : window.sessionStorage.getItem(ADMIN_PASSWORD_KEY) ?? "";

export const setAdminPassword = (password: string) => {
  if (typeof window !== "undefined") window.sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
};

export const clearAdminPassword = () => {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
};

export const getAdminSupabase = () =>
  createClient<Database>(url || "https://placeholder.supabase.co", key || "placeholder-anon-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-admin-password": getStoredAdminPassword() },
    },
  });

export const adminSupabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getAdminSupabase() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});