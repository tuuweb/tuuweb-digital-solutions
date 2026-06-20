import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { getStoredAdminPassword, setAdminPassword } from "@/lib/adminSupabase";
import Admin from "./Admin";

export default function AdminEmanuel() {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(() => Boolean(getStoredAdminPassword()));

  useEffect(() => {
    const saved = getStoredAdminPassword();
    if (!saved) return;

    (supabase.rpc as any)("admin_password_ok", { _password: saved }).then(({ data }: { data: boolean | null }) => {
      if (!data) setOk(false);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    const password = pwd.trim();
    const { data, error } = await (supabase.rpc as any)("admin_password_ok", { _password: password });

    setBusy(false);
    if (error || !data) {
      setErr("Contraseña incorrecta.");
      return;
    }

    setAdminPassword(password);
    setOk(true);
  };

  if (ok) return <Admin />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-brand-orange/30 bg-card p-8 shadow-elegant">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Panel <span className="text-gradient">Admin</span></h1>
            <p className="text-sm text-muted-foreground mt-2">Acceso privado</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Contraseña</Label>
              <Input
                type="password"
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setErr(""); }}
                autoFocus
                className="h-11 mt-1"
                required
              />
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