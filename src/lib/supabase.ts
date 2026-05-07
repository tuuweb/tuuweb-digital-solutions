import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

export const isSupabaseConfigured = Boolean(
  url && anon && !url.includes("YOUR_PROJECT") && !anon.includes("YOUR_ANON_KEY")
);

// Stub seguro para que la app NO crashee si faltan las envs (preview, primer deploy, etc.)
function createStub(): SupabaseClient {
  const err = { message: "Supabase no configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY." };
  const q: any = {
    select: () => q, insert: () => q, update: () => q, delete: () => q,
    eq: () => q, order: () => q, limit: () => q, single: () => Promise.resolve({ data: null, error: err }),
    then: (res: any) => res({ data: [], error: null }),
  };
  return {
    from: () => q,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: null, error: err }),
      signUp: async () => ({ data: null, error: err }),
      signOut: async () => ({ error: null }),
    },
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : createStub();

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
