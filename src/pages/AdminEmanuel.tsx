import { useState, useEffect } from "react";
import { Lock, ShieldCheck, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Admin from "./Admin";

const ADMIN_EMAIL = "emanueldavxd@gmail.com";
const ADMIN_PASSWORD = "55249964paola";

export default function AdminEmanuel() {
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Si ya está autenticado como admin, render directo
  useEffect(() => {
    if (user && isAdmin) return;
  }, [user, isAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    if (!isSupabaseConfigured) {
      setErr("Backend no configurado.");
      setBusy(false);
      return;
    }

    if (email !== ADMIN_EMAIL || pwd !== ADMIN_PASSWORD) {
      setErr("Credenciales incorrectas");
      setBusy(false);
      return;
    }

    // 1) Intento login
    let { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: pwd });

    // 2) Si no existe, lo creo (solo funciona la primera vez)
    if (signInErr) {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: { data: { full_name: "Emanuel Admin" } },
      });
      if (signUpErr && !signUpErr.message.toLowerCase().includes("already")) {
        setErr(signUpErr.message);
        setBusy(false);
        return;
      }
      const retry = await supabase.auth.signInWithPassword({ email, password: pwd });
      signInErr = retry.error;
    }

    if (signInErr) {
      setErr(signInErr.message);
      setBusy(false);
      return;
    }

    // 3) Reclamar rol admin
    try {
      await supabase.rpc("redeem_admin_code", { _code: pwd });
    } catch {}

    setBusy(false);
    // Recarga para que AuthContext reciba el nuevo rol
    window.location.reload();
  };

  if (loading) return <div className="container mx-auto py-20 text-center text-muted-foreground">Cargando...</div>;
  if (user && isAdmin) return <Admin />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-brand-orange/30 bg-card p-8 shadow-elegant">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Panel <span className="text-gradient">Admin</span></h1>
            <p className="text-sm text-muted-foreground mt-2">Acceso restringido</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Correo</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 mt-1" required />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Contraseña</Label>
              <Input type="password" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} autoFocus className="h-11 mt-1" required />
              {err && <p className="text-destructive text-xs mt-2">{err}</p>}
            </div>
            <Button type="submit" disabled={busy} className="w-full h-11 bg-gradient-primary text-primary-foreground">
              {busy ? "Verificando..." : "Entrar al panel"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
