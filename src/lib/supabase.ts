import { supabase } from "@/integrations/supabase/client";

const url = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "").trim().replace(/\/+$/, "");
const key = ((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "").trim();

export const isSupabaseConfigured = Boolean(url && key && /^https?:\/\//.test(url));
export { supabase };

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
